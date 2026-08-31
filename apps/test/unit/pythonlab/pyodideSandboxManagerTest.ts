import {setCodeEnvironmentError} from '@cdo/apps/lab2/redux/systemRedux';
import {FromPyodideSandboxMessage} from '@cdo/apps/pythonlab/sandbox/constants';

const SANDBOX_ORIGIN = 'http://pyodide-sandbox.preview.codeprojects.org';
const READY_TIMEOUT_MS = 15000;

const mockDispatch = jest.fn();
const mockLogWarning = jest.fn();
const mockWriteConsoleMessage = jest.fn();
let mockIsRunning = false;
// Non-null only on neighborhood levels, which is what decides whether a status
// line is allowed to take focus.
let mockNeighborhood: object | null = null;

jest.mock('@cdo/apps/redux', () => ({
  getStore: () => ({
    dispatch: mockDispatch,
    getState: () => ({lab2System: {isRunning: mockIsRunning}}),
  }),
}));

jest.mock('@cdo/apps/lab2/Lab2Registry', () => ({
  getInstance: () => ({
    getMetricsReporter: () => ({
      logWarning: mockLogWarning,
      logError: jest.fn(),
      incrementCounter: jest.fn(),
      reportLoadTime: jest.fn(),
    }),
  }),
}));

jest.mock('@codebridge/CodebridgeRegistry', () => ({
  getInstance: () => ({
    getConsoleManager: () => ({
      writeConsoleMessage: mockWriteConsoleMessage,
      writePartialLine: jest.fn(),
    }),
    getNeighborhood: () => mockNeighborhood,
  }),
}));

jest.mock('@cdo/apps/util/codeprojectsPreviewOrigin', () => ({
  getInnerEnvironment: () => ({subdomain: '', isLocalhost: false, port: ''}),
}));

jest.mock('@cdo/apps/util/sandboxedPreviewDomain', () => ({
  getPreviewDomain: () => 'codeprojects.org',
}));

// The manager creates its sandbox iframe and starts its timer at import time, so
// each test loads a fresh copy of the module.
const loadManager = () => {
  let manager: typeof import('@cdo/apps/pythonlab/pyodideSandboxManager');
  jest.isolateModules(() => {
    manager = require('@cdo/apps/pythonlab/pyodideSandboxManager');
  });
  // isolateModules runs its callback synchronously, so this is always assigned.
  return manager!;
};

const sendSandboxReady = () =>
  window.dispatchEvent(
    new MessageEvent('message', {
      data: {type: FromPyodideSandboxMessage.READY},
      origin: SANDBOX_ORIGIN,
    })
  );

describe('pyodideSandboxManager', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockIsRunning = false;
    mockNeighborhood = null;
    document.body.innerHTML = '';
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('reports an unreachable sandbox when the iframe never signals ready', () => {
    loadManager();

    jest.advanceTimersByTime(READY_TIMEOUT_MS);

    const [action] =
      mockDispatch.mock.calls[mockDispatch.mock.calls.length - 1];
    expect(action.type).toBe(setCodeEnvironmentError.type);
    expect(action.payload).toContain('firewall');
    expect(action.payload).toContain('https://code.org/educate/it');
    expect(mockLogWarning).toHaveBeenCalled();
  });

  it('reports nothing when the sandbox signals ready in time', () => {
    loadManager();

    sendSandboxReady();
    jest.advanceTimersByTime(READY_TIMEOUT_MS);

    expect(mockLogWarning).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({
        type: setCodeEnvironmentError.type,
        payload: expect.any(String),
      })
    );
  });

  it('retracts the report when a slow sandbox eventually signals ready', () => {
    loadManager();

    jest.advanceTimersByTime(READY_TIMEOUT_MS);
    sendSandboxReady();

    expect(mockDispatch).toHaveBeenCalledWith(setCodeEnvironmentError(null));
  });

  it('says nothing about stopping a program that was never running', () => {
    const manager = loadManager();

    manager.restartPyodideIfProgramIsRunning();

    expect(mockWriteConsoleMessage).not.toHaveBeenCalled();
  });

  it('reports stopping a program the user was shown as running', () => {
    const manager = loadManager();
    mockIsRunning = true;

    manager.restartPyodideIfProgramIsRunning();

    expect(mockWriteConsoleMessage).toHaveBeenCalledWith(
      expect.stringContaining('stopped'),
      true
    );
  });

  // The neighborhood narrates its run to a screen reader, and focus landing in
  // the console makes the reader read the terminal over that narration.
  it('does not take focus to report stopping on a neighborhood level', () => {
    const manager = loadManager();
    mockIsRunning = true;
    mockNeighborhood = {};

    manager.restartPyodideIfProgramIsRunning();

    expect(mockWriteConsoleMessage).toHaveBeenCalledWith(
      expect.stringContaining('stopped'),
      false
    );
  });
});
