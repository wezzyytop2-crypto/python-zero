import React, { useState, useRef, useEffect } from 'react';
import type { WorkerStatus, ConsoleOutputItem, RunResult } from '../../types/runner';
import { FriendlyErrorCard } from './FriendlyErrorCard';
import { 
  Terminal, 
  Trash2, 
  Square, 
  CornerDownLeft, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  Info 
} from 'lucide-react';

interface ConsoleOutputProps {
  status: WorkerStatus;
  outputItems: ConsoleOutputItem[];
  lastResult: RunResult | null;
  onStop: () => void;
  onClear: () => void;
  onSendInput?: (input: string) => void;
  className?: string;
  defaultInputPrompt?: string;
}

export const ConsoleOutput: React.FC<ConsoleOutputProps> = ({
  status,
  outputItems,
  lastResult,
  onStop,
  onClear,
  onSendInput,
  className = '',
}) => {
  const [inputValue, setInputValue] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new output appears
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [outputItems, lastResult]);

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    if (onSendInput) {
      onSendInput(inputValue);
    }
    setInputValue('');
  };

  const isRunning = status === 'running';

  return (
    <div className={`rounded-2xl border border-slate-800 bg-slate-950 text-slate-200 flex flex-col overflow-hidden shadow-lg ${className}`}>
      {/* Console Header Bar */}
      <div className="h-10 px-4 bg-slate-900 border-b border-slate-800/90 flex items-center justify-between text-xs font-mono select-none">
        <div className="flex items-center gap-2.5">
          <Terminal className="w-4 h-4 text-brand-400" />
          <span className="font-bold text-slate-300">Терминал вывода</span>

          {/* Status Badge */}
          {status === 'loading' && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-sans">
              <Loader2 className="w-3 h-3 animate-spin" />
              Загрузка Pyodide...
            </span>
          )}
          {status === 'running' && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-sans">
              <Loader2 className="w-3 h-3 animate-spin" />
              Выполняется (таймаут 5 сек)
            </span>
          )}
          {status === 'ready' && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Готов
            </span>
          )}
          {status === 'error' && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              Ошибка
            </span>
          )}
        </div>

        {/* Console Action Buttons */}
        <div className="flex items-center gap-2">
          {lastResult?.executionTimeMs !== undefined && lastResult.executionTimeMs > 0 && (
            <span className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400">
              <Clock className="w-3 h-3 text-slate-500" />
              {lastResult.executionTimeMs} мс
            </span>
          )}

          {isRunning && (
            <button
              onClick={onStop}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors shadow-xs"
              title="Принудительно остановить выполнение"
            >
              <Square className="w-3 h-3 fill-white" />
              <span>Остановить</span>
            </button>
          )}

          <button
            onClick={onClear}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Очистить вывод"
            aria-label="Очистить вывод"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Output Stream Area */}
      <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-2 min-h-[140px] max-h-[360px] leading-relaxed">
        {outputItems.length === 0 && !lastResult?.errorExplanation ? (
          <div className="h-full flex items-center justify-center text-slate-600 text-[11px] select-none py-6">
            Нажмите «Запустить код», чтобы увидеть результат работы программы
          </div>
        ) : (
          outputItems.map((item) => {
            if (item.type === 'stderr') {
              return (
                <div key={item.id} className="text-rose-400 whitespace-pre-wrap">
                  {item.text}
                </div>
              );
            }
            if (item.type === 'input-echo') {
              return (
                <div key={item.id} className="text-amber-400 font-bold whitespace-pre-wrap flex items-center gap-1.5">
                  <span className="text-slate-500 text-[10px]">ввод &gt;</span>
                  {item.text}
                </div>
              );
            }
            return (
              <div key={item.id} className="text-emerald-300 whitespace-pre-wrap">
                {item.text}
              </div>
            );
          })
        )}

        {/* Friendly Russian Error Card */}
        {lastResult?.errorExplanation && (
          <div className="pt-2">
            <FriendlyErrorCard
              error={lastResult.errorExplanation}
              rawTraceback={lastResult.stderr}
            />
          </div>
        )}

        {/* Success indicator if clean finish */}
        {lastResult && lastResult.success && outputItems.length > 0 && (
          <div className="pt-2 flex items-center gap-1.5 text-[11px] text-emerald-500/80">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Программа успешно завершена</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Interactive Input Bar (for input()) */}
      {onSendInput && (
        <form
          onSubmit={handleInputSubmit}
          className="p-2 bg-slate-900/90 border-t border-slate-800/80 flex items-center gap-2"
        >
          <div className="flex items-center gap-1 text-slate-400 text-xs px-2 select-none">
            <Info className="w-3.5 h-3.5 text-brand-400" />
            <span>input():</span>
          </div>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Введите данные для функции input() и нажмите Enter..."
            className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500 font-mono"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="flex items-center gap-1 px-3 py-1.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:hover:bg-brand-600 text-white rounded-lg text-xs font-bold transition-all"
          >
            <span>Ввести</span>
            <CornerDownLeft className="w-3 h-3" />
          </button>
        </form>
      )}
    </div>
  );
};
