import React, { useState } from 'react';
import type { CourseManifest } from '../../types/course';
import { useLessonProgress } from '../../hooks/useLessonProgress';
import { soundManager } from '../../core/sound/soundEffects';
import { 
  ChevronDown, 
  ChevronRight, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Search, 
  BookOpen, 
  X,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  manifest: CourseManifest | null;
  currentLessonId: string;
  onSelectLesson: (lessonId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  manifest,
  currentLessonId,
  onSelectLesson,
  isOpen,
  onClose,
}) => {
  const { isLessonCompleted } = useLessonProgress();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Track open state of modules
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({
    'module-1': true,
  });

  const toggleModule = (moduleId: string) => {
    soundManager.playClick();
    setOpenModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  // Find module for current lesson and ensure it's open
  React.useEffect(() => {
    if (!manifest) return;
    for (const mod of manifest.modules) {
      if (mod.lessons.some(l => l.id === currentLessonId)) {
        setOpenModules(prev => {
          if (prev[mod.id]) return prev;
          return { ...prev, [mod.id]: true };
        });
        break;
      }
    }
  }, [currentLessonId, manifest]);

  if (!manifest) {
    return (
      <aside className="w-80 h-full border-r-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 animate-pulse">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-2xl mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800/60 rounded-2xl"></div>
          ))}
        </div>
      </aside>
    );
  }

  // Filter lessons if search query is entered
  const filteredModules = manifest.modules.map(mod => {
    if (!searchQuery.trim()) return mod;
    const q = searchQuery.toLowerCase();
    const matchingLessons = mod.lessons.filter(l => 
      l.title.toLowerCase().includes(q)
    );
    return {
      ...mod,
      lessons: matchingLessons,
    };
  }).filter(mod => !searchQuery.trim() || mod.lessons.length > 0);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-16 bottom-0 left-0 z-40 w-80 sm:w-88 flex flex-col bg-white dark:bg-slate-900 border-r-2 border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Search Bar */}
        <div className="p-3 border-b-2 border-slate-100 dark:border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between lg:hidden pb-1">
            <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-500" />
              Программа курса
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Поиск по урокам..."
              className="w-full pl-9 pr-8 py-2 text-xs font-medium rounded-xl bg-slate-100 dark:bg-slate-800/80 border-2 border-transparent focus:border-emerald-500 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all placeholder:text-slate-400 text-slate-800 dark:text-slate-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] text-slate-500 flex items-center justify-center hover:bg-slate-300"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Modules & Lessons Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
          {filteredModules.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400">
              Уроков по запросу «{searchQuery}» не найдено
            </div>
          ) : (
            filteredModules.map((mod) => {
              const isExpanded = !!openModules[mod.id] || !!searchQuery.trim();
              const completedCount = mod.lessons.filter(l => isLessonCompleted(l.id)).length;
              const isModuleComplete = mod.lessons.length > 0 && completedCount === mod.lessons.length;
              const modProgress = mod.lessons.length > 0 ? Math.round((completedCount / mod.lessons.length) * 100) : 0;

              return (
                <div
                  key={mod.id}
                  className={`rounded-2xl border-2 border-b-4 transition-all overflow-hidden ${
                    isModuleComplete
                      ? 'border-[#58cc02]/40 bg-[#58cc02]/5 dark:bg-[#58cc02]/10'
                      : 'border-[#e5e5e5] dark:border-[#37464f] bg-white dark:bg-[#1f2e35]'
                  }`}
                >
                  {/* Module Header Button */}
                  <button
                    onClick={() => toggleModule(mod.id)}
                    className="w-full flex items-center justify-between p-3.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors select-none"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 border-b-2 ${
                        isModuleComplete
                          ? 'bg-[#58cc02] text-white border-[#46a302]'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-800'
                      }`}>
                        {mod.number}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 truncate leading-snug">
                          {mod.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${
                                isModuleComplete ? 'bg-[#58cc02]' : 'bg-[#1cb0f6]'
                              }`}
                              style={{ width: `${modProgress}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-extrabold text-slate-400">
                            {completedCount}/{mod.lessons.length}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-slate-400 flex-shrink-0">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  </button>

                  {/* Lessons list (Stepik / Duolingo pathway items) */}
                  {isExpanded && (
                    <div className="p-2 space-y-1 bg-slate-50/60 dark:bg-[#131f24]/50 border-t-2 border-[#e5e5e5] dark:border-[#37464f]">
                      {mod.lessons.map((lesson) => {
                        const isCurrent = lesson.id === currentLessonId;
                        const isDone = isLessonCompleted(lesson.id);

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => {
                              soundManager.playClick();
                              onSelectLesson(lesson.id);
                              if (window.innerWidth < 1024) onClose();
                            }}
                            className={`w-full group flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-extrabold transition-all select-none ${
                              isCurrent
                                ? 'bg-[#58cc02] text-white shadow-sm -translate-y-0.5 border-b-2 border-[#46a302]'
                                : isDone
                                ? 'text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-[#1f2e35]'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-[#1f2e35]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                              {isDone ? (
                                <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${
                                  isCurrent ? 'text-white' : 'text-[#58cc02]'
                                }`} />
                              ) : isCurrent ? (
                                <Sparkles className="w-4 h-4 text-amber-200 flex-shrink-0 animate-bounce" />
                              ) : (
                                <Circle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                              )}
                              <span className="truncate">{lesson.title}</span>
                            </div>

                            <span className={`text-[10px] font-bold flex items-center gap-0.5 flex-shrink-0 ${
                              isCurrent ? 'text-emerald-100' : 'text-slate-400 group-hover:text-slate-500'
                            }`}>
                              <Clock className="w-2.5 h-2.5" />
                              {lesson.estimatedMinutes} мин
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </aside>
    </>
  );
};
