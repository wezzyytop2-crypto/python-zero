export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string; // ISO date string
}

export interface UserProgress {
  version: number;
  completedLessons: string[]; // lessonIds
  completedTasks: string[];   // taskIds
  completedQuizzes: string[]; // lessonIds where quiz is 100% done
  taskAttempts: Record<string, number>; // taskId -> count of attempts
  userCode: Record<string, string>;     // taskId -> last saved user code
  
  // Streak tracking
  streak: {
    currentCount: number;
    lastActiveDate: string; // YYYY-MM-DD
    bestCount: number;
  };

  // Gamification
  achievements: Achievement[];
  lastVisitedLessonId?: string;
}

export interface ProgressExportData {
  app: 'python-zero';
  version: number;
  exportedAt: string;
  progress: UserProgress;
}
