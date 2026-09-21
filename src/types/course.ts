import type { TaskItem } from './task';

export interface LessonMeta {
  id: string;
  file: string;
  title: string;
  estimatedMinutes: number;
}

export interface ModuleMeta {
  id: string;
  number: number;
  title: string;
  description: string;
  lessons: LessonMeta[];
}

export interface CourseManifest {
  courseTitle: string;
  version: string;
  modules: ModuleMeta[];
}

export interface TheoryExample {
  id: string;
  title: string;
  code: string;
  description: string;
}

export interface CommonMistake {
  mistakeCode: string;
  errorType: string;
  explanation: string;
  fixCode: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctIndices: number[];
  explanation: string;
}

export interface LessonData {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  stepikLessonUrl?: string;
  theoryMarkdown: string;
  theoryExamples?: TheoryExample[];
  commonMistakes: CommonMistake[];
  quiz: QuizQuestion[];
  tasks: TaskItem[];
}
