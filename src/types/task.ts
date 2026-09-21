export type TaskType = 
  | 'code'
  | 'find_error'
  | 'predict_output'
  | 'fill_blanks'
  | 'quiz';

export interface BaseTask {
  id: string;
  type: TaskType;
  title: string;
  instruction: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hints: [string, string, string]; // [намек, конкретная подсказка, решение]
  solutionUnlockAttempts?: number;
}

export interface TestCase {
  id: string;
  stdin?: string;
  expectedStdout: string;
  description?: string;
  isHidden: boolean;
}

export interface CodeTask extends BaseTask {
  type: 'code';
  starterCode: string;
  solutionCode: string;
  testCases: TestCase[];
}

export interface FindErrorTask extends BaseTask {
  type: 'find_error';
  buggyCode: string;
  solutionCode: string;
  testCases: TestCase[];
}

export interface PredictOutputTask extends BaseTask {
  type: 'predict_output';
  code: string;
  expectedAnswer: string;
  explanation: string;
}

export interface FillBlanksTask extends BaseTask {
  type: 'fill_blanks';
  templateCode: string;
  blanks: Array<{
    id: string;
    correctAnswers: string[];
    placeholder: string;
  }>;
  testCases: TestCase[];
}

export interface QuizTask extends BaseTask {
  type: 'quiz';
  question?: string;
  codeSnippet?: string;
  options: string[];
  correctIndex?: number;
  correctIndices?: number[];
  explanation?: string;
}

export type TaskItem = CodeTask | FindErrorTask | PredictOutputTask | FillBlanksTask | QuizTask;
