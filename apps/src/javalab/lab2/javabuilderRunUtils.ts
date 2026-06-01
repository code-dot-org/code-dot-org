import {Dispatch, AnyAction} from 'redux';

import {getStore} from '@cdo/apps/code-studio/redux';
import CodebridgeRegistry from '@cdo/apps/codebridge/CodebridgeRegistry';
import {ExecutionType, InputMessageType} from '@cdo/apps/javalab/constants';
import JavabuilderConnection from '@cdo/apps/javalab/JavabuilderConnection';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {
  getAppOptionsEditingExemplar,
  getIsStartMode,
} from '@cdo/apps/lab2/projects/utils';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
import {setHasRun} from '@cdo/apps/lab2/redux/systemRedux';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';

import {splitForLevelbuilderSave} from './sourceConverter';

// Module-local cache so onStop can close the active connection.
let activeConnection: JavabuilderConnection | null = null;

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
  dispatch: Dispatch<AnyAction>,
  levelId: number,
  csaViewMode: string
): Promise<void> {
  let csrfToken: string | null = null;
  try {
    csrfToken = await getAuthenticityToken();
  } catch (e) {
    csrfToken = null;
  }

  const state = getStore().getState();

  if (csaViewMode === 'theater') {
    // Theater is not yet supported.
    writeToConsole(
      `[JAVALAB] csaViewMode='${csaViewMode}' is not yet supported in Java Lab 2; running as console.`
    );
    writeNewline();
  }

  const miniApp =
    csaViewMode === 'neighborhood'
      ? CodebridgeRegistry.getInstance().getNeighborhood()
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

  // Levelbuilder edit modes (start / exemplar) and any read-only viewer
  // don't have a channel id. Send the in-memory source as override sources instead.
  // Strip validation files: they aren't part of the program being executed.
  const useOverrideSources =
    getIsStartMode() ||
    getAppOptionsEditingExemplar() ||
    isReadOnlyWorkspace(state);
  const overrideSources = useOverrideSources
    ? splitForLevelbuilderSave(
        state.lab2Project.projectSources?.source as MultiFileSource | undefined
      ).startSources
    : null;

  // Return a promise that stays pending until JavabuilderConnection signals
  // the program has finished (via its setIsRunning(false) callback.
  // This enables the run/stop state in Codebridge.
  // In neighborhood mode the connection hands exit off to miniApp.onClose()
  // instead, so this promise stays pending and Codebridge's ControlButtons
  // drives the run state instead.
  await new Promise<void>(resolve => {
    let resolved = false;
    const finishRun = (running: boolean) => {
      if (running || resolved) return;
      resolved = true;
      resolve();
    };

    // TODO: Theater, Captcha handling and validation result reporting
    activeConnection = new JavabuilderConnection(
      writeToConsole,
      miniApp,
      levelId,
      /* options */ {},
      writeNewline,
      /* setIsRunning */ finishRun,
      /* setIsTesting */ () => {},
      ExecutionType.RUN,
      miniAppType,
      state.currentUser,
      /* onMarkdownLog */ writeToConsole,
      csrfToken,
      /* onValidationPassed */ () => {},
      /* onValidationFailed */ () => {},
      /* onConnectDone */ () => {},
      /* setIsCaptchaDialogOpen */ () => {},
      channelId
    );

    if (overrideSources) {
      activeConnection.connectJavabuilderWithOverrideSources(overrideSources);
    } else {
      activeConnection.connectJavabuilder();
    }
  });
}

export function stopJavaCode(): void {
  if (activeConnection) {
    activeConnection.closeConnection();
    activeConnection = null;
  }
}

export function sendJavaConsoleInput(input: string): void {
  if (!activeConnection) return;
  activeConnection.sendMessage(
    JSON.stringify({messageType: InputMessageType.SYSTEM_IN, message: input})
  );
}
