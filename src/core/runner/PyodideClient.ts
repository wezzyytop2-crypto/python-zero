import type { WorkerStatus, RunResult, WorkerOutMessage } from '../../types/runner';
import { parsePythonError } from './errorParser';

export type StdoutCallback = (chunk: string) => void;
export type StderrCallback = (chunk: string) => void;
export type StatusCallback = (status: WorkerStatus) => void;

export class PyodideClient {
  private worker: Worker | null = null;
  private status: WorkerStatus = 'idle';
  private currentExecutionId: string | null = null;
  private timeoutTimer: any = null;
  private activeResolve: ((res: RunResult) => void) | null = null;

  // Real-time streaming listeners
  private stdoutListeners: StdoutCallback[] = [];
  private stderrListeners: StderrCallback[] = [];
  private statusListeners: StatusCallback[] = [];

  // Accumulated outputs during execution
  private currentStdout = '';
  private currentStderr = '';

  constructor() {
    this.initWorker();
  }

  private initWorker(): void {
    if (this.worker) {
      try {
        this.worker.terminate();
      } catch (e) {
        console.error('Error terminating previous worker:', e);
      }
    }

    this.setStatus('loading');
    
    // Resolve path for GitHub Pages using BASE_URL
    const workerUrl = `${import.meta.env.BASE_URL}workers/pyodide.worker.js`;
    this.worker = new Worker(workerUrl);

    this.worker.onmessage = (event: MessageEvent<WorkerOutMessage>) => {
      this.handleWorkerMessage(event.data);
    };

    this.worker.onerror = (err) => {
      console.error('Pyodide Worker runtime error:', err);
      this.setStatus('error');
      if (this.activeResolve) {
        this.activeResolve({
          success: false,
          stdout: this.currentStdout,
          stderr: this.currentStderr,
          executionTimeMs: 0,
          errorExplanation: {
            type: 'WorkerError',
            originalMessage: err.message || 'Ошибка загрузки Web Worker',
            friendlyTitle: 'Ошибка среды выполнения',
            friendlyDescription: 'Не удалось запустить Web Worker в браузере. Проверьте подключение к сети (для первичной загрузки Pyodide CDN).',
            tips: ['Проверьте интернет-соединение', 'Обновите страницу браузера'],
          },
        });
        this.activeResolve = null;
      }
    };

    // Ask worker to initialize Pyodide
    this.worker.postMessage({ type: 'INIT' });
  }

  private setStatus(status: WorkerStatus): void {
    this.status = status;
    for (const listener of this.statusListeners) {
      listener(status);
    }
  }

  public getStatus(): WorkerStatus {
    return this.status;
  }

  public onStdout(callback: StdoutCallback): () => void {
    this.stdoutListeners.push(callback);
    return () => {
      this.stdoutListeners = this.stdoutListeners.filter(l => l !== callback);
    };
  }

  public onStderr(callback: StderrCallback): () => void {
    this.stderrListeners.push(callback);
    return () => {
      this.stderrListeners = this.stderrListeners.filter(l => l !== callback);
    };
  }

  public onStatus(callback: StatusCallback): () => void {
    this.statusListeners.push(callback);
    callback(this.status);
    return () => {
      this.statusListeners = this.statusListeners.filter(l => l !== callback);
    };
  }

  private handleWorkerMessage(msg: WorkerOutMessage): void {
    switch (msg.type) {
      case 'INIT_START':
      case 'INIT_PROGRESS':
        this.setStatus('loading');
        break;

      case 'INIT_SUCCESS':
        this.setStatus('ready');
        break;

      case 'INIT_ERROR':
        this.setStatus('error');
        console.error('Pyodide CDN initialization error:', msg.error);
        break;

      case 'STDOUT':
        if (msg.executionId === this.currentExecutionId) {
          this.currentStdout += msg.text;
          for (const listener of this.stdoutListeners) {
            listener(msg.text);
          }
        }
        break;

      case 'STDERR':
        if (msg.executionId === this.currentExecutionId) {
          this.currentStderr += msg.text;
          for (const listener of this.stderrListeners) {
            listener(msg.text);
          }
        }
        break;

      case 'RUN_SUCCESS':
        if (msg.executionId === this.currentExecutionId) {
          this.clearTimeoutTimer();
          this.setStatus('ready');
          if (this.activeResolve) {
            this.activeResolve({
              success: true,
              stdout: this.currentStdout,
              stderr: this.currentStderr,
              executionTimeMs: msg.executionTimeMs,
            });
            this.activeResolve = null;
          }
          this.currentExecutionId = null;
        }
        break;

      case 'RUN_ERROR':
        if (msg.executionId === this.currentExecutionId) {
          this.clearTimeoutTimer();
          this.setStatus('ready');
          const friendly = parsePythonError(msg.traceback);
          if (this.activeResolve) {
            this.activeResolve({
              success: false,
              stdout: this.currentStdout,
              stderr: this.currentStderr,
              executionTimeMs: 0,
              errorExplanation: friendly,
            });
            this.activeResolve = null;
          }
          this.currentExecutionId = null;
        }
        break;
    }
  }

  private clearTimeoutTimer(): void {
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = null;
    }
  }

  /**
   * Run Python code with optional stdin inputs and timeout (default 5000ms)
   */
  public async runCode(
    code: string,
    options: {
      stdinInputs?: string[];
      timeoutMs?: number;
    } = {}
  ): Promise<RunResult> {
    // If currently running, stop previous run
    if (this.status === 'running') {
      this.stop();
    }

    const timeoutMs = options.timeoutMs ?? 5000;
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    this.currentExecutionId = executionId;
    this.currentStdout = '';
    this.currentStderr = '';
    this.setStatus('running');

    return new Promise<RunResult>((resolve) => {
      this.activeResolve = resolve;

      // Arm execution timeout (5 sec)
      this.timeoutTimer = setTimeout(() => {
        console.warn(`Execution timed out after ${timeoutMs}ms. Terminating worker...`);
        this.terminateDueToTimeout();
      }, timeoutMs);

      // Post execution request to worker
      this.worker?.postMessage({
        type: 'RUN_CODE',
        code,
        stdinInputs: options.stdinInputs || [],
        executionId,
      });
    });
  }

  /**
   * Manual stop button or timeout kill
   */
  public stop(): void {
    this.clearTimeoutTimer();
    if (this.status === 'running' && this.activeResolve) {
      const friendly = parsePythonError('KeyboardInterrupt: Execution terminated by user');
      friendly.friendlyTitle = 'Выполнение остановлено пользователем';
      friendly.friendlyDescription = 'Вы нажали кнопку «Остановить». Программа была немедленно прервана.';
      friendly.tips = ['Вы можете отредактировать код и запустить его заново.'];

      this.activeResolve({
        success: false,
        stdout: this.currentStdout,
        stderr: this.currentStderr,
        executionTimeMs: 0,
        errorExplanation: friendly,
      });
      this.activeResolve = null;
    }

    // Force terminate the worker to instantly kill any while True loops
    this.initWorker();
  }

  private terminateDueToTimeout(): void {
    if (this.activeResolve) {
      const friendly = parsePythonError('TimeoutError: Execution exceeded 5.0 seconds');
      this.activeResolve({
        success: false,
        stdout: this.currentStdout,
        stderr: this.currentStderr,
        executionTimeMs: 5000,
        errorExplanation: friendly,
      });
      this.activeResolve = null;
    }

    // Recreate worker clean
    this.initWorker();
  }
}

// Global shared runner instance
export const pyodideClient = new PyodideClient();
