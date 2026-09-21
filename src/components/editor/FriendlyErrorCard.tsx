import React, { useState } from 'react';
import type { FriendlyError } from '../../core/runner/errorParser';
import { AlertTriangle, Lightbulb, ChevronDown, ChevronUp, Bug } from 'lucide-react';

interface FriendlyErrorCardProps {
  error: FriendlyError;
  rawTraceback?: string;
}

export const FriendlyErrorCard: React.FC<FriendlyErrorCardProps> = ({
  error,
  rawTraceback,
}) => {
  const [showRaw, setShowRaw] = useState(false);

  return (
    <div className="rounded-2xl border border-rose-300/80 dark:border-rose-900/60 bg-gradient-to-br from-rose-50/90 to-amber-50/50 dark:from-rose-950/40 dark:to-amber-950/20 p-4 sm:p-5 shadow-sm space-y-3.5 animate-in fade-in duration-300">
      {/* Header with Icon + Title + Line Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-extrabold text-rose-900 dark:text-rose-200 leading-tight">
              {error.friendlyTitle}
            </h4>
            <span className="text-[11px] font-mono font-semibold text-rose-600 dark:text-rose-400">
              {error.type}
            </span>
          </div>
        </div>

        {error.lineNumber !== undefined && (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-200/70 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 font-mono whitespace-nowrap shadow-xs">
            Строка {error.lineNumber}
          </span>
        )}
      </div>

      {/* Human Explanation */}
      <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
        {error.friendlyDescription}
      </p>

      {/* Actionable Tips */}
      {error.tips && error.tips.length > 0 && (
        <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-rose-200/50 dark:border-rose-900/40 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>Как это исправить:</span>
          </div>
          <ul className="space-y-1 pl-5 list-disc text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {error.tips.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Toggle raw Python traceback */}
      {rawTraceback && (
        <div className="pt-1">
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors"
          >
            <Bug className="w-3 h-3" />
            <span>{showRaw ? 'Скрыть технический отчет Python' : 'Показать технический отчет (traceback)'}</span>
            {showRaw ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showRaw && (
            <div className="mt-2 p-3 rounded-xl bg-slate-950 font-mono text-[11px] text-rose-300 border border-slate-800 overflow-x-auto">
              <pre className="whitespace-pre-wrap">{rawTraceback}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
