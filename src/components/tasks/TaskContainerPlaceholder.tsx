import React, { useState } from 'react';
import type { TaskItem } from '../../types/task';
import { useLessonProgress } from '../../hooks/useLessonProgress';
import { 
  Code2, 
  Bug, 
  HelpCircle, 
  CheckCircle2, 
  Lightbulb, 
  Play, 
  Terminal 
} from 'lucide-react';

interface TaskContainerPlaceholderProps {
  tasks: TaskItem[];
  lessonId: string;
}

export const TaskContainerPlaceholder: React.FC<TaskContainerPlaceholderProps> = ({
  tasks,
}) => {
  const [activeTaskIndex, setActiveTaskIndex] = useState(0);
  const { isTaskCompleted } = useLessonProgress();

  if (!tasks || tasks.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-slate-400 text-xs">
        В этом уроке нет практических заданий
      </div>
    );
  }

  const currentTask = tasks[activeTaskIndex] || tasks[0];
  const isDone = isTaskCompleted(currentTask.id);

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'find_error':
        return <Bug className="w-3.5 h-3.5 text-rose-500" />;
      case 'predict_output':
        return <HelpCircle className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <Code2 className="w-3.5 h-3.5 text-brand-500" />;
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-900/5 dark:bg-slate-950/40">
      {/* Task Selector Tabs */}
      <div className="p-2 border-b border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs flex items-center gap-1.5 overflow-x-auto">
        {tasks.map((task, idx) => {
          const active = idx === activeTaskIndex;
          const completed = isTaskCompleted(task.id);

          return (
            <button
              key={task.id}
              onClick={() => setActiveTaskIndex(idx)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                active
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-300 shadow-xs border border-brand-200/60 dark:border-brand-800/60'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850'
              }`}
            >
              {completed ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              ) : (
                getTaskIcon(task.type)
              )}
              <span>Задание {idx + 1}</span>
            </button>
          );
        })}
      </div>

      {/* Task Details & Instruction */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300">
              {currentTask.type === 'find_error' ? 'Исправление ошибки' : currentTask.type === 'predict_output' ? 'Предсказание' : 'Код-задача'}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              currentTask.difficulty === 'easy' 
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
            }`}>
              {currentTask.difficulty === 'easy' ? 'Легко' : 'Средне'}
            </span>
          </div>

          {isDone && (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" /> Решено!
            </span>
          )}
        </div>

        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
          {currentTask.title}
        </h3>

        <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
          {currentTask.instruction}
        </div>
      </div>

      {/* Code Editor & Console Preview Area */}
      <div className="flex-1 flex flex-col p-4 space-y-3 overflow-y-auto">
        <div className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Code2 className="w-4 h-4 text-brand-500" />
              <span>Редактор кода (CodeMirror 6)</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Python 3.12 (Pyodide)</span>
          </div>

          <div className="my-4 p-4 rounded-xl bg-slate-950 font-mono text-xs text-sky-200 border border-slate-800">
            <pre>
              {currentTask.type === 'find_error'
                ? currentTask.buggyCode
                : currentTask.type === 'code'
                ? currentTask.starterCode || '# Напишите ваш код здесь\nprint("Здравствуй, Python!")'
                : currentTask.type === 'predict_output'
                ? currentTask.code
                : '# Редактор готов к работе'}
            </pre>
          </div>

          {/* 3-level Hint Preview */}
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Система подсказок (Уровень 1 из 3):</span>
            </div>
            <p className="text-amber-700 dark:text-amber-400 pl-5">
              {currentTask.hints[0]}
            </p>
          </div>
        </div>

        {/* Console Preview */}
        <div className="h-32 rounded-2xl border border-slate-800 bg-slate-950 p-3 text-xs font-mono text-slate-300 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-1.5">
            <div className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-brand-400" />
              <span>Консоль вывода (stdout / stderr / input)</span>
            </div>
            <span className="text-[10px] text-emerald-400">Готов к запуску</span>
          </div>
          <div className="text-slate-400 text-xs py-2">
            [Pyodide Web Worker готов к подключению на Этапе 3]
          </div>
          <div className="flex justify-end gap-2 pt-1 border-t border-slate-900">
            <button className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600/20 text-emerald-400 text-xs font-semibold">
              <Play className="w-3 h-3 fill-emerald-400" /> Запустить код
            </button>
            <button className="flex items-center gap-1 px-3 py-1 rounded-lg bg-brand-600 text-white text-xs font-semibold">
              <CheckCircle2 className="w-3 h-3" /> Проверить решение
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
