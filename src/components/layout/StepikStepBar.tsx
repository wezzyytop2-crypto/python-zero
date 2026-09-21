import React from 'react';
import { soundManager } from '../../core/sound/soundEffects';
import { 
  BookOpen, 
  Code2, 
  HelpCircle, 
  ExternalLink, 
  Check, 
  Columns2, 
  Maximize2 
} from 'lucide-react';
import type { TaskItem } from '../../types/task';

interface StepikStepBarProps {
  activeTab: 'theory' | 'tasks' | 'quiz' | 'stepik';
  onTabChange: (tab: 'theory' | 'tasks' | 'quiz' | 'stepik') => void;
  tasks: TaskItem[];
  activeTaskIndex: number;
  onSelectTaskIndex: (index: number) => void;
  isTaskCompleted: (taskId: string) => boolean;
  hasQuiz: boolean;
  isQuizCompleted: boolean;
  hasStepik: boolean;
  isSplitMode: boolean;
  onToggleSplitMode: () => void;
}

export const StepikStepBar: React.FC<StepikStepBarProps> = ({
  activeTab,
  onTabChange,
  tasks,
  activeTaskIndex,
  onSelectTaskIndex,
  isTaskCompleted,
  hasQuiz,
  isQuizCompleted,
  hasStepik,
  isSplitMode,
  onToggleSplitMode,
}) => {
  return (
    <div className="w-full bg-white dark:bg-[#1f2e35] border-b-2 border-[#e5e5e5] dark:border-[#37464f] px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 select-none">
      {/* Left: Scrollable Stepik Steps Ribbon */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
        {/* Step 1: Theory */}
        <button
          onClick={() => {
            soundManager.playClick();
            onTabChange('theory');
          }}
          className={`btn-3d flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-xs font-black transition-all ${
            activeTab === 'theory'
              ? 'btn-3d-blue -translate-y-0.5'
              : 'btn-3d-neutral text-slate-700 dark:text-slate-300'
          }`}
          title="Шаг 1: Теория урока"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Теория</span>
        </button>

        {/* Step Separator */}
        <div className="w-3 h-0.5 bg-slate-200 dark:bg-slate-700 rounded-full shrink-0" />

        {/* Practical Task Steps (1..N) */}
        {tasks.map((task, idx) => {
          const isDone = isTaskCompleted(task.id);
          const isCurrent = activeTab === 'tasks' && activeTaskIndex === idx;

          return (
            <button
              key={task.id}
              onClick={() => {
                soundManager.playClick();
                onTabChange('tasks');
                onSelectTaskIndex(idx);
              }}
              className={`btn-3d relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-2xl text-xs font-black transition-all shrink-0 ${
                isCurrent
                  ? 'btn-3d-green -translate-y-0.5 ring-2 ring-[#58cc02]/40'
                  : isDone
                  ? 'bg-emerald-500/15 text-[#46a302] dark:text-[#58cc02] border-2 border-b-4 border-emerald-400/40 hover:bg-emerald-500/25'
                  : 'btn-3d-neutral text-slate-700 dark:text-slate-300'
              }`}
              title={`Задание ${idx + 1}: ${task.title} (${isDone ? 'Решено' : 'Не решено'})`}
            >
              {isDone ? (
                <Check className="w-4 h-4 stroke-[3.5] text-[#58cc02]" />
              ) : (
                <div className="flex items-center gap-0.5">
                  <Code2 className="w-3 h-3 opacity-60" />
                  <span>{idx + 1}</span>
                </div>
              )}

              {/* Solved green indicator dot on current active */}
              {isDone && isCurrent && (
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-white dark:bg-slate-900 border-2 border-[#58cc02]"></span>
              )}
            </button>
          );
        })}

        {/* Step Separator */}
        {hasQuiz && (
          <>
            <div className="w-3 h-0.5 bg-slate-200 dark:bg-slate-700 rounded-full shrink-0" />

            {/* Quiz Step */}
            <button
              onClick={() => {
                soundManager.playClick();
                onTabChange('quiz');
              }}
              className={`btn-3d flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-xs font-black transition-all shrink-0 ${
                activeTab === 'quiz'
                  ? 'btn-3d-amber -translate-y-0.5'
                  : isQuizCompleted
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-2 border-b-4 border-amber-400/40'
                  : 'btn-3d-neutral text-slate-700 dark:text-slate-300'
              }`}
              title="Финальный шаг: Тест"
            >
              {isQuizCompleted ? (
                <Check className="w-3.5 h-3.5 stroke-[3.5] text-[#58cc02]" />
              ) : (
                <HelpCircle className="w-3.5 h-3.5" />
              )}
              <span>Тест</span>
            </button>
          </>
        )}

        {/* Stepik Step */}
        {hasStepik && (
          <button
            onClick={() => {
              soundManager.playClick();
              onTabChange('stepik');
            }}
            className={`btn-3d flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-black transition-all shrink-0 ${
              activeTab === 'stepik'
                ? 'btn-3d-blue'
                : 'btn-3d-neutral text-slate-500 hover:text-teal-600'
            }`}
            title="Открыть этот шаг на Stepik"
          >
            <ExternalLink className="w-3 h-3" />
            <span className="hidden sm:inline">Stepik</span>
          </button>
        )}
      </div>

      {/* Right: Split screen toggle on wide screens */}
      <div className="hidden xl:flex items-center gap-2">
        <button
          onClick={onToggleSplitMode}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all border-2 border-b-4 active:translate-y-1 active:border-b-2 select-none ${
            isSplitMode
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-400/40'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
          }`}
          title={isSplitMode ? 'Режим одной вкладки' : 'Раздельный экран: Теория слева, Практика справа'}
        >
          {isSplitMode ? <Maximize2 className="w-3.5 h-3.5" /> : <Columns2 className="w-3.5 h-3.5" />}
          <span>{isSplitMode ? 'Вкладки' : '2 экрана'}</span>
        </button>
      </div>
    </div>
  );
};
