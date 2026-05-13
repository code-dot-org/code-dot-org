// Glue between codebridge's Run/Stop controls and the Javabuilder WebSocket.
//
// `handleRunClick` is the function plugged into <Codebridge onRun=...>; it
// flattens the current MultiFileSource, opens a Javabuilder session, and
// streams output frames to the codebridge ConsoleManager until the run
// finishes. The promise it returns resolves when the run has fully ended,
// which is what lets codebridge flip isRunning back off.
//
// `stopJavaCode` closes the currently-active session. `sendStdin` forwards
// terminal input from codebridge's console back through the WebSocket.
import CodebridgeRegistry from '@codebridge/CodebridgeRegistry';
import {
  getSystemMessage,
  getTimestampMessage,
} from '@codebridge/Console/MessageHelpers';

import {handleException} from '@cdo/apps/javalab/javabuilderExceptionHandler';
import {onTestResult} from '@cdo/apps/javalab/testResultHandler';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {getStore} from '@cdo/apps/redux';
import {RunType} from '@cdo/apps/codebridge';
import {MultiFileSource} from '@cdo/apps/lab2/types';

import {
  CsaViewMode,
  ExecutionType,
  InputMessageType,
  JavabuilderMessage,
  STATUS_MESSAGE_PREFIX,
  StatusMessageType,
  WebSocketMessageType,
} from './javabuilderConstants';
import {JavabuilderClient} from './JavabuilderClient';
import {
  FileNameCollisionError,
  flattenForJavabuilder,
} from './sourceBundleAdapter';

const appName = 'javalab';

const STATUS_MESSAGES: Partial<Record<StatusMessageType, string>> = {
  [StatusMessageType.COMPILING]: 'Compiling...',
  [StatusMessageType.COMPILATION_SUCCESSFUL]: 'Compilation successful.',
  [StatusMessageType.RUNNING]: 'Running...',
  [StatusMessageType.RUNNING_PROJECT_TESTS]: 'Running tests...',
  [StatusMessageType.RUNNING_VALIDATION]: 'Running validation...',
  [StatusMessageType.NO_TESTS_FOUND]: 'No tests found.',
  [StatusMessageType.TIMEOUT_WARNING]:
    'Your program is taking a long time to finish.',
  [StatusMessageType.TIMEOUT]: 'Your program timed out.',
};

let activeClient: JavabuilderClient | null = null;

const writeStatus = (message: string) => {
  const cm = CodebridgeRegistry.getInstance().getConsoleManager();
  cm?.writeConsoleMessage(`${STATUS_MESSAGE_PREFIX} ${message}`);
};

const writeRaw = (message: string) => {
  CodebridgeRegistry.getInstance()
    .getConsoleManager()
    ?.writeConsoleMessage(message);
};

export interface RunJavalabOptions {
  runTests: boolean;
  /** When defined, replaces the source-derived validation hash for this run. */
  overrideValidation?: Record<string, string>;
}

export async function handleRunClick(
  runTests: boolean,
  source: MultiFileSource | undefined,
  levelId: number,
  csaViewMode: string | undefined,
  options: RunJavalabOptions = {runTests}
): Promise<void> {
  const cm = CodebridgeRegistry.getInstance().getConsoleManager();
  if (!source) {
    cm?.writeConsoleMessage(
      getSystemMessage('Nothing to run: no source files.', appName)
    );
    return;
  }

  cm?.writeConsoleMessage(
    getTimestampMessage(runTests ? RunType.TEST : RunType.RUN)
  );

  let bundle;
  try {
    bundle = flattenForJavabuilder(source);
  } catch (err) {
    if (err instanceof FileNameCollisionError) {
      writeRaw(getSystemMessage(err.message, appName));
      return;
    }
    throw err;
  }

  // Flush ProjectManager so the saved channel state matches what we are
  // about to execute (matters for save-on-run UX and remix snapshots).
  await Lab2Registry.getInstance().getProjectManager()?.flushSave();

  const channelId = getStore().getState().lab.channel?.id;
  // Rails javabuilder_sessions_controller#has_required_params? marks
  // miniAppType as a required parameter, so we always send a value — fall
  // back to 'console' for non-mini-app levels.
  const miniAppType = csaViewMode ?? CsaViewMode.CONSOLE;

  // Javabuilder's `options` is a small free-form hash; the only field the
  // server cares about today is useNeighborhood for neighborhood levels.
  const builderOptions: Record<string, unknown> = {};
  if (csaViewMode === CsaViewMode.NEIGHBORHOOD) {
    builderOptions.useNeighborhood = true;
  }

  await new Promise<void>(resolve => {
    activeClient = new JavabuilderClient(
      {
        levelId,
        channelId,
        miniAppType,
        executionType: runTests ? ExecutionType.TEST : ExecutionType.RUN,
        options: builderOptions,
        bundle,
        overrideValidation: options.overrideValidation,
      },
      {
        onMessage: msg => handleJavabuilderMessage(msg, levelId, csaViewMode),
        onWaitingForServer: () =>
          writeStatus('Waiting for an available server...'),
        onCaptchaRequired: () =>
          writeStatus(
            'A verification challenge is required before code can run.'
          ),
        onUnauthorized: () =>
          writeStatus(
            'You are not authorized to run code on this level right now.'
          ),
        onError: err => {
          const e = err as {status?: number; body?: unknown} | unknown;
          const status =
            typeof e === 'object' && e && 'status' in e ? e.status : undefined;
          writeStatus(
            status
              ? `Could not reach the Java code runner (HTTP ${status}).`
              : 'Could not reach the Java code runner.'
          );
          // eslint-disable-next-line no-console
          console.error('[javalab2] Javabuilder error:', err);
        },
        onDone: () => {
          activeClient = null;
          resolve();
        },
      }
    );
    activeClient.run();
  });
}

export function stopJavaCode(): void {
  activeClient?.close();
}

export function sendStdin(input: string): void {
  activeClient?.sendInput(input, InputMessageType.SYSTEM_IN);
}

function handleJavabuilderMessage(
  data: JavabuilderMessage,
  levelId: number,
  csaViewMode: string | undefined
): void {
  switch (data.type) {
    case WebSocketMessageType.STATUS: {
      const key = data.value as StatusMessageType;
      const message = STATUS_MESSAGES[key];
      if (key === StatusMessageType.EXITED) {
        writeStatus('Program complete.');
        return;
      }
      if (message) writeStatus(message);
      return;
    }
    case WebSocketMessageType.SYSTEM_OUT:
      if (typeof data.value === 'string') writeRaw(data.value);
      return;
    case WebSocketMessageType.TEST_RESULT:
      onTestResult(data, writeRaw, csaViewMode, levelId);
      return;
    case WebSocketMessageType.EXCEPTION:
      handleException(data, writeRaw, csaViewMode);
      return;
    case WebSocketMessageType.DEBUG:
      if (
        window.location.hostname.includes('localhost') &&
        typeof data.value === 'string'
      ) {
        writeRaw(`[debug] ${data.value}`);
      }
      return;
    // NEIGHBORHOOD, THEATER, AUTHORIZER are handled in later phases.
    default:
      return;
  }
}
