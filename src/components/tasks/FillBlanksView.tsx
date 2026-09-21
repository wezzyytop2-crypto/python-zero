import React, { useState } from 'react';
import type { FillBlanksTask } from '../../types/task';
import { TaskTestRunner } from '../../core/checker/testRunner';
import type { TaskTestResults } from '../../core/checker/testRunner';
import { TestResultsList } from './TestResultsList';
import { HintAccordion } from './HintAccordion';
import confetti from 'canvas-confetti';
import { CheckCircle2, RotateCcw, HelpCircle, Code2 } from 'lucide-react';

import { soundManager } from '../../core/sound/soundEffects';

interface FillBlanksViewProps {
  task: FillBlanksTask;
  attempts: number;
  isCompleted: boolean;
  onAttempt: () => void;
  onSuccess: () => void;
}

export const FillBlanksView: React.FC<FillBlanksViewProps> = ({
  task,
  attempts,
  isCompleted: _isCompleted,
  onAttempt,
  onSuccess,
}) => {
  // Store user inputs for each blank: blankId -> string
  const [blankValues, setBlankValues] = useState<Record<string, string>>({});
  const [testResults, setTestResults] = useState<TaskTestResults | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleBlankChange = (blankId: string, value: string) => {
    setBlankValues(prev => ({ ...prev, [blankId]: value }));
  };

  // Reconstruct full code by substituting blanks into template
  const getAssembledCode = () => {
    let result = task.templateCode;
    for (const blank of task.blanks) {
      const val = blankValues[blank.id] || blank.placeholder || '...';
      result = result.replaceAll(`___${blank.id}___`, val);
    }
    return result;
  };

  const assembledCode = getAssembledCode();
  const allBlanksFilled = task.blanks.every(b => !!blankValues[b.id]?.trim());

  const handleCheck = async () => {
    soundManager.playClick();
    onAttempt();
    setIsRunning(true);
    setTestResults(null);

    try {
      const results = await TaskTestRunner.runTests(assembledCode, task.testCases);
      setTestResults(results);

      if (results.allPassed) {
        soundManager.playSuccess();
        onSuccess();
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.7 },
        });
      } else {
        soundManager.playError();
      }
    } catch (e) {
      soundManager.playError();
      console.error('FillBlanks check error:', e);
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setBlankValues({});
    setTestResults(null);
  };

  // Render template with inline input fields
  const renderInteractiveTemplate = () => {
    // Split template code by blanks regex
    const parts = task.templateCode.split(/(___[A-Za-z0-9_]+___)/g);

    return (
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-sky-200 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto">
        <pre className="whitespace-pre-wrap flex flex-wrap items-center gap-y-2">
          {parts.map((part, idx) => {
            const match = part.match(/^___([A-Za-z0-9_]+)___$/);
            if (match) {
              const blankId = match[1];
              const blankDef = task.blanks.find(b => b.id === blankId);
              const val = blankValues[blankId] || '';

              return (
                <span key={idx} className="inline-block mx-1">
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => handleBlankChange(blankId, e.target.value)}
                    placeholder={blankDef?.placeholder || 'введите...'}
                    className="px-2.5 py-1 text-xs rounded-lg bg-slate-900 border-2 border-brand-500 text-amber-300 font-bold font-mono focus:outline-none focus:border-amber-400 placeholder:text-slate-600 shadow-inner"
                    style={{ minWidth: '90px' }}
                  />
                </span>
              );
            }
            return <span key={idx}>{part}</span>;
          })}
        </pre>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Interactive Code Template */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-brand-500" />
            <span>Заполните пропущенные фрагменты кода:</span>
          </span>

          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Очистить поля</span>
          </button>
        </div>

        {renderInteractiveTemplate()}
      </div>

      {/* Preview of assembled code */}
      <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
        <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
          <Code2 className="w-3.5 h-3.5 text-brand-500" />
          Итоговый код к запуску:
        </span>
        <pre className="font-mono text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">
          {assembledCode}
        </pre>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-slate-500">
          Попыток: <strong className="text-slate-800 dark:text-slate-200">{attempts}</strong>
        </span>

        <button
          onClick={handleCheck}
          disabled={isRunning || !allBlanksFilled}
          className="btn-3d btn-3d-green flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-xs font-black uppercase tracking-wider disabled:opacity-40"
        >
          {isRunning ? (
            <span>Проверка...</span>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Проверить решение</span>
            </>
          )}
        </button>
      </div>

      {/* Test Results */}
      {testResults && <TestResultsList results={testResults} />}

      {/* Hints */}
      <HintAccordion
        hints={task.hints}
        attempts={attempts}
        unlockThreshold={task.solutionUnlockAttempts || 2}
      />
    </div>
  );
};
