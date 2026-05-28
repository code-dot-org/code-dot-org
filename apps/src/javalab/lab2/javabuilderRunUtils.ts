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
import {JavalabLevelProperties} from './types';

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
  levelProperties: JavalabLevelProperties
): Promise<void> {
  let csrfToken: string | null = null;
  try {
    csrfToken = await getAuthenticityToken();
  } catch (e) {
    csrfToken = null;
  }

  const state = getStore().getState();

  if (
    levelProperties.csaViewMode &&
    levelProperties.csaViewMode !== 'console'
  ) {
    // Neighborhood and theater are not yet supported.
    writeToConsole(
      `[JAVALAB] csaViewMode='${levelProperties.csaViewMode}' is not yet supported in Java Lab 2; running as console.`
    );
    writeNewline();
  }

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
  // the program has finished (via its setIsRunning(false) callback, fired
  // from onExit / onClose / onError / onTimeout). This enables the run/stop
  // state in Codebridge.
  await new Promise<void>(resolve => {
    let resolved = false;
    const finishRun = (running: boolean) => {
      if (running || resolved) return;
      resolved = true;
      resolve();
    };

    // Bare-minimum wiring for now: console output, no mini-app, no captcha
    // handling, no validation result reporting.
    activeConnection = new JavabuilderConnection(
      writeToConsole,
      /* miniApp */ null,
      levelProperties.id,
      /* options */ {},
      writeNewline,
      /* setIsRunning */ finishRun,
      /* setIsTesting */ () => {},
      ExecutionType.RUN,
      /* miniAppType */ levelProperties.csaViewMode || 'console',
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
