import {Dispatch, AnyAction} from 'redux';

import {getStore} from '@cdo/apps/code-studio/redux';
import CodebridgeRegistry from '@cdo/apps/codebridge/CodebridgeRegistry';
import {ExecutionType, InputMessageType} from '@cdo/apps/javalab/constants';
import JavabuilderConnection from '@cdo/apps/javalab/JavabuilderConnection';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {setHasRun} from '@cdo/apps/lab2/redux/systemRedux';

import {JavalabLevelProperties} from './types';

// Module-local cache so onStop can close the active connection.
let activeConnection: JavabuilderConnection | null = null;
let csrfToken: string | null = null;

async function ensureCsrfToken(): Promise<string | null> {
  if (csrfToken) return csrfToken;
  try {
    const response = await fetch('/project_commits/get_token', {method: 'GET'});
    csrfToken = response.headers.get('csrf-token');
  } catch (e) {
    csrfToken = null;
  }
  return csrfToken;
}

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
  await ensureCsrfToken();

  const state = getStore().getState();
  const serverLevelId =
    state.pageConstants?.serverLevelId ?? levelProperties.id;

  if (
    levelProperties.csaViewMode &&
    levelProperties.csaViewMode !== 'console'
  ) {
    // Neighborhood and theater are deferred to a later phase.
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

    // Phase 1 wires the bare minimum: console output, no mini-app, no captcha
    // handling, no validation result reporting.
    activeConnection = new JavabuilderConnection(
      writeToConsole,
      /* miniApp */ null,
      serverLevelId,
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

    activeConnection.connectJavabuilder();
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
