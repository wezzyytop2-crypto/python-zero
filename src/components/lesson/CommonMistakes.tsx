import React from 'react';
import type { CommonMistake } from '../../types/course';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface CommonMistakesProps {
  mistakes: CommonMistake[];
}

export const CommonMistakes: React.FC<CommonMistakesProps> = ({ mistakes }) => {
  if (!mistakes || mistakes.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Частые ошибки новичков
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Изучите эти типичные грабли, чтобы не наступать на них при решении задач
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3.5">
        {mistakes.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl border border-amber-200/60 dark:border-amber-900/40 bg-gradient-to-br from-amber-500/5 to-rose-500/5 dark:from-amber-950/20 dark:to-rose-950/20 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 font-mono">
                {item.errorType}
              </span>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
              {item.explanation}
            </p>

            {/* Before / After comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-200">
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 block mb-1 font-sans flex items-center gap-1">
                  ✕ Как не надо:
                </span>
                <pre className="whitespace-pre-wrap">{item.mistakeCode}</pre>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block mb-1 font-sans flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 inline" /> Как правильно:
                </span>
                <pre className="whitespace-pre-wrap">{item.fixCode}</pre>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
