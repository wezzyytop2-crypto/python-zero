import React, { useState } from 'react';
import type { CourseManifest, LessonData } from '../../types/course';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { TheoryViewer } from '../lesson/TheoryViewer';
import { StepikEmbed } from '../lesson/StepikEmbed';
import { StepikStepBar } from './StepikStepBar';
import { useLessonProgress } from '../../hooks/useLessonProgress';
import { soundManager } from '../../core/sound/soundEffects';
import confetti from 'canvas-confetti';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  PartyPopper
} from 'lucide-react';

interface MainLayoutProps {
  manifest: CourseManifest | null;
  currentLessonId: string;
  lessonData: LessonData | null;
  isLoadingLesson: boolean;
  onSelectLesson: (id: string) => void;
  onNextLesson: () => void;
  onPrevLesson: () => void;
  hasPrevLesson: boolean;
  hasNextLesson: boolean;
  renderTasksArea: (
    activeTaskIndex: number, 
    onSelectTaskIndex: (idx: number) => void, 
    onGoToQuiz: () => void
  ) => React.ReactNode;
  renderQuizArea: () => React.ReactNode;
  onRunExample?: (code: string) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  manifest,
  currentLessonId,
  lessonData,
  isLoadingLesson,
  onSelectLesson,
  onNextLesson,
  onPrevLesson,
  hasPrevLesson,
  hasNextLesson,
  renderTasksArea,
  renderQuizArea,
  onRunExample,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'theory' | 'tasks' | 'quiz' | 'stepik'>('theory');
  const [activeTaskIndex, setActiveTaskIndex] = useState(0);
  const [isSplitMode, setIsSplitMode] = useState<boolean>(() => {
    return window.innerWidth >= 1280;
  });

  const { isLessonCompleted, markLessonDone, isTaskCompleted, isQuizCompleted } = useLessonProgress();
  const isCurrentLessonDone = isLessonCompleted(currentLessonId);

  const handleMarkComplete = () => {
    soundManager.playLessonComplete();
    markLessonDone(currentLessonId);
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.65 },
      colors: ['#10b981', '#0ea5e9', '#f59e0b', '#ec4899', '#8b5cf6'],
    });
  };

  const handleRunExampleInternal = (code: string) => {
    soundManager.playClick();
    setActiveTab('tasks');
    if (onRunExample) {
      onRunExample(code);
    }
  };

  const handleNextLessonWithSound = () => {
    soundManager.playClick();
    setActiveTab('theory');
    setActiveTaskIndex(0);
    onNextLesson();
  };

  const handlePrevLessonWithSound = () => {
    soundManager.playClick();
    setActiveTab('theory');
    setActiveTaskIndex(0);
    onPrevLesson();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Header with Duolingo Gamification Pills */}
      <Header
        manifest={manifest}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Body with Sidebar & Content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          manifest={manifest}
          currentLessonId={currentLessonId}
          onSelectLesson={(id) => {
            setActiveTab('theory');
            setActiveTaskIndex(0);
            onSelectLesson(id);
          }}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Workspace Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 dark:bg-slate-950">
          {/* Sub-Header: Lesson Title & Stepik Step Bar */}
          <div className="border-b-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  {lessonData ? `Урок ${lessonData.id.replace('lesson-', '').replace('-', '.')}` : 'Загрузка...'}
                </span>
                {isCurrentLessonDone && (
                  <span className="flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> Пройден
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white truncate">
                {lessonData?.title || 'Загрузка урока...'}
              </h2>
            </div>
          </div>

          {/* Stepik-style Steps Ribbon */}
          <StepikStepBar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tasks={lessonData?.tasks || []}
            activeTaskIndex={activeTaskIndex}
            onSelectTaskIndex={setActiveTaskIndex}
            isTaskCompleted={isTaskCompleted}
            hasQuiz={!!lessonData?.quiz && lessonData.quiz.length > 0}
            isQuizCompleted={isQuizCompleted(currentLessonId)}
            hasStepik={!!lessonData?.stepikLessonUrl}
            isSplitMode={isSplitMode}
            onToggleSplitMode={() => setIsSplitMode(prev => !prev)}
          />

          {/* Content Pane */}
          <div className="flex-1 overflow-hidden relative">
            {isLoadingLesson ? (
              <div className="h-full flex items-center justify-center p-8">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs font-bold text-slate-500">Загрузка материалов урока...</span>
                </div>
              </div>
            ) : !lessonData ? (
              <div className="h-full flex items-center justify-center p-8 text-slate-400 text-sm font-bold">
                Урок не найден
              </div>
            ) : isSplitMode ? (
              /* Dual Split Screen Mode (Desktop: Theory on Left, Tasks/Quiz on Right) */
              <div className="h-full flex flex-col xl:flex-row divide-y xl:divide-y-0 xl:divide-x-2 divide-slate-200 dark:divide-slate-800 overflow-hidden">
                {/* Left: Theory */}
                <div className="w-full xl:w-1/2 h-full overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#f7f7f7] dark:bg-[#131f24]">
                  <TheoryViewer 
                    lesson={lessonData} 
                    onRunExample={handleRunExampleInternal} 
                    onGoToTasks={() => {
                      soundManager.playClick();
                      setActiveTab('tasks');
                    }}
                  />
                </div>
                {/* Right: Tasks / Editor / Quiz */}
                <div className="w-full xl:w-1/2 h-full flex flex-col bg-white dark:bg-[#1f2e35] overflow-hidden">
                  {activeTab === 'quiz' ? (
                    <div className="h-full overflow-y-auto p-4 sm:p-6">
                      {renderQuizArea()}
                    </div>
                  ) : activeTab === 'stepik' ? (
                    <div className="h-full overflow-y-auto p-4 sm:p-6">
                      <StepikEmbed
                        stepikUrl={lessonData.stepikLessonUrl}
                        lessonTitle={lessonData.title}
                      />
                    </div>
                  ) : (
                    renderTasksArea(activeTaskIndex, setActiveTaskIndex, () => setActiveTab('quiz'))
                  )}
                </div>
              </div>
            ) : (
              /* Single Tab Mode */
              <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#f7f7f7] dark:bg-[#131f24]">
                {activeTab === 'theory' && (
                  <div className="max-w-4xl mx-auto">
                    <TheoryViewer 
                      lesson={lessonData} 
                      onRunExample={handleRunExampleInternal} 
                      onGoToTasks={() => {
                        soundManager.playClick();
                        setActiveTab('tasks');
                      }}
                    />
                  </div>
                )}
                {activeTab === 'tasks' && renderTasksArea(activeTaskIndex, setActiveTaskIndex, () => setActiveTab('quiz'))}
                {activeTab === 'quiz' && renderQuizArea()}
                {activeTab === 'stepik' && (
                  <StepikEmbed
                    stepikUrl={lessonData.stepikLessonUrl}
                    lessonTitle={lessonData.title}
                  />
                )}
              </div>
            )}
          </div>

          {/* Bottom Navigation Bar with Duolingo 3D Buttons */}
          <footer className="h-16 border-t-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 sm:px-6 flex items-center justify-between gap-2 shadow-xs">
            <button
              onClick={handlePrevLessonWithSound}
              disabled={!hasPrevLesson}
              className="btn-3d-neutral flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Предыдущий урок</span>
              <span className="sm:hidden">Назад</span>
            </button>

            {/* Complete lesson button */}
            <button
              onClick={handleMarkComplete}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-black transition-all ${
                isCurrentLessonDone
                  ? 'btn-3d-neutral bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700'
                  : 'btn-3d-green'
              }`}
            >
              {isCurrentLessonDone ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Урок пройден!</span>
                </>
              ) : (
                <>
                  <PartyPopper className="w-4 h-4 text-amber-300" />
                  <span>Завершить урок (+50 XP)</span>
                </>
              )}
            </button>

            <button
              onClick={handleNextLessonWithSound}
              disabled={!hasNextLesson}
              className="btn-3d-blue flex items-center gap-1.5 px-5 py-2.5 rounded-2xl text-xs"
            >
              <span className="hidden sm:inline">Следующий урок</span>
              <span className="sm:hidden">Далее</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </footer>
        </main>
      </div>
    </div>
  );
};
