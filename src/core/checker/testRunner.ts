import { pyodideClient } from '../runner/PyodideClient';
import type { TestCase } from '../../types/task';
import { computeOutputDiff } from './diffViewer';
import type { OutputDiff } from './diffViewer';

export interface TestCaseResult {
  testCaseId: string;
  description?: string;
  passed: boolean;
  isHidden: boolean;
  stdin?: string;
  expectedStdout: string;
  actualStdout: string;
  errorMessage?: string;
  diff?: OutputDiff;
  executionTimeMs: number;
}

export interface TaskTestResults {
  totalTests: number;
  passedTests: number;
  allPassed: boolean;
  firstFailedIndex: number; // -1 if all passed
  details: TestCaseResult[];
}

export class TaskTestRunner {
  public static async runTests(
    code: string,
    testCases: TestCase[]
  ): Promise<TaskTestResults> {
    if (!testCases || testCases.length === 0) {
      // Fallback: simple code run with no assertions
      const runRes = await pyodideClient.runCode(code, { timeoutMs: 5000 });
      const passed = runRes.success;
      return {
        totalTests: 1,
        passedTests: passed ? 1 : 0,
        allPassed: passed,
        firstFailedIndex: passed ? -1 : 0,
        details: [
          {
            testCaseId: 'default',
            description: 'Базовый запуск без ошибок',
            passed,
            isHidden: false,
            expectedStdout: '',
            actualStdout: runRes.stdout,
            errorMessage: runRes.errorExplanation?.friendlyDescription,
            executionTimeMs: runRes.executionTimeMs,
          },
        ],
      };
    }

    const results: TestCaseResult[] = [];
    let passedCount = 0;
    let firstFailed = -1;

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const stdinInputs = tc.stdin ? tc.stdin.split('\n') : [];

      const runRes = await pyodideClient.runCode(code, {
        stdinInputs,
        timeoutMs: 5000,
      });

      if (!runRes.success) {
        // Runtime error or timeout
        results.push({
          testCaseId: tc.id,
          description: tc.description || `Тест ${i + 1}`,
          passed: false,
          isHidden: tc.isHidden,
          stdin: tc.stdin,
          expectedStdout: tc.expectedStdout,
          actualStdout: runRes.stdout,
          errorMessage: runRes.errorExplanation?.friendlyDescription || 'Ошибка выполнения программы',
          executionTimeMs: runRes.executionTimeMs,
        });

        if (firstFailed === -1) firstFailed = i;
        continue;
      }

      // Normalize stdout: remove trailing CRLF/LF differences
      const actualClean = runRes.stdout.replace(/\r\n/g, '\n').trimEnd();
      const expectedClean = tc.expectedStdout.replace(/\r\n/g, '\n').trimEnd();

      const passed = actualClean === expectedClean;
      const diff = computeOutputDiff(expectedClean, actualClean);

      if (passed) {
        passedCount++;
      } else if (firstFailed === -1) {
        firstFailed = i;
      }

      results.push({
        testCaseId: tc.id,
        description: tc.description || `Тест ${i + 1}`,
        passed,
        isHidden: tc.isHidden,
        stdin: tc.stdin,
        expectedStdout: tc.expectedStdout,
        actualStdout: runRes.stdout,
        diff,
        executionTimeMs: runRes.executionTimeMs,
      });
    }

    return {
      totalTests: testCases.length,
      passedTests: passedCount,
      allPassed: passedCount === testCases.length,
      firstFailedIndex: firstFailed,
      details: results,
    };
  }
}
