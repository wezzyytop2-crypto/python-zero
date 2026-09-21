import React, { useState, useEffect } from 'react';
import type { TaskItem } from '../../types/task';
import { useLessonProgress } from '../../hooks/useLessonProgress';
import { soundManager } from '../../core/sound/soundEffects';
import { CodeTaskRunnerView } from './CodeTaskRunnerView';
import { PredictOutputView } from './PredictOutputView';
import { FillBlanksView } from './FillBlanksView';
import { QuizTaskItemView } from './QuizTaskItemView';
import { 
  Code2, 
  Bug, 
  HelpCircle, 
  CheckCircle2, 
  Edit3, 
  CheckSquare, 
  Sparkles, 
  ArrowRight 
} from 'lucide-react';

interface TaskContainerProps {
  tasks: TaskItem[];
  lessonId: string;
  activeTaskIndex?: number;
  onSelectTaskIndex?: (idx: number) => void;
  onGoToQuiz?: () => void;
}

export const TaskContainer: React.FC<TaskContainerProps> = ({
  tasks,
  activeTaskIndex: controlledIndex,
  onSelectTaskIndex: setControlledIndex,
  onGoToQuiz,
}) => {
  const [internalIndex, setInternalIndex] = useState(0);
  const activeTaskIndex = controlledIndex !== undefined ? controlledIndex : internalIndex;
  
  const handleSelectTask = (idx: number) => {
    soundManager.playClick();
    if (setControlledIndex) {
      setControlledIndex(idx);
    } else {
      setInternalIndex(idx);
    }
  };

  const currentTask = tasks[activeTaskIndex] || tasks[0];

  const {
    isTaskCompleted,
    markTaskDone,
    saveCode,
    getSavedCode,
    recordAttempt,
    getTaskAttempts,
  } = useLessonProgress();

  const [showCelebrationSheet, setShowCelebrationSheet] = useState(false);

  // Reset celebration sheet when switching tasks
  useEffect(() => {
    setShowCelebrationSheet(false);
  }, [activeTaskIndex]);

  if (!tasks || tasks.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-slate-400 text-xs">
        В этом уроке нет практических заданий
      </div>
    );
  }

  const isDone = isTaskCompleted(currentTask.id);
  const attempts = getTaskAttempts(currentTask.id);
  const hasNextTask = activeTaskIndex < tasks.length - 1;

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'find_error':
        return <Bug className="w-3.5 h-3.5 text-rose-500" />;
      case 'predict_output':
        return <HelpCircle className="w-3.5 h-3.5 text-purple-500" />;
      case 'fill_blanks':
        return <Edit3 className="w-3.5 h-3.5 text-amber-500" />;
      case 'quiz':
        return <CheckSquare className="w-3.5 h-3.5 text-indigo-500" />;
      default:
        return <Code2 className="w-3.5 h-3.5 text-emerald-500" />;
    }
  };

  const getTaskTypeLabel = (type: string) => {
    switch (type) {
      case 'find_error':
        return 'Найди ошибку';
      case 'predict_output':
        return 'Что выведет код?';
      case 'fill_blanks':
        return 'Заполни пропуски';
      case 'quiz':
        return 'Тестовый вопрос';
      default:
        return 'Код-задание';
    }
  };

  const handleSuccess = () => {
    markTaskDone(currentTask.id, currentTask.type);
    soundManager.playSuccess();
    setShowCelebrationSheet(true);
  };

  const handleAttempt = () => {
    recordAttempt(currentTask.id);
  };

  const handleNextStep = () => {
    soundManager.playClick();
    setShowCelebrationSheet(false);
    if (hasNextTask) {
      handleSelectTask(activeTaskIndex + 1);
    } else if (onGoToQuiz) {
      onGoToQuiz();
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-100/60 dark:bg-slate-950/60 relative">
      {/* Task Selector Tabs Header (Tactile Pills) */}
      <div className="p-2 border-b-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-1.5 overflow-x-auto select-none">
        {tasks.map((task, idx) => {
          const active = idx === activeTaskIndex;
          const completed = isTaskCompleted(task.id);

          return (
            <button
              key={task.id}
              onClick={() => handleSelectTask(idx)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all border-b-2 active:translate-y-0.5 active:border-b-0 ${
                active
                  ? 'bg-emerald-500 text-white border-emerald-700 shadow-xs -translate-y-0.5'
                  : completed
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
              }`}
            >
              {completed ? (
                <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 ${active ? 'text-white' : 'text-emerald-500'}`} />
              ) : (
                getTaskIcon(task.type)
              )}
              <span>
                {idx + 1}. {task.title.split(':')[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Task Instruction Card */}
      <div className="p-4 sm:p-5 border-b-2 border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {getTaskTypeLabel(currentTask.type)}
            </span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
              currentTask.difficulty === 'easy' 
                ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
            }`}>
              {currentTask.difficulty === 'easy' ? 'Легко' : 'Средне'}
            </span>
          </div>

          {isDone && (
            <span className="flex items-center gap-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Решено!
            </span>
          )}
        </div>

        <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100">
          {currentTask.title}
        </h3>

        <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
          {currentTask.instruction}
        </div>
      </div>

      {/* Active Task Workspace (Switch based on TaskType) */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto pb-24">
        {currentTask.type === 'predict_output' ? (
          <PredictOutputView
            task={currentTask}
            attempts={attempts}
            isCompleted={isDone}
            onAttempt={handleAttempt}
            onSuccess={handleSuccess}
          />
        ) : currentTask.type === 'fill_blanks' ? (
          <FillBlanksView
            task={currentTask}
            attempts={attempts}
            isCompleted={isDone}
            onAttempt={handleAttempt}
            onSuccess={handleSuccess}
          />
        ) : currentTask.type === 'quiz' ? (
          <QuizTaskItemView
            task={currentTask}
            attempts={attempts}
            isCompleted={isDone}
            onAttempt={handleAttempt}
            onSuccess={handleSuccess}
          />
        ) : (
          /* 'code' and 'find_error' */
          <CodeTaskRunnerView
            task={currentTask}
            savedCode={getSavedCode(currentTask.id)}
            attempts={attempts}
            isCompleted={isDone}
            onCodeChange={(newCode) => saveCode(currentTask.id, newCode)}
            onAttempt={handleAttempt}
            onSuccess={handleSuccess}
          />
        )}
      </div>

      {/* Duolingo-style Celebration Bottom Sheet (Slides up on success) */}
      {(showCelebrationSheet || isDone) && (
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 bg-white/95 dark:bg-slate-900/95 border-t-4 border-emerald-500 shadow-2xl backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 animate-slide-up z-20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-md border-b-4 border-emerald-700 flex-shrink-0 animate-bounce">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                  Потрясающе! Всё верно!
                </span>
                <span className="flex items-center gap-1 text-xs font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                  <Sparkles className="w-3 h-3 fill-amber-500" /> +15 XP
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {hasNextTask ? 'Готовы к следующему заданию?' : 'Все задачи этого урока пройдены! Переходите к тесту.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleNextStep}
            className="btn-3d-green w-full sm:w-auto px-8 py-3 rounded-2xl text-xs flex items-center justify-center gap-2"
          >
            <span>{hasNextTask ? 'Следующее задание' : 'Перейти к тесту'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
