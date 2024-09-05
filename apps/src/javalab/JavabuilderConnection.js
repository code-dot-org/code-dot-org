import project from '@cdo/apps/code-studio/initApp/project';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import logToCloud from '@cdo/apps/logToCloud';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';
import javalabMsg from '@cdo/javalab/locale';

import {
  WebSocketMessageType,
  StatusMessageType,
  STATUS_MESSAGE_PREFIX,
  ExecutionType,
  AuthorizerSignalType,
  CsaViewMode,
  JavabuilderLockoutType,
  JavabuilderExceptionType,
} from './constants';
import {handleException} from './javabuilderExceptionHandler';
import {onTestResult} from './testResultHandler';
import {getUnsupportedMiniAppMessage} from './utils';

const WEBSOCKET_CLOSED_NORMAL_CODE = 1000;
const SERVER_WAIT_TIME_MS = 10000;

// Creates and maintains a websocket connection with javabuilder while a user's code is running.
export default class JavabuilderConnection {
  constructor(
    onMessage,
    miniApp,
    serverLevelId,
    options,
    onNewlineMessage,
    setIsRunning,
    setIsTesting,
    executionType,
    miniAppType,
    currentUser,
    onMarkdownLog,
    csrfToken,
    onValidationPassed,
    onValidationFailed,
    onConnectDone,
    setIsCaptchaDialogOpen
  ) {
    this.channelId = project.getCurrentId();
    this.onOutputMessage = onMessage;
    this.miniApp = miniApp;
    this.levelId = serverLevelId;
    this.options = options;
    this.onNewlineMessage = onNewlineMessage;
    this.setIsRunning = setIsRunning;
    this.setIsTesting = setIsTesting;
    this.executionType = executionType;
    this.miniAppType = miniAppType;
    this.currentUser = currentUser;
    this.onMarkdownLog = onMarkdownLog;
    this.csrfToken = csrfToken;
    this.onValidationPassed = onValidationPassed;
    this.onValidationFailed = onValidationFailed;
    this.onConnectDone = onConnectDone;
    this.setIsCaptchaDialogOpen = setIsCaptchaDialogOpen;

    this.seenUnsupportedNeighborhoodMessage = false;
    this.seenUnsupportedTheaterMessage = false;
    this.sawValidationTests = false;
    this.allValidationPassed = true;
    this.seenMessage = false;
    this.hadWebsocketConnectionError = false;
  }

  // Get the access token to connect to javabuilder and then open the websocket connection.
  // The token prevents access to our javabuilder AWS execution environment by un-verified users.
  // This method should be used for any connection to Javabuilder that does not require a special override
  // for sources or validation.
  connectJavabuilder() {
    let requestData = this.getDefaultRequestData();
    requestData.channelId = this.channelId;

    this.connectJavabuilderHelper(
      '/javabuilder/access_token',
      requestData,
      /* checkProjectEdited */ true
    );
  }

  // Get the access token to connect to javabuilder and then open the websocket connection.
  // When getting the access token, send override sources to run instead of attempting to find
  // sources based on a channel id.
  // The token prevents access to our javabuilder AWS execution environment by un-verified users.
  connectJavabuilderWithOverrideSources(overrideSources) {
    let requestData = this.getDefaultRequestData();
    requestData.overrideSources = overrideSources;
    // we include the channel id so that assets are available
    requestData.channelId = this.channelId;

    // When we have override sources, we do not need to check if the project has been edited,
    // as the override sources are what we want to run.
    this.connectJavabuilderHelper(
      '/javabuilder/access_token_with_override_sources',
      requestData,
      /* checkProjectEdited */ false,
      /* usePostRequest */ true
    );
  }

  // Get the access token to connect to javabuilder and then open the websocket connection.
  // When getting the access token, send override validation code to run instead of any existing validation
  // code on the level.
  // The token prevents access to our javabuilder AWS execution environment by un-verified users.
  connectJavabuilderWithOverrideValidation(overrideValidation) {
    let requestData = this.getDefaultRequestData();
    requestData.channelId = this.channelId;
    requestData.overrideValidation = overrideValidation;

    this.connectJavabuilderHelper(
      '/javabuilder/access_token_with_override_validation',
      requestData,
      /* checkProjectEdited */ true,
      /* usePostRequest */ true
    );
  }

  connectJavabuilderHelper(url, data, checkProjectEdited, usePostRequest) {
    this.initiateConnection(url, data, checkProjectEdited, usePostRequest).then(
      this.onConnectDone
    );
  }

  async initiateConnection(url, data, checkProjectEdited, usePostRequest) {
    // Don't attempt to connect to Javabuilder if we do not have a project
    // and we want to check the edit status.
    // This typically occurs if a teacher is trying to view a student's project
    // that has not been modified from the starter code.
    // This case does not apply to students, who are able to execute unmodified starter code.
    // See this comment for more detail: https://github.com/code-dot-org/code-dot-org/pull/42313#discussion_r701417221
    if (checkProjectEdited && project.getCurrentId() === undefined) {
      this.onOutputMessage(javalabMsg.errorProjectNotEditedYet());
      return;
    }

    const ajaxPayload = usePostRequest
      ? {
          url: url,
          type: 'post',
          data: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': this.csrfToken,
          },
        }
      : {
          url: url,
          type: 'get',
          data: data,
        };

    this.onOutputMessage(`${STATUS_MESSAGE_PREFIX} ${javalabMsg.connecting()}`);
    this.onNewlineMessage();

    try {
      const result = await $.ajax(ajaxPayload);
      this.resetRunState();
      this.establishWebsocketConnection(result.javabuilder_url, result.token);
    } catch (error) {
      if (error.status === 403) {
        if (error.responseJSON?.captcha_required === true) {
          this.setIsCaptchaDialogOpen(true);
          this.onOutputMessage(javalabMsg.verificationRequiredMessage());
          this.onNewlineMessage();
        } else {
          this.displayUnauthorizedMessage(error);
        }
      } else {
        this.onOutputMessage(
          `${STATUS_MESSAGE_PREFIX} ${javalabMsg.errorJavabuilderConnectionGeneral()}`
        );
        this.onNewlineMessage();
        console.error(error.responseText);
      }
    }
  }

  getDefaultRequestData() {
    return {
      levelId: this.levelId,
      options: this.options,
      executionType: this.executionType,
      useDashboardSources: false,
      miniAppType: this.miniAppType,
    };
  }

  establishWebsocketConnection(javabuilderUrl, token) {
    const url = `${javabuilderUrl}?Authorization=${token}`;
    this.socket = new WebSocket(url);
    this.socket.onopen = this.onOpen.bind(this);
    this.socket.onmessage = this.onMessage.bind(this);
    this.socket.onclose = this.onClose.bind(this);
    this.socket.onerror = this.onError.bind(this);
  }

  onOpen() {
    // We need to send an initial message to Javabuilder here in case there was an issue
    // with our token. Javabuilder will send back an error message with details, but can
    // only do so once we've sent a message. This is a bit of a hack, but this should only
    // happen if our token was somehow valid for the initial Javabuilder HTTP request and
    // then became invalid when establishing the WebSocket connection.
    this.sendMessage(WebSocketMessageType.CONNECTED);
    // If we don't receive a message back within 10 seconds, Javabuilder may be at maximum capacity and
    // the request will be queued to execute when an instance is available. Notify the user that this may
    // be the case.
    setTimeout(() => {
      if (!this.seenMessage && this.socket.readyState === WebSocket.OPEN) {
        this.onOutputMessage(
          `${STATUS_MESSAGE_PREFIX} ${javalabMsg.waitingForServer()}`
        );
        this.onNewlineMessage();
      }
    }, SERVER_WAIT_TIME_MS);
    this.miniApp?.onCompile?.();
  }

  onStatusMessage(messageKey, detail) {
    let message;
    let lineBreakCount = 0;
    this.seenMessage = true;
    switch (messageKey) {
      case StatusMessageType.COMPILING:
        message = javalabMsg.compiling();
        lineBreakCount = 1;
        break;
      case StatusMessageType.COMPILATION_SUCCESSFUL:
        analyticsReporter.sendEvent(EVENTS.JAVALAB_COMPILATION_SUCCESS, {
          levelId: this.levelId,
        });
        message = javalabMsg.compilationSuccess();
        lineBreakCount = 1;
        break;
      case StatusMessageType.RUNNING:
        message = javalabMsg.running();
        lineBreakCount = 2;
        break;
      case StatusMessageType.GENERATING_PROGRESS:
        message = javalabMsg.generatingProgress({
          progressTime: detail.progressTime,
        });
        lineBreakCount = 1;
        break;
      case StatusMessageType.SENDING_VIDEO:
        message = javalabMsg.sendingVideo({totalTime: detail.totalTime});
        lineBreakCount = 1;
        break;
      case StatusMessageType.TIMEOUT_WARNING:
        message = javalabMsg.timeoutWarning();
        lineBreakCount = 1;
        break;
      case StatusMessageType.TIMEOUT:
        message = javalabMsg.timeout();
        // This should be the last message that Javalab receives,
        // so add an extra line break to separate status messages
        // from consecutive runs.
        lineBreakCount = 2;
        this.onTimeout();
        break;
      case StatusMessageType.EXITED:
        this.onNewlineMessage();
        this.onExit();
        break;
      case StatusMessageType.RUNNING_PROJECT_TESTS:
        message = javalabMsg.runningProjectTests();
        lineBreakCount = 2;
        break;
      case StatusMessageType.RUNNING_VALIDATION:
        message = javalabMsg.runningValidation();
        lineBreakCount = 2;
        break;
      case StatusMessageType.NO_TESTS_FOUND:
        this.onNewlineMessage();
        message = javalabMsg.noTestsFound();
        break;
      default:
        break;
    }
    if (message) {
      this.onOutputMessage(`${STATUS_MESSAGE_PREFIX} ${message}`);
    }
    for (let lineBreak = 0; lineBreak < lineBreakCount; lineBreak++) {
      this.onNewlineMessage();
    }
  }

  onMessage(event) {
    const data = JSON.parse(event.data);
    let testResult;
    switch (data.type) {
      case WebSocketMessageType.STATUS:
        this.onStatusMessage(data.value, data.detail);
        break;
      case WebSocketMessageType.SYSTEM_OUT:
        this.onOutputMessage(data.value);
        break;
      case WebSocketMessageType.TEST_RESULT:
        testResult = onTestResult(
          data,
          this.onOutputMessage,
          this.miniAppType,
          this.levelId
        );
        if (testResult.isValidation) {
          this.sawValidationTests = true;
          if (!testResult.success) {
            this.allValidationPassed = false;
          }
        }
        this.onNewlineMessage();
        break;
      case WebSocketMessageType.NEIGHBORHOOD:
        if (this.miniAppType === CsaViewMode.NEIGHBORHOOD) {
          this.miniApp.handleSignal(data);
        } else {
          this.onUnsupportedNeighborhoodMessage();
        }
        break;
      case WebSocketMessageType.THEATER:
        if (this.miniAppType === CsaViewMode.THEATER) {
          this.miniApp.handleSignal(data);
        } else {
          this.onUnsupportedTheaterMessage();
        }
        break;
      case WebSocketMessageType.EXCEPTION:
        if (data.value === JavabuilderExceptionType.COMPILER_ERROR) {
          analyticsReporter.sendEvent(EVENTS.JAVALAB_COMPILATION_ERROR, {
            levelId: this.levelId,
          });
        }
        this.onNewlineMessage();
        handleException(data, this.onOutputMessage, this.miniAppType);
        this.onNewlineMessage();
        break;
      case WebSocketMessageType.DEBUG:
        if (window.location.hostname.includes('localhost')) {
          this.onOutputMessage('--- Localhost debugging message ---');
          this.onOutputMessage(data.value);
          this.onNewlineMessage();
        }
        break;
      case WebSocketMessageType.AUTHORIZER:
        this.onAuthorizerMessage(data.value, data.detail);
        break;
      default:
        break;
    }
  }

  onClose(event) {
    // Event code 1000 is "connection closed normally", so we should treat
    // it as an expected close event. For some reason many close events with code
    // 1000 are not marked as clean. We should treat them as clean.
    if (event.code === WEBSOCKET_CLOSED_NORMAL_CODE || event.wasClean) {
      // Don't notify the user here, the program ended as expected.
      // Mini apps handle setting the run state in this case, as the program
      // output may run longer than the program execution.
      console.log(`[close] code=${event.code} reason=${event.reason}`);
    } else {
      // e.g. server process ended or network down
      // event.code is usually 1006 in this case
      console.log(
        `[close] Connection died. code=${event.code} reason=${event.reason}`
      );
      // If we had a websocket connection error, we already sent a message to the
      // user and handled stopping the program.
      if (!this.hadWebsocketConnectionError) {
        // Notify the user that their program ended unexpectedly
        // and set the run state to false.
        this.onOutputMessage(
          `${STATUS_MESSAGE_PREFIX} ${javalabMsg.programEndedUnexpectedly()}`
        );
        // Add two newlines so there is a blank line between program executions.
        this.onNewlineMessage();
        this.onNewlineMessage();
        this.turnOffRunningOrTesting();
      }
    }
  }

  onExit() {
    if (this.miniApp && this.executionType === ExecutionType.RUN) {
      // miniApp on close should handle setting isRunning state as it
      // may not align with actual program execution. If mini app does
      // not have on close we won't toggle back automatically.
      this.miniApp.onClose?.();
    } else {
      // add blank line and program exited message to console logs
      this.onNewlineMessage();
      this.onOutputMessage(
        `${STATUS_MESSAGE_PREFIX} ${javalabMsg.programCompleted()}`
      );
      this.onNewlineMessage();
      this.handleExecutionFinished();
    }
  }

  onError(error) {
    this.onOutputMessage(
      `${STATUS_MESSAGE_PREFIX} ${javalabMsg.errorJavabuilderConnectionGeneral()}`
    );
    this.onNewlineMessage();
    this.handleExecutionFinished();
    console.error(`[error] ${error.message}`);
    this.reportWebSocketConnectionError(error.message);
  }

  onTimeout() {
    this.setIsRunning(false);
  }

  onUnsupportedNeighborhoodMessage() {
    if (!this.seenUnsupportedNeighborhoodMessage) {
      this.onOutputMessage(
        javalabMsg.exceptionMessage({
          message: getUnsupportedMiniAppMessage(CsaViewMode.NEIGHBORHOOD),
        })
      );
      this.onNewlineMessage();
      this.seenUnsupportedNeighborhoodMessage = true;
    }
  }

  onUnsupportedTheaterMessage() {
    if (!this.seenUnsupportedTheaterMessage) {
      this.onOutputMessage(
        javalabMsg.exceptionMessage({
          message: getUnsupportedMiniAppMessage(CsaViewMode.THEATER),
        })
      );
      this.onNewlineMessage();
      this.seenUnsupportedTheaterMessage = true;
    }
  }

  // Send a message across the websocket connection to Javabuilder
  sendMessage(message) {
    if (this.socket) {
      this.socket.send(message);
    }
  }

  // Closes web socket connection
  closeConnection() {
    if (this.socket) {
      this.socket.close();
      this.onOutputMessage(
        `${STATUS_MESSAGE_PREFIX} ${javalabMsg.programStopped()}`
      );
      this.onNewlineMessage();
    }
  }

  handleExecutionFinished() {
    if (this.sawValidationTests && this.allValidationPassed) {
      this.onValidationPassed();
    } else if (this.sawValidationTests) {
      this.onValidationFailed();
    }
    this.turnOffRunningOrTesting();
  }

  onAuthorizerMessage(value, detail) {
    let message = '';
    let stopProgram = false;
    switch (value) {
      case AuthorizerSignalType.TOKEN_USED:
        message = javalabMsg.authorizerTokenUsed();
        break;
      case AuthorizerSignalType.NEAR_LIMIT:
        if (detail.lockout_type === JavabuilderLockoutType.PERMANENT) {
          message = javalabMsg.authorizerNearLimit({
            attemptsLeft: detail.remaining,
            lockoutPeriod: detail.period.toLowerCase(),
          });
        } else {
          message = javalabMsg.authorizerNearLimitTemporary({
            attemptsLeft: detail.remaining,
            lockoutPeriod: detail.period.toLowerCase(),
          });
        }
        break;
      case AuthorizerSignalType.USER_BLOCKED:
        message = javalabMsg.userBlocked();
        stopProgram = true;
        break;
      case AuthorizerSignalType.USER_BLOCKED_TEMPORARY:
        message = javalabMsg.userBlockedTemporary();
        stopProgram = true;
        break;
      case AuthorizerSignalType.CLASSROOM_BLOCKED:
        message = javalabMsg.classroomBlocked();
        stopProgram = true;
        break;
    }
    this.onMarkdownLog(`${STATUS_MESSAGE_PREFIX} ${message}`);
    this.onNewlineMessage();
    if (stopProgram) {
      this.turnOffRunningOrTesting();
    }
  }

  displayUnauthorizedMessage(error) {
    const body = error.responseJSON;
    if (body && body.type === WebSocketMessageType.AUTHORIZER) {
      this.onAuthorizerMessage(body.value, body.detail);
      return;
    }

    let unauthorizedMessage;
    if (this.currentUser.signInState === SignInState.SignedIn) {
      if (this.currentUser.userType === 'teacher') {
        unauthorizedMessage =
          javalabMsg.unauthorizedJavabuilderConnectionTeacher();
      } else {
        unauthorizedMessage =
          javalabMsg.unauthorizedJavabuilderConnectionStudent();
      }
    } else {
      unauthorizedMessage =
        javalabMsg.unauthorizedJavabuilderConnectionNotLoggedIn();
    }

    // Send unauthorized message as markdown as some unauthorized messages contain links
    // for further details.
    this.onMarkdownLog(unauthorizedMessage);
    this.onNewlineMessage();
  }

  reportWebSocketConnectionError(errorMessage) {
    this.hadWebsocketConnectionError = true;
    logToCloud.addPageAction(
      logToCloud.PageAction.JavabuilderWebSocketConnectionError,
      {
        errorMessage,
        channelId: this.channelId,
      }
    );
  }

  resetRunState() {
    this.seenMessage = false;
    this.hadWebsocketConnectionError = false;
    this.sawValidationTests = false;
    this.allValidationPassed = true;
    this.seenUnsupportedNeighborhoodMessage = false;
    this.seenUnsupportedTheaterMessage = false;
  }

  turnOffRunningOrTesting() {
    switch (this.executionType) {
      case ExecutionType.RUN:
        this.setIsRunning(false);
        break;
      case ExecutionType.TEST:
        this.setIsTesting(false);
        break;
    }
  }
}
