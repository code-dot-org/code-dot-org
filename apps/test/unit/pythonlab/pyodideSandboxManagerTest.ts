import {setCodeEnvironmentError} from '@cdo/apps/lab2/redux/systemRedux';
import {FromPyodideSandboxMessage} from '@cdo/apps/pythonlab/sandbox/constants';

const SANDBOX_ORIGIN = 'http://pyodide-sandbox.preview.codeprojects.org';
const READY_TIMEOUT_MS = 20000;

const mockDispatch = jest.fn();
const mockLogWarning = jest.fn();

jest.mock('@cdo/apps/redux', () => ({
  getStore: () => ({dispatch: mockDispatch}),
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
    getConsoleManager: () => null,
    getNeighborhood: () => null,
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
const loadManager = () =>
  jest.isolateModules(() => {
    require('@cdo/apps/pythonlab/pyodideSandboxManager');
  });

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
    expect(action.payload).toContain(
      'https://code.org/en-US/about/it-requirements'
    );
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
});
