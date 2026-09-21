import React, { useState } from 'react';
import { Lightbulb, KeyRound, Lock, ChevronDown, ChevronUp } from 'lucide-react';

interface HintAccordionProps {
  hints: [string, string, string];
  solutionCode?: string;
  attempts: number;
  unlockThreshold?: number;
}

export const HintAccordion: React.FC<HintAccordionProps> = ({
  hints,
  solutionCode,
  attempts,
  unlockThreshold = 3,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);

  const canUnlockSolution = attempts >= unlockThreshold;
  const remainingAttempts = Math.max(0, unlockThreshold - attempts);

  return (
    <div className="rounded-2xl border border-amber-300/80 dark:border-amber-900/60 bg-gradient-to-br from-amber-50/70 to-orange-50/40 dark:from-amber-950/30 dark:to-orange-950/20 overflow-hidden shadow-xs">
      {/* Accordion Toggle Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-amber-100/40 dark:hover:bg-amber-900/30 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
              Система подсказок (3 уровня)
            </h4>
            <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80">
              {isOpen ? 'Нажмите, чтобы скрыть подсказки' : 'Застряли? Получите намёк на решение'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedLevel > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
              Уровень {selectedLevel}
            </span>
          )}
          {isOpen ? <ChevronUp className="w-4 h-4 text-amber-600" /> : <ChevronDown className="w-4 h-4 text-amber-600" />}
        </div>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="p-4 pt-2 border-t border-amber-200/60 dark:border-amber-900/40 space-y-3 animate-in fade-in duration-200">
          {/* Level Switcher Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedLevel(1)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedLevel === 1
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-white/80 dark:bg-slate-800/80 text-amber-800 dark:text-amber-200 hover:bg-white'
              }`}
            >
              1. Намёк
            </button>

            <button
              onClick={() => setSelectedLevel(2)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedLevel === 2
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-white/80 dark:bg-slate-800/80 text-amber-800 dark:text-amber-200 hover:bg-white'
              }`}
            >
              2. Детали
            </button>

            <button
              disabled={!canUnlockSolution}
              onClick={() => setSelectedLevel(3)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedLevel === 3
                  ? 'bg-amber-600 text-white shadow-xs'
                  : !canUnlockSolution
                  ? 'opacity-40 bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-white/80 dark:bg-slate-800/80 text-amber-800 dark:text-amber-200 hover:bg-white'
              }`}
              title={
                !canUnlockSolution
                  ? `Сделайте ещё ${remainingAttempts} попытки для открытия решения`
                  : 'Открыть образец решения'
              }
            >
              {!canUnlockSolution ? <Lock className="w-3 h-3" /> : <KeyRound className="w-3 h-3" />}
              <span>3. Решение</span>
            </button>
          </div>

          {/* Hint Body */}
          {selectedLevel === 0 ? (
            <p className="text-xs text-slate-600 dark:text-slate-400 py-1">
              Выберите уровень подсказки выше. Рекомендуется начинать с «1. Намёк», чтобы решить задачу самостоятельно.
            </p>
          ) : selectedLevel === 1 ? (
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-900/60 text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
              <span className="font-bold text-amber-600 dark:text-amber-400 block mb-1">
                💡 Намёк (Уровень 1):
              </span>
              {hints[0]}
            </div>
          ) : selectedLevel === 2 ? (
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-900/60 text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
              <span className="font-bold text-amber-600 dark:text-amber-400 block mb-1">
                🔍 Детали (Уровень 2):
              </span>
              {hints[1] || hints[0]}
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-900/60 text-xs text-slate-800 dark:text-slate-200 leading-relaxed space-y-2">
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4" />
                Образец решения (Уровень 3):
              </span>
              <p>{hints[2] || 'Один из верных вариантов решения задачи:'}</p>

              {solutionCode && (
                <div className="rounded-lg bg-slate-950 p-3 font-mono text-xs text-emerald-300 border border-slate-800 overflow-x-auto">
                  <pre>{solutionCode}</pre>
                </div>
              )}
            </div>
          )}

          {!canUnlockSolution && (
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              * Защита от списывания: полное решение откроется после {unlockThreshold} попыток решения (вы сделали {attempts}).
            </p>
          )}
        </div>
      )}
    </div>
  );
};
