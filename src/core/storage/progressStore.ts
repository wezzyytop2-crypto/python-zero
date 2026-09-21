import type { UserProgress, ProgressExportData, Achievement } from '../../types/progress';

const STORAGE_KEY = 'python_zero_progress_v1';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_run',
    title: 'Первый запуск',
    description: 'Успешно запустите свой первый фрагмент кода на Python',
    icon: '🚀',
  },
  {
    id: 'first_task',
    title: 'Первая победа',
    description: 'Решите своё первое практическое задание',
    icon: '⭐',
  },
  {
    id: 'first_lesson',
    title: 'Начало положено',
    description: 'Полностью завершите свой первый урок',
    icon: '🎓',
  },
  {
    id: 'streak_3',
    title: 'В огне',
    description: 'Занимайтесь программированием 3 дня подряд',
    icon: '🔥',
  },
  {
    id: 'five_tasks',
    title: 'Практик',
    description: 'Решите 5 любых практических заданий',
    icon: '💡',
  },
  {
    id: 'bug_hunter',
    title: 'Охотник за багами',
    description: 'Успешно решите задание типа «Найди ошибку»',
    icon: '🐞',
  },
  {
    id: 'quiz_master',
    title: 'Эрудит',
    description: 'Пройдите тест урока без ошибок',
    icon: '🧠',
  }
];

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getInitialProgress(): UserProgress {
  return {
    version: 1,
    completedLessons: [],
    completedTasks: [],
    completedQuizzes: [],
    taskAttempts: {},
    userCode: {},
    streak: {
      currentCount: 0,
      lastActiveDate: '',
      bestCount: 0,
    },
    achievements: INITIAL_ACHIEVEMENTS,
  };
}

export class ProgressStore {
  private static cachedProgress: UserProgress | null = null;
  private static listeners: Array<(progress: UserProgress) => void> = [];

  public static getProgress(): UserProgress {
    if (this.cachedProgress) {
      return this.cachedProgress;
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          // Merge with initial achievements in case new ones were added
          const mergedAchievements = INITIAL_ACHIEVEMENTS.map(initialAch => {
            const existing = parsed.achievements?.find((a: Achievement) => a.id === initialAch.id);
            return existing || initialAch;
          });

          const progress: UserProgress = {
            ...getInitialProgress(),
            ...parsed,
            achievements: mergedAchievements,
          };
          this.cachedProgress = progress;
          return progress;
        }
      }
    } catch (e) {
      console.error('Failed to parse progress from localStorage:', e);
    }

    const fallback = getInitialProgress();
    this.cachedProgress = fallback;
    return fallback;
  }

  public static saveProgress(progress: UserProgress): void {
    this.cachedProgress = progress;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.error('Failed to save progress to localStorage:', e);
    }
    this.notify();
  }

  public static subscribe(listener: (progress: UserProgress) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private static notify(): void {
    if (!this.cachedProgress) return;
    for (const listener of this.listeners) {
      try {
        listener(this.cachedProgress);
      } catch (e) {
        console.error('Error in progress listener:', e);
      }
    }
  }

  // Update daily activity and streak
  public static recordDailyActivity(): void {
    const progress = this.getProgress();
    const today = getTodayDateString();
    const yesterday = getYesterdayDateString();

    if (progress.streak.lastActiveDate === today) {
      // Already recorded today
      return;
    }

    let newCurrent = 1;
    if (progress.streak.lastActiveDate === yesterday) {
      newCurrent = progress.streak.currentCount + 1;
    }

    const newBest = Math.max(progress.streak.bestCount, newCurrent);

    progress.streak = {
      currentCount: newCurrent,
      lastActiveDate: today,
      bestCount: newBest,
    };

    if (newCurrent >= 3) {
      this.unlockAchievement('streak_3', progress);
    }

    this.saveProgress(progress);
  }

  public static recordTaskAttempt(taskId: string): number {
    const progress = this.getProgress();
    const current = progress.taskAttempts[taskId] || 0;
    const updated = current + 1;
    progress.taskAttempts[taskId] = updated;
    this.recordDailyActivity();
    this.saveProgress(progress);
    return updated;
  }

  public static saveUserCode(taskId: string, code: string): void {
    const progress = this.getProgress();
    progress.userCode[taskId] = code;
    this.saveProgress(progress);
  }

  public static markTaskCompleted(taskId: string, taskType?: string): void {
    const progress = this.getProgress();
    if (!progress.completedTasks.includes(taskId)) {
      progress.completedTasks.push(taskId);
      this.recordDailyActivity();

      // Achievements triggers
      this.unlockAchievement('first_task', progress);
      if (progress.completedTasks.length >= 5) {
        this.unlockAchievement('five_tasks', progress);
      }
      if (taskType === 'find_error') {
        this.unlockAchievement('bug_hunter', progress);
      }

      this.saveProgress(progress);
    }
  }

  public static markQuizCompleted(lessonId: string): void {
    const progress = this.getProgress();
    if (!progress.completedQuizzes.includes(lessonId)) {
      progress.completedQuizzes.push(lessonId);
      this.unlockAchievement('quiz_master', progress);
      this.saveProgress(progress);
    }
  }

  public static markLessonCompleted(lessonId: string): void {
    const progress = this.getProgress();
    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
      this.unlockAchievement('first_lesson', progress);
      this.saveProgress(progress);
    }
  }

  public static setLastVisitedLesson(lessonId: string): void {
    const progress = this.getProgress();
    progress.lastVisitedLessonId = lessonId;
    this.saveProgress(progress);
  }

  public static unlockAchievement(achievementId: string, currentProgress?: UserProgress): boolean {
    const progress = currentProgress || this.getProgress();
    const ach = progress.achievements.find(a => a.id === achievementId);
    if (ach && !ach.unlockedAt) {
      ach.unlockedAt = new Date().toISOString();
      if (!currentProgress) {
        this.saveProgress(progress);
      }
      return true;
    }
    return false;
  }

  public static exportProgressJSON(): string {
    const data: ProgressExportData = {
      app: 'python-zero',
      version: 1,
      exportedAt: new Date().toISOString(),
      progress: this.getProgress(),
    };
    return JSON.stringify(data, null, 2);
  }

  public static importProgressJSON(jsonString: string): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, message: 'Некорректный формат файла' };
      }

      const importedProgress: UserProgress = parsed.progress || parsed;
      if (!Array.isArray(importedProgress.completedLessons) || !Array.isArray(importedProgress.completedTasks)) {
        return { success: false, message: 'Файл не содержит данных прогресса платформы' };
      }

      this.saveProgress({
        ...getInitialProgress(),
        ...importedProgress,
      });

      return { success: true, message: 'Прогресс успешно восстановлен!' };
    } catch (e: any) {
      return { success: false, message: `Ошибка чтения JSON: ${e.message}` };
    }
  }

  public static resetProgress(): void {
    this.saveProgress(getInitialProgress());
  }
}
