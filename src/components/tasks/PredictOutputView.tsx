import React, { useState } from 'react';
import type { PredictOutputTask } from '../../types/task';
import { HintAccordion } from './HintAccordion';
import confetti from 'canvas-confetti';
import { HelpCircle, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react';
import { soundManager } from '../../core/sound/soundEffects';

interface PredictOutputViewProps {
  task: PredictOutputTask;
  attempts: number;
  isCompleted: boolean;
  onAttempt: () => void;
  onSuccess: () => void;
}

export const PredictOutputView: React.FC<PredictOutputViewProps> = ({
  task,
  attempts,
  isCompleted: _isCompleted,
  onAttempt,
  onSuccess,
}) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);

  const handleCheck = () => {
    onAttempt();
    const cleanUser = userAnswer.trim();
    const cleanExpected = task.expectedAnswer.trim();

    if (cleanUser === cleanExpected) {
      soundManager.playSuccess();
      setFeedback({
        isCorrect: true,
        message: 'Абсолютно верно! Отличная внимательность.',
      });
      onSuccess();
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.7 },
      });
    } else if (cleanUser.toLowerCase() === cleanExpected.toLowerCase()) {
      soundManager.playError();
      setFeedback({
        isCorrect: false,
        message: 'Почти правильно, но обратите внимание на регистр букв (заглавные/строчные).',
      });
    } else {
      soundManager.playError();
      setFeedback({
        isCorrect: false,
        message: 'Не совпадает с выводом программы. Попробуйте еще раз или откройте подсказку!',
      });
    }
  };

  const handleReset = () => {
    setUserAnswer('');
    setFeedback(null);
  };

  return (
    <div className="space-y-4">
      {/* Code Snippet Box */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-purple-500" />
          <span>Внимательно изучите данный фрагмент кода:</span>
        </span>

        <div className="p-4 rounded-2xl bg-slate-950 text-sky-200 font-mono text-xs sm:text-sm border border-slate-800 shadow-inner overflow-x-auto">
          <pre>{task.code}</pre>
        </div>
      </div>

      {/* Answer Input Card */}
      <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
        <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
          Что именно напечатает эта программа в консоль?
        </label>

        <div className="flex gap-2">
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCheck();
            }}
            placeholder="Введите точный текст вывода..."
            className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500 font-mono text-slate-900 dark:text-white"
          />

          <button
            onClick={handleCheck}
            disabled={!userAnswer.trim()}
            className="btn-3d btn-3d-green px-6 py-2.5 rounded-xl text-white text-xs font-black uppercase tracking-wider disabled:opacity-40"
          >
            Проверить
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 transition-all ${
              feedback.isCorrect
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-300/80 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-300/80 dark:border-rose-800'
            }`}
          >
            {feedback.isCorrect ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-bold block mb-0.5">{feedback.message}</span>
              {feedback.isCorrect && task.explanation && (
                <p className="text-[11px] text-emerald-700/90 dark:text-emerald-300/90 mt-1 leading-relaxed">
                  <strong>Объяснение:</strong> {task.explanation}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Attempts & Reset */}
      <div className="flex items-center justify-between text-[11px] text-slate-500">
        <span>
          Сделано попыток: <strong className="text-slate-800 dark:text-slate-200">{attempts}</strong>
        </span>

        {userAnswer && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Сбросить ответ</span>
          </button>
        )}
      </div>

      {/* 3-Level Hints */}
      <HintAccordion
        hints={task.hints}
        attempts={attempts}
        unlockThreshold={task.solutionUnlockAttempts || 2}
      />
    </div>
  );
};
