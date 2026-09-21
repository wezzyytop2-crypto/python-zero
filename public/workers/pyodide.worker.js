/* eslint-disable no-undef */
// Pyodide Web Worker for "Python с нуля"

let pyodideInstance = null;
let isInitializing = false;
let currentExecutionId = null;

// Send message to main UI thread
function postMsg(msg) {
  self.postMessage(msg);
}

// Global JS callbacks called directly by Pyodide Python execution
self.onPythonStdout = function(text) {
  if (currentExecutionId) {
    postMsg({ type: 'STDOUT', text: String(text), executionId: currentExecutionId });
  }
};

self.onPythonStderr = function(text) {
  if (currentExecutionId) {
    postMsg({ type: 'STDERR', text: String(text), executionId: currentExecutionId });
  }
};

// Initialize Pyodide runtime from CDN
async function initPyodide() {
  if (pyodideInstance) return pyodideInstance;
  if (isInitializing) return;

  isInitializing = true;
  postMsg({ type: 'INIT_START' });

  try {
    postMsg({ type: 'INIT_PROGRESS', progress: 20, message: 'Загрузка движка Pyodide...' });

    // Load pyodide script
    importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js');

    postMsg({ type: 'INIT_PROGRESS', progress: 50, message: 'Инициализация Python 3.12...' });

    pyodideInstance = await loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
    });

    postMsg({ type: 'INIT_PROGRESS', progress: 80, message: 'Настройка перехвата вывода...' });

    // Setup Python environment
    await pyodideInstance.runPythonAsync(`
import sys
import builtins
import js

# Custom stdout stream
class JSStdoutStream:
    def write(self, s):
        if s:
            js.onPythonStdout(s)
    def flush(self):
        pass

# Custom stderr stream
class JSStderrStream:
    def write(self, s):
        if s:
            js.onPythonStderr(s)
    def flush(self):
        pass

sys.stdout = JSStdoutStream()
sys.stderr = JSStderrStream()
`);

    isInitializing = false;
    postMsg({ type: 'INIT_SUCCESS' });
    return pyodideInstance;
  } catch (err) {
    isInitializing = false;
    postMsg({ type: 'INIT_ERROR', error: String(err) });
    throw err;
  }
}

// Run user code
async function executeCode(code, stdinInputs = [], executionId) {
  if (!pyodideInstance) {
    await initPyodide();
  }

  currentExecutionId = executionId;
  const startTime = Date.now();

  try {
    // Inject custom stdin queue for this run
    pyodideInstance.globals.set('__user_stdin_inputs__', stdinInputs);

    await pyodideInstance.runPythonAsync(`
import builtins
import js

_inputs_queue = list(__user_stdin_inputs__)

def _custom_input(prompt=""):
    if prompt:
        js.onPythonStdout(str(prompt))
    if len(_inputs_queue) > 0:
        val = str(_inputs_queue.pop(0))
        # Echo entered input to stdout
        js.onPythonStdout(val + "\\n")
        return val
    # If no more input provided, return empty string
    return ""

builtins.input = _custom_input
`);

    // Run the actual user code
    await pyodideInstance.runPythonAsync(code);

    const executionTimeMs = Date.now() - startTime;
    postMsg({
      type: 'RUN_SUCCESS',
      stdout: '',
      executionTimeMs,
      executionId,
    });
  } catch (err) {
    const rawTraceback = String(err);
    // Parse error type from traceback
    const lines = rawTraceback.trim().split('\\n');
    const lastLine = lines[lines.length - 1] || '';
    const match = lastLine.match(/^([A-Za-z0-9_]+Error|[A-Za-z0-9_]+Exception)/);
    const errorType = match ? match[1] : 'PythonError';

    postMsg({
      type: 'RUN_ERROR',
      error: rawTraceback,
      errorType,
      traceback: rawTraceback,
      executionId,
    });
  } finally {
    currentExecutionId = null;
  }
}

// Message handler from Main Thread
self.onmessage = async function(event) {
  const data = event.data;
  if (!data) return;

  switch (data.type) {
    case 'INIT':
      initPyodide().catch(() => {});
      break;

    case 'RUN_CODE':
      executeCode(data.code, data.stdinInputs || [], data.executionId).catch(() => {});
      break;

    default:
      console.warn('Unknown worker message type:', data.type);
  }
};
