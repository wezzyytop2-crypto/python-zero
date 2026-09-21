import React, { useState } from 'react';
import type { TaskTestResults, TestCaseResult } from '../../core/checker/testRunner';
import { 
  CheckCircle2, 
  XCircle, 
  Lock, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Clock 
} from 'lucide-react';

interface TestResultsListProps {
  results: TaskTestResults;
  className?: string;
}

export const TestResultsList: React.FC<TestResultsListProps> = ({
  results,
  className = '',
}) => {
  const [expandedTestId, setExpandedTestId] = useState<string | null>(
    results.firstFailedIndex >= 0 ? results.details[results.firstFailedIndex]?.testCaseId : null
  );

  const percent = Math.round((results.passedTests / results.totalTests) * 100);

  return (
    <div className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs space-y-4 ${className}`}>
      {/* Header & Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Результаты автоматической проверки
            </h4>
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
              results.allPassed
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
            }`}>
              {results.passedTests} из {results.totalTests} пройдено ({percent}%)
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {results.allPassed
              ? 'Великолепно! Ваша программа справилась со всеми тестовыми сценариями.'
              : 'Программа не прошла некоторые проверки. Изучите расхождения ниже.'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full sm:w-36 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              results.allPassed ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Test Cases List */}
      <div className="space-y-2.5">
        {results.details.map((tc: TestCaseResult, idx: number) => {
          const isExpanded = expandedTestId === tc.testCaseId;
          const toggleExpand = () => setExpandedTestId(isExpanded ? null : tc.testCaseId);

          return (
            <div
              key={tc.testCaseId || idx}
              className={`rounded-xl border transition-all ${
                tc.passed
                  ? 'border-emerald-200/60 dark:border-emerald-950/80 bg-emerald-50/20 dark:bg-emerald-950/10'
                  : 'border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20'
              }`}
            >
              {/* Test Header */}
              <button
                onClick={toggleExpand}
                className="w-full p-3 flex items-center justify-between gap-3 text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {tc.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                  )}

                  <div className="flex items-center gap-2 min-w-0 truncate">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      Тест {idx + 1}: {tc.description || 'Проверка вывода'}
                    </span>
                    {tc.isHidden && (
                      <span className="flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                        <Lock className="w-2.5 h-2.5" /> Скрытый
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-slate-400">
                  {tc.executionTimeMs > 0 && (
                    <span className="flex items-center gap-1 text-[10px]">
                      <Clock className="w-2.5 h-2.5" />
                      {tc.executionTimeMs}мс
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </button>

              {/* Expanded Test Details */}
              {isExpanded && (
                <div className="px-3 pb-3 pt-1 border-t border-slate-200/40 dark:border-slate-800/60 space-y-2.5 text-xs font-mono">
                  {tc.isHidden ? (
                    <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-sans text-xs">
                      {tc.passed ? (
                        <span>Скрытый тест пройден успешно. Входные параметры скрыты.</span>
                      ) : (
                        <div className="space-y-1">
                          <p className="font-bold text-rose-700 dark:text-rose-300">
                            Скрытый тест не прошёл.
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Входные и ожидаемые данные скрыты для честной проверки. Подумайте над крайними случаями вашей программы (пустые значения, большие числа, регистр букв).
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* Stdin if any */}
                      {tc.stdin && (
                        <div>
                          <span className="text-[10px] text-slate-400 font-sans block mb-0.5">
                            Входные данные (stdin):
                          </span>
                          <div className="p-2 rounded-lg bg-slate-950 text-amber-300 border border-slate-800">
                            <pre className="whitespace-pre-wrap">{tc.stdin}</pre>
                          </div>
                        </div>
                      )}

                      {/* Expected vs Actual */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans block mb-0.5">
                            Ожидаемый вывод:
                          </span>
                          <div className="p-2 rounded-lg bg-slate-950 text-emerald-300 border border-slate-800 min-h-[44px]">
                            <pre className="whitespace-pre-wrap">{tc.expectedStdout || '(пусто)'}</pre>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-sans block mb-0.5">
                            Фактический вывод вашей программы:
                          </span>
                          <div className="p-2 rounded-lg bg-slate-950 text-slate-200 border border-slate-800 min-h-[44px]">
                            <pre className="whitespace-pre-wrap">{tc.actualStdout || '(пусто)'}</pre>
                          </div>
                        </div>
                      </div>

                      {/* Diff Explanation */}
                      {tc.diff?.hasDifference && (
                        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 font-sans text-xs flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          <span>{tc.diff.explanation}</span>
                        </div>
                      )}

                      {tc.errorMessage && (
                        <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-300 font-sans text-xs">
                          {tc.errorMessage}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
