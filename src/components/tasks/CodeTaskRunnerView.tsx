import React, { useState, useEffect } from 'react';
import type { CodeTask, FindErrorTask } from '../../types/task';
import { usePythonRunner } from '../../hooks/usePythonRunner';
import { TaskTestRunner } from '../../core/checker/testRunner';
import type { TaskTestResults } from '../../core/checker/testRunner';
import { CodeMirrorEditor } from '../editor/CodeMirrorEditor';
import { ConsoleOutput } from '../editor/ConsoleOutput';
import { TestResultsList } from './TestResultsList';
import { HintAccordion } from './HintAccordion';
import confetti from 'canvas-confetti';
import { soundManager } from '../../core/sound/soundEffects';
import { 
  Play, 
  CheckCircle2, 
  RotateCcw, 
  Code2, 
  Bug, 
  Loader2 
} from 'lucide-react';

interface CodeTaskRunnerViewProps {
  task: CodeTask | FindErrorTask;
  savedCode?: string;
  attempts: number;
  isCompleted: boolean;
  onCodeChange: (code: string) => void;
  onAttempt: () => void;
  onSuccess: () => void;
}

export const CodeTaskRunnerView: React.FC<CodeTaskRunnerViewProps> = ({
  task,
  savedCode,
  attempts,
  isCompleted: _isCompleted,
  onCodeChange,
  onAttempt,
  onSuccess,
}) => {
  const getInitialCode = () => {
    if (savedCode) return savedCode;
    if (task.type === 'find_error') return task.buggyCode;
    return task.starterCode || '# Напишите код здесь\n';
  };

  const [code, setCode] = useState<string>(getInitialCode);
  const [testResults, setTestResults] = useState<TaskTestResults | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [inputsQueue, setInputsQueue] = useState<string[]>([]);

  const {
    status,
    outputItems,
    lastResult,
    run,
    stop,
    clear,
    addInputToHistory,
  } = usePythonRunner();

  // Reset internal code when task changes
  useEffect(() => {
    const fresh = getInitialCode();
    setCode(fresh);
    setTestResults(null);
    clear();
  }, [task.id]);

  const handleChange = (val: string) => {
    setCode(val);
    onCodeChange(val);
  };

  const handleReset = () => {
    const original = task.type === 'find_error' ? task.buggyCode : (task.starterCode || '');
    setCode(original);
    onCodeChange(original);
    setTestResults(null);
    clear();
  };

  // Run code freely (manual experimentation)
  const handleRunOnly = async () => {
    onAttempt();
    await run(code, inputsQueue);
  };

  // Run formal test suite
  const handleCheckTests = async () => {
    onAttempt();
    setIsTesting(true);
    setTestResults(null);

    try {
      const results = await TaskTestRunner.runTests(code, task.testCases);
      setTestResults(results);

      if (results.allPassed) {
        soundManager.playSuccess();
        onSuccess();
        confetti({
          particleCount: 85,
          spread: 75,
          origin: { y: 0.7 },
          colors: ['#10b981', '#0ea5e9', '#f59e0b', '#8b5cf6'],
        });
      } else {
        soundManager.playError();
      }
    } catch (e) {
      console.error('Test run failed:', e);
      soundManager.playError();
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {task.type === 'find_error' ? (
            <span className="flex items-center gap-1.5 text-xs font-black text-rose-600 dark:text-rose-400">
              <Bug className="w-4 h-4" />
              <span>Режим: Исправление ошибки в коде</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-black text-slate-700 dark:text-slate-300">
              <Code2 className="w-4 h-4 text-emerald-500" />
              <span>Редактор решения (Python 3.12)</span>
            </span>
          )}
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
          title="Сбросить код к исходному варианту"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Сбросить код</span>
        </button>
      </div>

      {/* CodeMirror 6 Editor */}
      <div className="rounded-2xl overflow-hidden border-2 border-b-4 border-slate-200 dark:border-slate-800 shadow-xs">
        <CodeMirrorEditor
          value={code}
          onChange={handleChange}
          minHeight="170px"
          maxHeight="340px"
        />
      </div>

      {/* Buttons Bar in Duolingo 3D style */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <span className="text-xs font-bold text-slate-500">
          Попыток: <strong className="text-slate-800 dark:text-slate-200">{attempts}</strong>
        </span>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRunOnly}
            disabled={status === 'running' || isTesting}
            className="btn-3d-neutral flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs"
            title="Запустить код в консоли для ручной проверки"
          >
            <Play className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
            <span>Запустить в консоли</span>
          </button>

          <button
            onClick={handleCheckTests}
            disabled={status === 'running' || isTesting}
            className="btn-3d-green flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs shadow-md"
          >
            {isTesting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Проверка...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Проверить решение</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Automated Test Suite Results */}
      {testResults && (
        <TestResultsList results={testResults} />
      )}

      {/* Interactive Console Output */}
      <ConsoleOutput
        status={status}
        outputItems={outputItems}
        lastResult={lastResult}
        onStop={stop}
        onClear={clear}
        onSendInput={(val) => {
          addInputToHistory(val);
          setInputsQueue(prev => [...prev, val]);
        }}
      />

      {/* 3-Level Hints Accordion */}
      <HintAccordion
        hints={task.hints}
        solutionCode={task.solutionCode}
        attempts={attempts}
        unlockThreshold={task.solutionUnlockAttempts || 3}
      />
    </div>
  );
};
