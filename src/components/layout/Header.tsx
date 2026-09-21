import React, { useState } from 'react';
import { ThemeToggle } from '../common/ThemeToggle';
import type { CourseManifest } from '../../types/course';
import { useLessonProgress } from '../../hooks/useLessonProgress';
import { useAuth } from '../../hooks/useAuth';
import { AchievementsModal } from '../common/AchievementsModal';
import { DataManagementModal } from '../common/DataManagementModal';
import { AuthModal } from '../auth/AuthModal';
import { AITutorModal } from '../ai/AITutorModal';
import { soundManager } from '../../core/sound/soundEffects';
import { 
  Flame, 
  Trophy, 
  Settings2, 
  Menu, 
  Volume2, 
  VolumeX, 
  Sparkles,
  GraduationCap,
  LogIn,
  LogOut,
  Check
} from 'lucide-react';

interface HeaderProps {
  manifest: CourseManifest | null;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  manifest,
  onToggleSidebar,
}) => {
  const { user, signOut } = useAuth();
  const { progress, totalXP, unlockedAchievementsCount, exportProgress, importProgress, resetProgress } = useLessonProgress();
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isAITutorOpen, setIsAITutorOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(() => soundManager.getMuted());

  const handleToggleSound = () => {
    const nextMuted = soundManager.toggleMute();
    setIsMuted(nextMuted);
  };

  // Total lessons in manifest
  const totalLessons = manifest
    ? manifest.modules.reduce((acc, m) => acc + m.lessons.length, 0)
    : 40;
  const completedLessonsCount = progress.completedLessons.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 100) : 0;

  return (
    <>
      <header className="sticky top-0 z-30 h-16 border-b-2 border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between transition-colors shadow-xs">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 -ml-1 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors lg:hidden active:scale-95"
            aria-label="Меню курса"
          >
            <Menu className="w-5 h-5" />
          </button>

          <a href="#" className="flex items-center gap-2.5 group select-none">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-sky-400 p-[2px] shadow-sm group-hover:scale-105 active:scale-95 transition-transform">
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[14px] flex items-center justify-center">
                <span className="text-xl select-none filter drop-shadow-sm">🐍</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-tight bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 dark:from-emerald-400 dark:via-teal-300 dark:to-sky-400 bg-clip-text text-transparent">
                  Python-0
                </span>
                <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Курс
                </span>
              </div>
              <span className="hidden sm:block text-[11px] font-semibold text-slate-400 -mt-0.5">
                Интерактивный тренажёр
              </span>
            </div>
          </a>
        </div>

        {/* Center: Global Progress Bar (Stepik + Duolingo mix) */}
        <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border-2 border-slate-200/80 dark:border-slate-700/80">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
            <GraduationCap className="w-4 h-4 text-emerald-500" />
            <span>Прогресс:</span>
            <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
              {completedLessonsCount}/{totalLessons}
            </span>
            <span className="text-[11px] text-slate-400">({progressPercent}%)</span>
          </div>

          <div className="w-28 h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500 shadow-xs"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Right: Gamification Pills (Duolingo signature: Fire, XP, Trophies, Sound) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Streak Flame Pill */}
          <div 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border-2 border-b-4 border-amber-400/40 dark:border-amber-500/30 text-amber-600 dark:text-amber-400 cursor-default select-none shadow-xs"
            title={`Текущая серия: ${progress.streak.currentCount} дн. (Рекорд: ${progress.streak.bestCount})`}
          >
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
            <span className="text-xs font-black tracking-wide">
              {progress.streak.currentCount}
            </span>
          </div>

          {/* XP Gems Pill */}
          <div 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-sky-500/10 dark:bg-sky-500/15 border-2 border-b-4 border-sky-400/40 dark:border-sky-500/30 text-sky-600 dark:text-sky-400 cursor-default select-none shadow-xs"
            title={`Ваш опыт: ${totalXP} XP (+15 за задачу, +50 за урок)`}
          >
            <Sparkles className="w-4 h-4 text-sky-500 fill-sky-500" />
            <span className="text-xs font-black tracking-wide">
              {totalXP} <span className="text-[10px] opacity-80">XP</span>
            </span>
          </div>

          {/* Achievements Trophy Button */}
          <button
            onClick={() => {
              soundManager.playClick();
              setIsAchievementsOpen(true);
            }}
            className="relative p-2 rounded-2xl text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border-2 border-b-4 border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-500 transition-all shadow-xs active:translate-y-1 active:border-b-2"
            title="Достижения и трофеи"
            aria-label="Достижения"
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            {unlockedAchievementsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center shadow-xs border border-white dark:border-slate-900">
                {unlockedAchievementsCount}
              </span>
            )}
          </button>

          {/* Sound Mute/Unmute Button */}
          <button
            onClick={handleToggleSound}
            className={`p-2 rounded-2xl border-2 border-b-4 transition-all shadow-xs active:translate-y-1 active:border-b-2 ${
              isMuted
                ? 'text-slate-400 bg-slate-100 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700'
                : 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700'
            }`}
            title={isMuted ? 'Включить победные звуки' : 'Выключить звук'}
            aria-label="Звук"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Settings & Data Management */}
          <button
            onClick={() => {
              soundManager.playClick();
              setIsDataModalOpen(true);
            }}
            className="p-2 rounded-2xl text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border-2 border-b-4 border-slate-200 dark:border-slate-700 hover:border-slate-300 transition-all shadow-xs active:translate-y-1 active:border-b-2"
            title="Управление данными (экспорт/импорт)"
            aria-label="Настройки"
          >
            <Settings2 className="w-4 h-4" />
          </button>

          {/* AI Tutor Button */}
          <button
            onClick={() => {
              soundManager.playClick();
              setIsAITutorOpen(true);
            }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-[#58cc02]/10 dark:bg-[#58cc02]/20 border-2 border-b-4 border-[#58cc02]/40 text-[#46a302] dark:text-[#58cc02] hover:bg-[#58cc02]/25 transition-all shadow-xs active:translate-y-1 active:border-b-2 cursor-pointer"
            title="Питончик AI — твой ИИ-тьютор на Google Gemini"
          >
            <span className="text-base select-none leading-none">🐍</span>
            <span className="text-xs font-black hidden md:inline">Питончик AI</span>
            <Sparkles className="w-3 h-3 fill-current hidden sm:inline" />
          </button>

          {/* Dark/Light Theme Toggle */}
          <ThemeToggle />

          {/* Auth Button or User Profile Avatar */}
          {!user ? (
            <button
              onClick={() => {
                soundManager.playClick();
                setIsAuthModalOpen(true);
              }}
              className="btn-3d btn-3d-green flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-2xl text-white text-xs font-black"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Войти</span>
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setIsProfileMenuOpen(prev => !prev);
                }}
                className="flex items-center gap-2 p-1 pl-2 rounded-2xl bg-white dark:bg-[#1f2e35] border-2 border-b-4 border-[#e5e5e5] dark:border-[#37464f] hover:border-[#58cc02] transition-all select-none"
              >
                <span className="text-xs font-black text-slate-800 dark:text-white max-w-[90px] sm:max-w-[120px] truncate hidden sm:inline">
                  {user.fullName || user.email?.split('@')[0] || 'Профиль'}
                </span>
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#58cc02] to-[#46a302] text-white font-black text-xs flex items-center justify-center border-b-2 border-[#378202] shadow-xs">
                  {user.fullName ? user.fullName[0].toUpperCase() : user.email ? user.email[0].toUpperCase() : '🐍'}
                </div>
              </button>

              {/* Profile Dropdown */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#1f2e35] border-2 border-b-4 border-[#e5e5e5] dark:border-[#37464f] shadow-xl p-3 z-50 animate-pop-in space-y-2">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#131f24] border border-slate-200/80 dark:border-slate-800">
                    <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                      {user.fullName || 'Пользователь'}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {user.email || user.phone}
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-[#58cc02]">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Облачная синхронизация активна</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      soundManager.playClick();
                      setIsProfileMenuOpen(false);
                      signOut();
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-black text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Выйти из аккаунта</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        progress={progress}
      />

      <DataManagementModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        onExport={exportProgress}
        onImport={importProgress}
        onReset={resetProgress}
      />

      <AITutorModal
        isOpen={isAITutorOpen}
        onClose={() => setIsAITutorOpen(false)}
      />
    </>
  );
};
