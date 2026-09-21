import React from 'react';
import { Modal } from './Modal';
import type { UserProgress } from '../../types/progress';
import { Trophy, CheckCircle2, Lock } from 'lucide-react';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: UserProgress;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  progress,
}) => {
  const unlockedCount = progress.achievements.filter(a => !!a.unlockedAt).length;
  const totalCount = progress.achievements.length;
  const percent = Math.round((unlockedCount / totalCount) * 100);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Достижения и награды" maxWidth="max-w-xl">
      <div className="space-y-6">
        {/* Summary Card */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-brand-500/10 to-purple-500/10 border border-amber-500/20">
          <div className="p-3 bg-amber-500/20 rounded-xl text-amber-500">
            <Trophy className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Открыто {unlockedCount} из {totalCount} наград
              </span>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                {percent}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-brand-500 rounded-full transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Badges List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {progress.achievements.map((ach) => {
            const isUnlocked = !!ach.unlockedAt;

            return (
              <div
                key={ach.id}
                className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                  isUnlocked
                    ? 'bg-white dark:bg-slate-800/90 border-amber-300/60 dark:border-amber-500/30 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                }`}
              >
                <div
                  className={`text-2xl p-2 rounded-xl flex-shrink-0 ${
                    isUnlocked ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-slate-200 dark:bg-slate-700/50 grayscale'
                  }`}
                >
                  {ach.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                      {ach.title}
                    </h4>
                    {isUnlocked ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {ach.description}
                  </p>
                  {isUnlocked && ach.unlockedAt && (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400/90 font-medium block mt-1">
                      Получено: {new Date(ach.unlockedAt).toLocaleDateString('ru-RU')}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};
