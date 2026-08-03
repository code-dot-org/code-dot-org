import {Dispatch, AnyAction} from 'redux';

import {getStore} from '@cdo/apps/code-studio/redux';
import CodebridgeRegistry from '@cdo/apps/codebridge/CodebridgeRegistry';
import {ExecutionType, InputMessageType} from '@cdo/apps/javalab/constants';
import JavabuilderConnection from '@cdo/apps/javalab/JavabuilderConnection';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import ProgressManager, {
  ValidationResult,
} from '@cdo/apps/lab2/progress/ProgressManager';
import {
  getAppOptionsEditingExemplar,
  getAppOptionsViewingExemplar,
  getIsStartMode,
} from '@cdo/apps/lab2/projects/utils';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
import {setHasRun} from '@cdo/apps/lab2/redux/systemRedux';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';

import JavaValidationTracker from './progress/JavaValidationTracker';
import {splitForLevelbuilderSave} from './sourceConverter';

// Module-local cache so onStop can close the active connection.
let activeConnection: JavabuilderConnection | null = null;

// Monotonic run id. stopJavaCode and each new run bump it; a run
// suspended in an await aborts when it wakes to find its id stale.
let mostRecentRunId = 0;

// Javabuilder explicitly sends newline messages,
// so any other console output is written as a partial line
// to avoid extra newlines.
function writeToConsole(message: string) {
  CodebridgeRegistry.getInstance()
    .getConsoleManager()
    ?.writePartialLine(message);
}

function writeNewline() {
  CodebridgeRegistry.getInstance().getConsoleManager()?.writeConsoleMessage('');
}

export async function handleRunClick(
  runTests: boolean,
  dispatch: Dispatch<AnyAction>,
  levelId: number,
  csaViewMode: string,
  progressManager: ProgressManager | null,
  needsInitialSourcesSave: boolean
): Promise<void> {
  const thisRunId = ++mostRecentRunId;

  const state = getStore().getState();

  // Levelbuilder edit modes (start / exemplar) and read-only viewers don't
  // run from saved sources; they send the in-memory source as overrides
  // (below), so there is nothing to save before connecting.
  const inStartMode = getIsStartMode();
  const useOverrideSources =
    inStartMode ||
    getAppOptionsEditingExemplar() ||
    getAppOptionsViewingExemplar() ||
    isReadOnlyWorkspace(state);

  if (!useOverrideSources) {
    // Flush the in-memory editor first so S3 reflects what the user sees before the
    // WS connection opens. A brand-new project's start code has never been saved at all
    // (saves normally begin with the first edit), so force a full save instead.
    const projectManager = Lab2Registry.getInstance().getProjectManager();
    if (needsInitialSourcesSave && state.lab2Project.projectSources) {
      await projectManager?.save(
        state.lab2Project.projectSources,
        /* forceSave */ true,
        /* forceNewVersion */ false,
        /* skipSourcesChangedCheck */ true
      );
    } else {
      await projectManager?.flushSave();
    }
  }

  let csrfToken: string | null = null;
  try {
    csrfToken = await getAuthenticityToken();
  } catch (e) {
    csrfToken = null;
  }

  // The user may have stopped, or started a newer run, while this one was
  // suspended on the save or token fetch.
  if (thisRunId !== mostRecentRunId) {
    return;
  }

  const miniApp =
    csaViewMode === 'neighborhood'
      ? CodebridgeRegistry.getInstance().getNeighborhood()
      : csaViewMode === 'theater'
      ? CodebridgeRegistry.getInstance().getTheater()
      : null;

  // Only claim a mini-app mode when the instance is actually present;
  // otherwise fall back to console rather than crashing.
  const miniAppType = miniApp ? csaViewMode : 'console';

  // Ensure mini app is reset before each run.
  miniApp?.reset();

  dispatch(setHasRun(true));

  // Lab2 owns the channel id via ProjectManager rather than the legacy
  // `project` singleton, so pass it through explicitly.
  const channelId = Lab2Registry.getInstance()
    .getProjectManager()
    ?.getChannelId();

  // Send the in-memory source as override sources for the no-channel modes.
  // Strip validation files: they aren't part of the program being executed.
  const split = useOverrideSources
    ? splitForLevelbuilderSave(
        state.lab2Project.projectSources?.source as MultiFileSource | undefined
      )
    : null;
  const overrideSources = split?.startSources ?? null;
  // In start mode the validation files aren't always
  // saved to the level yet. When running tests, send them as override
  // validation so the levelbuilder can test before saving.
  const overrideValidation =
    inStartMode && runTests ? split?.validation : undefined;

  if (runTests) {
    // In start mode, we fully reset validation as if we are changing levels
    // in case the levelbuilder renamed a method. This prevents a confusing 'pending'
    // result for a now-nonexistent test.
    progressManager?.resetValidation(inStartMode);
    progressManager?.updateProgress();
  }
  const onValidationResult = (result: ValidationResult) => {
    JavaValidationTracker.getInstance().addValidationResult(result);
    progressManager?.updateProgress();
  };

  // Return a promise that resolves when the run is settled, which enables the
  // run/stop state in Codebridge.
  await new Promise<void>(resolve => {
    let resolved = false;
    const finishRun = (running?: boolean) => {
      if (running || resolved) return;
      resolved = true;
      if (runTests && progressManager) {
        progressManager.updateProgress();
      }
      resolve();
    };

    // TODO: Captcha handling.
    activeConnection = new JavabuilderConnection(
      writeToConsole,
      miniApp,
      levelId,
      /* options */ {},
      writeNewline,
      /* setIsRunning */ finishRun,
      /* setIsTesting */ finishRun,
      runTests ? ExecutionType.TEST : ExecutionType.RUN,
      miniAppType,
      state.currentUser,
      /* onMarkdownLog */ writeToConsole,
      csrfToken,
      /* onValidationPassed */ () => {},
      /* onValidationFailed */ () => {},
      /* onConnectDone */ () => {},
      /* setIsCaptchaDialogOpen */ () => {},
      channelId,
      /* onValidationResult */ onValidationResult
    );

    if (overrideSources) {
      activeConnection.connectJavabuilderWithOverrides(
        overrideSources,
        overrideValidation
      );
    } else {
      activeConnection.connectJavabuilder();
    }

    // Non-test run mini apps don't call finishRun() when the program completes,
    // so we resolve now rather than leaving the promise pending.
    if (miniApp && !runTests) {
      finishRun();
    }
  });
}

export function stopJavaCode(): void {
  // Invalidate any run that has no connection yet (still saving or fetching
  // the token); handleRunClick rechecks its captured id before connecting.
  mostRecentRunId++;
  // Stop the active mini-app so its output doesn't keep playing after stop:
  // the neighborhood's animation, the theater's image/audio.
  CodebridgeRegistry.getInstance().getNeighborhood()?.onStop();
  CodebridgeRegistry.getInstance().getTheater()?.onStop();
  if (activeConnection) {
    activeConnection.closeConnection();
    activeConnection = null;
  }
}

export function sendJavaConsoleInput(input: string): void {
  sendTypedInputMessage(InputMessageType.SYSTEM_IN, input);
}

// Relay an input message of a given type back to Javabuilder.
export function sendTypedInputMessage(
  messageType: string,
  message: string
): void {
  if (!activeConnection) return;
  activeConnection.sendMessage(JSON.stringify({messageType, message}));
}
