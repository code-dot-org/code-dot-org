import {Dispatch, AnyAction} from 'redux';

import {getStore} from '@cdo/apps/code-studio/redux';
import CodebridgeRegistry from '@cdo/apps/codebridge/CodebridgeRegistry';
import {ExecutionType} from '@cdo/apps/javalab/constants';
// The legacy Javabuilder connection is reused as-is. A TS port can come later;
// for Phase 1 we only need a working console run.
import JavabuilderConnection from '@cdo/apps/javalab/JavabuilderConnection';
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

function writeToConsole(message: string) {
  CodebridgeRegistry.getInstance()
    .getConsoleManager()
    ?.writeConsoleMessage(message);
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

  // Phase 1 wires the bare minimum: console output, no mini-app, no captcha
  // handling, no validation result reporting. Callbacks for those slots are
  // no-ops so the legacy class still satisfies its contract.
  activeConnection = new JavabuilderConnection(
    writeToConsole,
    /* miniApp */ null,
    serverLevelId,
    /* options */ {},
    writeNewline,
    /* setIsRunning */ () => {},
    /* setIsTesting */ () => {},
    ExecutionType.RUN,
    /* miniAppType */ undefined,
    state.currentUser,
    /* onMarkdownLog */ writeToConsole,
    csrfToken,
    /* onValidationPassed */ () => {},
    /* onValidationFailed */ () => {},
    /* onConnectDone */ () => {},
    /* setIsCaptchaDialogOpen */ () => {}
  );

  activeConnection.connectJavabuilder();
}

export function stopJavaCode(): void {
  if (activeConnection) {
    activeConnection.closeConnection();
    activeConnection = null;
  }
}
