import {getStore} from '@cdo/apps/code-studio/redux';
import CodebridgeRegistry from '@cdo/apps/codebridge/CodebridgeRegistry';
import JavabuilderConnection from '@cdo/apps/javalab/JavabuilderConnection';
import {
  handleRunClick,
  stopJavaCode,
} from '@cdo/apps/javalab/lab2/javabuilderRunUtils';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';

jest.mock('@cdo/apps/javalab/JavabuilderConnection');
jest.mock('@cdo/apps/util/AuthenticityTokenStore');
jest.mock('@cdo/apps/lab2/Lab2Registry');
jest.mock('@cdo/apps/codebridge/CodebridgeRegistry');
jest.mock('@cdo/apps/code-studio/redux');
jest.mock('@cdo/apps/lab2/projects/utils');
jest.mock('@cdo/apps/lab2/redux/lab2ReduxSelectors');
jest.mock('@cdo/apps/lab2/redux/systemRedux');
jest.mock('@cdo/apps/javalab/lab2/sourceConverter');
jest.mock('@cdo/apps/javalab/lab2/progress/JavaValidationTracker');

const mockJavabuilderConnection = JavabuilderConnection as jest.MockedClass<
  typeof JavabuilderConnection
>;
const mockGetAuthenticityToken = getAuthenticityToken as jest.MockedFunction<
  typeof getAuthenticityToken
>;

// Resolve all pending microtasks/macrotasks so an awaiting async function
// reaches its next suspension point.
function flushPromises() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

// handleRunClick resolves its run promise via the setIsRunning callback it
// hands the connection (6th constructor arg). The real connection fires it on
// program exit; the mock fires it immediately so the promise can settle.
const SET_IS_RUNNING_ARG = 5;

const projectSources = {source: {}};

describe('javabuilderRunUtils', () => {
  let neighborhoodOnStop: jest.Mock;
  let projectManagerSave: jest.Mock;
  let projectManagerFlushSave: jest.Mock;

  // The connection mock resolves the run promise immediately so awaited
  // handleRunClick calls can settle.
  function connectImmediately() {
    mockJavabuilderConnection.mockImplementation((...args: unknown[]) => {
      (args[SET_IS_RUNNING_ARG] as () => void)();
      return {
        connectJavabuilder: jest.fn(),
        connectJavabuilderWithOverrides: jest.fn(),
        closeConnection: jest.fn(),
      } as unknown as JavabuilderConnection;
    });
  }

  beforeEach(() => {
    jest.clearAllMocks();

    neighborhoodOnStop = jest.fn();
    projectManagerSave = jest.fn().mockResolvedValue(undefined);
    projectManagerFlushSave = jest.fn().mockResolvedValue(undefined);

    (Lab2Registry.getInstance as jest.Mock).mockReturnValue({
      getProjectManager: () => ({
        save: projectManagerSave,
        flushSave: projectManagerFlushSave,
        getChannelId: () => 'channel-1',
      }),
    });

    (CodebridgeRegistry.getInstance as jest.Mock).mockReturnValue({
      getNeighborhood: () => ({onStop: neighborhoodOnStop}),
      getConsoleManager: () => null,
    });

    (getStore as jest.Mock).mockReturnValue({
      getState: () => ({
        lab2Project: {projectSources},
        currentUser: {},
      }),
    });
  });

  it('does not open a javabuilder connection when stopped during the auth check', async () => {
    // Hold the token fetch open so stop can land while handleRunClick is
    // waiting on the auth check.
    let resolveToken: (token: string) => void = () => {};
    mockGetAuthenticityToken.mockReturnValue(
      new Promise<string>(resolve => {
        resolveToken = resolve;
      })
    );

    const runPromise = handleRunClick(
      /* runTests */ false,
      /* dispatch */ jest.fn(),
      /* levelId */ 1,
      /* csaViewMode */ 'console',
      /* progressManager */ null,
      /* needsInitialSourcesSave */ false
    );

    // Let handleRunClick run past flushSave and suspend on the token fetch.
    await flushPromises();
    expect(mockGetAuthenticityToken).toHaveBeenCalled();
    expect(mockJavabuilderConnection).not.toHaveBeenCalled();

    // Stop while the token fetch is still pending, then let it resolve.
    stopJavaCode();
    resolveToken('token');
    await runPromise;

    expect(mockJavabuilderConnection).not.toHaveBeenCalled();
  });

  it('does not revive a stopped run when a second run starts', async () => {
    // Hold run #1's token fetch open; run #2's resolves immediately.
    let resolveFirstToken: (token: string) => void = () => {};
    mockGetAuthenticityToken
      .mockReturnValueOnce(
        new Promise<string>(resolve => {
          resolveFirstToken = resolve;
        })
      )
      .mockResolvedValue('token');
    mockJavabuilderConnection.mockImplementation((...args: unknown[]) => {
      (args[SET_IS_RUNNING_ARG] as () => void)();
      return {
        connectJavabuilder: jest.fn(),
        connectJavabuilderWithOverrides: jest.fn(),
        closeConnection: jest.fn(),
      } as unknown as JavabuilderConnection;
    });

    const runArgs = [
      /* runTests */ false,
      /* dispatch */ jest.fn(),
      /* levelId */ 1,
      /* csaViewMode */ 'console',
      /* progressManager */ null,
      /* needsInitialSourcesSave */ false,
    ] as const;

    const firstRun = handleRunClick(...runArgs);
    // Let run #1 get past flushSave and suspend on the token fetch.
    await flushPromises();

    stopJavaCode();
    await handleRunClick(...runArgs);
    expect(mockJavabuilderConnection).toHaveBeenCalledTimes(1);

    // Run #1 wakes from the token fetch; it must not open a second connection.
    resolveFirstToken('token');
    await firstRun;
    expect(mockJavabuilderConnection).toHaveBeenCalledTimes(1);
  });

  it('opens a javabuilder connection when not stopped', async () => {
    mockGetAuthenticityToken.mockResolvedValue('token');
    connectImmediately();

    await handleRunClick(
      /* runTests */ false,
      /* dispatch */ jest.fn(),
      /* levelId */ 1,
      /* csaViewMode */ 'console',
      /* progressManager */ null,
      /* needsInitialSourcesSave */ false
    );

    expect(mockJavabuilderConnection).toHaveBeenCalledTimes(1);
    expect(projectManagerFlushSave).toHaveBeenCalled();
    expect(projectManagerSave).not.toHaveBeenCalled();
  });

  it('force-saves the start code before connecting when the project has never been saved', async () => {
    mockGetAuthenticityToken.mockResolvedValue('token');
    connectImmediately();

    await handleRunClick(
      /* runTests */ false,
      /* dispatch */ jest.fn(),
      /* levelId */ 1,
      /* csaViewMode */ 'console',
      /* progressManager */ null,
      /* needsInitialSourcesSave */ true
    );

    expect(projectManagerSave).toHaveBeenCalledWith(
      projectSources,
      /* forceSave */ true,
      /* forceNewVersion */ false,
      /* skipSourcesChangedCheck */ true
    );
    expect(projectManagerFlushSave).not.toHaveBeenCalled();
    expect(mockJavabuilderConnection).toHaveBeenCalledTimes(1);
  });

  it('does not save at all in a read-only workspace, which runs override sources', async () => {
    (isReadOnlyWorkspace as unknown as jest.Mock).mockReturnValueOnce(true);
    mockGetAuthenticityToken.mockResolvedValue('token');
    connectImmediately();

    await handleRunClick(
      /* runTests */ false,
      /* dispatch */ jest.fn(),
      /* levelId */ 1,
      /* csaViewMode */ 'console',
      /* progressManager */ null,
      /* needsInitialSourcesSave */ true
    );

    expect(projectManagerSave).not.toHaveBeenCalled();
    expect(projectManagerFlushSave).not.toHaveBeenCalled();
  });
});
