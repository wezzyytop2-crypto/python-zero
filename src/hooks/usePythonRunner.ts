import { useState, useEffect, useCallback, useRef } from 'react';
import { pyodideClient } from '../core/runner/PyodideClient';
import type { WorkerStatus, RunResult, ConsoleOutputItem } from '../types/runner';

export function usePythonRunner() {
  const [status, setStatus] = useState<WorkerStatus>(pyodideClient.getStatus());
  const [outputItems, setOutputItems] = useState<ConsoleOutputItem[]>([]);
  const [lastResult, setLastResult] = useState<RunResult | null>(null);
  const nextItemIdRef = useRef(1);

  useEffect(() => {
    const unsubStatus = pyodideClient.onStatus((s) => {
      setStatus(s);
    });

    const unsubStdout = pyodideClient.onStdout((text) => {
      setOutputItems((prev) => [
        ...prev,
        {
          id: `out_${nextItemIdRef.current++}`,
          type: 'stdout',
          text,
          timestamp: Date.now(),
        },
      ]);
    });

    const unsubStderr = pyodideClient.onStderr((text) => {
      setOutputItems((prev) => [
        ...prev,
        {
          id: `err_${nextItemIdRef.current++}`,
          type: 'stderr',
          text,
          timestamp: Date.now(),
        },
      ]);
    });

    return () => {
      unsubStatus();
      unsubStdout();
      unsubStderr();
    };
  }, []);

  const run = useCallback(async (code: string, stdinInputs?: string[]): Promise<RunResult> => {
    setOutputItems([]);
    setLastResult(null);

    const result = await pyodideClient.runCode(code, {
      stdinInputs,
      timeoutMs: 5000,
    });

    setLastResult(result);
    return result;
  }, []);

  const stop = useCallback(() => {
    pyodideClient.stop();
  }, []);

  const clear = useCallback(() => {
    setOutputItems([]);
    setLastResult(null);
  }, []);

  const addInputToHistory = useCallback((input: string) => {
    setOutputItems((prev) => [
      ...prev,
      {
        id: `in_${nextItemIdRef.current++}`,
        type: 'input-echo',
        text: input + '\n',
        timestamp: Date.now(),
      },
    ]);
  }, []);

  return {
    status,
    outputItems,
    lastResult,
    run,
    stop,
    clear,
    addInputToHistory,
  };
}
