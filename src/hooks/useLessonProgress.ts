import { useState, useEffect } from 'react';
import type { UserProgress } from '../types/progress';
import { ProgressStore } from '../core/storage/progressStore';

export function useLessonProgress() {
  const [progress, setProgress] = useState<UserProgress>(ProgressStore.getProgress());

  useEffect(() => {
    const unsubscribe = ProgressStore.subscribe((updated) => {
      setProgress({ ...updated });
    });
    return unsubscribe;
  }, []);

  const totalXP =
    (progress.completedTasks.length * 15) +
    (progress.completedQuizzes.length * 25) +
    (progress.completedLessons.length * 50) +
    (progress.achievements.filter(a => !!a.unlockedAt).length * 100);

  const unlockedAchievementsCount = progress.achievements.filter(a => !!a.unlockedAt).length;

  return {
    progress,
    totalXP,
    unlockedAchievementsCount,
    isLessonCompleted: (lessonId: string) => progress.completedLessons.includes(lessonId),
    isTaskCompleted: (taskId: string) => progress.completedTasks.includes(taskId),
    isQuizCompleted: (lessonId: string) => progress.completedQuizzes.includes(lessonId),
    getTaskAttempts: (taskId: string) => progress.taskAttempts[taskId] || 0,
    getSavedCode: (taskId: string) => progress.userCode[taskId],
    markTaskDone: (taskId: string, type?: string) => ProgressStore.markTaskCompleted(taskId, type),
    markQuizDone: (lessonId: string) => ProgressStore.markQuizCompleted(lessonId),
    markLessonDone: (lessonId: string) => ProgressStore.markLessonCompleted(lessonId),
    saveCode: (taskId: string, code: string) => ProgressStore.saveUserCode(taskId, code),
    recordAttempt: (taskId: string) => ProgressStore.recordTaskAttempt(taskId),
    unlockAchievement: (achId: string) => ProgressStore.unlockAchievement(achId),
    exportProgress: () => ProgressStore.exportProgressJSON(),
    importProgress: (json: string) => ProgressStore.importProgressJSON(json),
    resetProgress: () => ProgressStore.resetProgress(),
  };
}
