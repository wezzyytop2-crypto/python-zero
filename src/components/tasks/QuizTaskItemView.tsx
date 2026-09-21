import React, { useState } from 'react';
import { HintAccordion } from './HintAccordion';
import confetti from 'canvas-confetti';
import { HelpCircle, CheckCircle2, XCircle } from 'lucide-react';

import { soundManager } from '../../core/sound/soundEffects';

interface QuizTaskItemViewProps {
  task: any;
  attempts: number;
  isCompleted: boolean;
  onAttempt: () => void;
  onSuccess: () => void;
}

export const QuizTaskItemView: React.FC<QuizTaskItemViewProps> = ({
  task,
  attempts,
  isCompleted,
  onAttempt,
  onSuccess,
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(isCompleted);

  const handleSelect = (idx: number) => {
    if (submitted) return;
    soundManager.playClick();
    setSelectedIdx(idx);
  };

  const handleCheck = () => {
    if (selectedIdx === null) return;
    onAttempt();
    setSubmitted(true);

    const isCorrect = task.correctIndices ? task.correctIndices.includes(selectedIdx) : selectedIdx === task.correctIndex;
    if (isCorrect) {
      soundManager.playSuccess();
      onSuccess();
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    } else {
      soundManager.playError();
    }
  };

  const handleReset = () => {
    soundManager.playClick();
    setSelectedIdx(null);
    setSubmitted(false);
  };

  return (
    <div className="space-y-4">
      <div className="p-4 sm:p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
            {task.question || task.instruction}
          </h4>
        </div>

        {task.codeSnippet && (
          <div className="rounded-xl bg-slate-950 p-3 font-mono text-xs sm:text-sm text-sky-200 border border-slate-800">
            <pre>{task.codeSnippet}</pre>
          </div>
        )}

        {/* Duolingo style options */}
        <div className="space-y-2.5 pt-1">
          {task.options?.map((opt: string, idx: number) => {
            const isSelected = selectedIdx === idx;
            const isRight = task.correctIndices ? task.correctIndices.includes(idx) : idx === task.correctIndex;
            const optionLetter = String.fromCharCode(65 + idx);

            let borderAndBg = 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 hover:border-brand-400 dark:hover:border-brand-500';
            let badgeStyle = 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300';

            if (submitted) {
              if (isRight) {
                borderAndBg = 'border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 font-bold';
                badgeStyle = 'bg-emerald-500 text-white';
              } else if (isSelected && !isRight) {
                borderAndBg = 'border-rose-500 bg-rose-500/10 text-rose-900 dark:text-rose-200 font-bold';
                badgeStyle = 'bg-rose-500 text-white';
              } else {
                borderAndBg = 'opacity-50 border-slate-200 dark:border-slate-800';
              }
            } else if (isSelected) {
              borderAndBg = 'border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500/30 font-bold';
              badgeStyle = 'bg-brand-500 text-white';
            }

            return (
              <button
                key={idx}
                disabled={submitted}
                onClick={() => handleSelect(idx)}
                className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 text-xs sm:text-sm ${borderAndBg}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${badgeStyle}`}>
                    {optionLetter}
                  </span>
                  <span>{opt}</span>
                </div>

                {submitted && (
                  <span>
                    {isRight ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    ) : isSelected ? (
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    ) : null}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback explanation */}
        {submitted && task.explanation && (
          <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs text-slate-700 dark:text-slate-300 leading-relaxed border border-slate-200 dark:border-slate-700">
            <strong className="block mb-1 text-slate-900 dark:text-white font-bold">💡 Пояснение:</strong>
            {task.explanation}
          </div>
        )}
      </div>

      {/* Footer Buttons */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500 font-semibold">
          Попыток: <strong className="text-slate-800 dark:text-slate-200 font-black">{attempts}</strong>
        </span>

        {!submitted ? (
          <button
            onClick={handleCheck}
            disabled={selectedIdx === null}
            className="btn-3d btn-3d-green px-6 py-2.5 rounded-xl text-white text-xs font-black uppercase tracking-wider disabled:opacity-40"
          >
            Проверить ответ
          </button>
        ) : (
          <button
            onClick={handleReset}
            className="btn-3d btn-3d-neutral px-5 py-2.5 rounded-xl text-slate-700 dark:text-slate-200 text-xs font-black uppercase tracking-wider"
          >
            Попробовать снова
          </button>
        )}
      </div>

      {/* Hints */}
      {task.hints && (
        <HintAccordion
          hints={task.hints}
          attempts={attempts}
          unlockThreshold={task.solutionUnlockAttempts || 2}
        />
      )}
    </div>
  );
};
