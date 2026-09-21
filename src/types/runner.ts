export type WorkerStatus = 'idle' | 'loading' | 'ready' | 'running' | 'waiting_input' | 'error';

export interface ConsoleOutputItem {
  id: string;
  type: 'stdout' | 'stderr' | 'info' | 'error' | 'input-echo';
  text: string;
  timestamp: number;
}

export interface RunResult {
  success: boolean;
  stdout: string;
  stderr: string;
  executionTimeMs: number;
  errorExplanation?: {
    type: string;
    originalMessage: string;
    friendlyTitle: string;
    friendlyDescription: string;
    tips: string[];
    lineNumber?: number;
  };
}

export type WorkerInMessage =
  | { type: 'INIT' }
  | { type: 'RUN_CODE'; code: string; stdinInputs?: string[]; executionId: string }
  | { type: 'STDIN_REPLY'; input: string; executionId: string };

export type WorkerOutMessage =
  | { type: 'INIT_START' }
  | { type: 'INIT_PROGRESS'; progress: number; message: string }
  | { type: 'INIT_SUCCESS' }
  | { type: 'INIT_ERROR'; error: string }
  | { type: 'STDOUT'; text: string; executionId: string }
  | { type: 'STDERR'; text: string; executionId: string }
  | { type: 'STDIN_REQUEST'; prompt: string; executionId: string }
  | { type: 'RUN_SUCCESS'; stdout: string; executionTimeMs: number; executionId: string }
  | { type: 'RUN_ERROR'; error: string; errorType: string; traceback: string; executionId: string };
