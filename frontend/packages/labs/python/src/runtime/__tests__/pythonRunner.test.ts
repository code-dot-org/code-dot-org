import {beforeEach, describe, expect, it, vi} from 'vitest';

import type {MultiFileSource, ProjectFile} from '@code-dot-org/core/api';
import {ProgressManager, TestResultValidator} from '@code-dot-org/progress';

import {pythonValidationTracker} from '../../progress/PythonValidationTracker';
import {asyncRun} from '../pyodideManager';
import {runPythonTests} from '../pythonRunner';

vi.mock('../pyodideManager', () => ({
  asyncRun: vi.fn(),
  preloadPyodide: vi.fn(),
  restartWorkerIfRunning: vi.fn(),
  sendInput: vi.fn(),
}));

const mockAsyncRun = vi.mocked(asyncRun);

const MAIN: ProjectFile = {
  id: '0',
  name: 'main.py',
  language: 'python',
  contents: 'def add(a, b):\n    return a + b\n',
  folderId: '0',
};

const VALIDATION: ProjectFile = {
  id: 'validation',
  name: 'validation.py',
  language: 'python',
  contents: 'import unittest\n',
  folderId: '0',
  type: 'validation',
};

const source = (...files: ProjectFile[]): MultiFileSource => ({
  files: Object.fromEntries(files.map(file => [file.id, file])),
  folders: {},
});

function makeManager() {
  const manager = new ProgressManager(() => {});
  manager.setValidator(new TestResultValidator(pythonValidationTracker));
  manager.onLevelChange({}, [
    {
      conditions: [{name: 'PASSED_ALL_TESTS', value: 'true'}],
      message: '',
      next: true,
    },
  ]);
  return manager;
}

describe('runPythonTests', () => {
  beforeEach(() => {
    mockAsyncRun.mockReset();
    pythonValidationTracker.reset(true);
  });

  it('satisfies the level when every validation test passes', async () => {
    mockAsyncRun.mockResolvedValue(
      JSON.stringify([
        {name: 'add(2, 3) returns 5', result: 'PASS'},
        {name: 'add(-1, 1) returns 0', result: 'EXPECTED_FAILURE'},
      ]),
    );
    const manager = makeManager();

    await runPythonTests(source(MAIN), VALIDATION, manager);

    expect(mockAsyncRun).toHaveBeenCalledWith(
      expect.stringContaining('run_validation_tests("validation.py")'),
      source(MAIN),
      VALIDATION,
    );
    expect(manager.getCurrentState().satisfied).toBe(true);
    expect(manager.getCurrentState().validationResults).toEqual([
      {message: 'add(2, 3) returns 5', result: 'PASS'},
      {message: 'add(-1, 1) returns 0', result: 'EXPECTED_FAILURE'},
    ]);
  });

  it('does not satisfy the level when a test fails', async () => {
    mockAsyncRun.mockResolvedValue(
      JSON.stringify([
        {name: 'add(2, 3) returns 5', result: 'PASS'},
        {name: 'add(-1, 1) returns 0', result: 'FAIL'},
      ]),
    );
    const manager = makeManager();

    await runPythonTests(source(MAIN), VALIDATION, manager);

    expect(manager.getCurrentState().satisfied).toBe(false);
    expect(manager.getCurrentState().validationResults).toHaveLength(2);
  });

  it('shows the previous results as pending while tests run', async () => {
    mockAsyncRun.mockResolvedValueOnce(
      JSON.stringify([{name: 'add(2, 3) returns 5', result: 'FAIL'}]),
    );
    const manager = makeManager();
    await runPythonTests(source(MAIN), VALIDATION, manager);

    let pending: unknown;
    mockAsyncRun.mockImplementationOnce(async () => {
      pending = manager.getCurrentState().validationResults;
      return undefined;
    });
    await runPythonTests(source(MAIN), VALIDATION, manager);

    expect(pending).toEqual([
      {message: 'add(2, 3) returns 5', result: 'PENDING'},
    ]);
  });

  it('leaves the level unsatisfied when the run is stopped', async () => {
    mockAsyncRun.mockResolvedValue(undefined);
    const manager = makeManager();

    await runPythonTests(source(MAIN), VALIDATION, manager);

    expect(manager.getCurrentState().satisfied).toBe(false);
  });

  it('uses a validation file carried in the project (start mode)', async () => {
    mockAsyncRun.mockResolvedValue(
      JSON.stringify([{name: 'test', result: 'PASS'}]),
    );
    const manager = makeManager();

    await runPythonTests(source(MAIN, VALIDATION), undefined, manager);

    expect(mockAsyncRun).toHaveBeenCalledWith(
      expect.stringContaining('run_validation_tests("validation.py")'),
      source(MAIN, VALIDATION),
      undefined,
    );
    expect(manager.getCurrentState().satisfied).toBe(true);
  });

  it("runs the student's own tests when the level has no validation file", async () => {
    mockAsyncRun.mockResolvedValue(undefined);
    const manager = makeManager();

    await runPythonTests(source(MAIN), undefined, manager);

    expect(mockAsyncRun).toHaveBeenCalledWith(
      expect.stringContaining("run_student_tests('test*.py')"),
      source(MAIN),
    );
    expect(pythonValidationTracker.getValidationResults()).toBeUndefined();
  });
});
