import {
  WebSocketMessageType,
  StatusMessageType,
  STATUS_MESSAGE_PREFIX,
  ExecutionType,
  AuthorizerSignalType
} from './constants';
import {handleException} from './javabuilderExceptionHandler';
import project from '@cdo/apps/code-studio/initApp/project';
import javalabMsg from '@cdo/javalab/locale';
import {onTestResult} from './testResultHandler';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';

// Creates and maintains a websocket connection with javabuilder while a user's code is running.
export default class JavabuilderConnection {
  constructor(
    javabuilderUrl,
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
    csrfToken
  ) {
    this.channelId = project.getCurrentId();
    this.javabuilderUrl = javabuilderUrl;
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
            'X-CSRF-Token': this.csrfToken
          }
        }
      : {
          url: url,
          type: 'get',
          data: data
        };

    this.onOutputMessage(`${STATUS_MESSAGE_PREFIX} ${javalabMsg.connecting()}`);
    this.onNewlineMessage();

    $.ajax(ajaxPayload)
      .done(result => this.establishWebsocketConnection(result.token))
      .fail(error => {
        if (error.status === 403) {
          this.displayUnauthorizedMessage(error);
        } else {
          this.onOutputMessage(javalabMsg.errorJavabuilderConnectionGeneral());
          this.onNewlineMessage();
          console.error(error.responseText);
        }
      });
  }

  getDefaultRequestData() {
    return {
      levelId: this.levelId,
      options: this.options,
      executionType: this.executionType,
      useDashboardSources: false,
      miniAppType: this.miniAppType
    };
  }

  establishWebsocketConnection(token) {
    const url = `${this.javabuilderUrl}?Authorization=${token}`;
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
    this.miniApp?.onCompile?.();
  }

  onStatusMessage(messageKey, detail) {
    let message;
    let lineBreakCount = 0;
    switch (messageKey) {
      case StatusMessageType.COMPILING:
        message = javalabMsg.compiling();
        lineBreakCount = 1;
        break;
      case StatusMessageType.COMPILATION_SUCCESSFUL:
        message = javalabMsg.compilationSuccess();
        lineBreakCount = 1;
        break;
      case StatusMessageType.RUNNING:
        message = javalabMsg.running();
        lineBreakCount = 2;
        break;
      case StatusMessageType.GENERATING_PROGRESS:
        message = javalabMsg.generatingProgress({
          progressTime: detail.progressTime
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
    switch (data.type) {
      case WebSocketMessageType.STATUS:
        this.onStatusMessage(data.value, data.detail);
        break;
      case WebSocketMessageType.SYSTEM_OUT:
        this.onOutputMessage(data.value);
        break;
      case WebSocketMessageType.TEST_RESULT:
        onTestResult(data, this.onOutputMessage);
        this.onNewlineMessage();
        break;
      case WebSocketMessageType.NEIGHBORHOOD:
      case WebSocketMessageType.THEATER:
      case WebSocketMessageType.PLAYGROUND:
        this.miniApp.handleSignal(data);
        break;
      case WebSocketMessageType.EXCEPTION:
        this.onNewlineMessage();
        handleException(data, this.onOutputMessage);
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
    if (event.wasClean) {
      console.log(`[close] code=${event.code} reason=${event.reason}`);
    } else {
      // e.g. server process ended or network down
      // event.code is usually 1006 in this case
      console.log(`[close] Connection died. code=${event.code}`);
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
      'We hit an error connecting to our server. Try again.'
    );
    this.onNewlineMessage();
    this.handleExecutionFinished();
    console.error(`[error] ${error.message}`);
  }

  onTimeout() {
    this.setIsRunning(false);
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
    }
  }

  handleExecutionFinished() {
    switch (this.executionType) {
      case ExecutionType.RUN:
        this.setIsRunning(false);
        break;
      case ExecutionType.TEST:
        this.setIsTesting(false);
        break;
    }
  }

  onAuthorizerMessage(value, detail) {
    let message = '';
    switch (value) {
      case AuthorizerSignalType.TOKEN_USED:
        message = javalabMsg.authorizerTokenUsed();
        break;
      case AuthorizerSignalType.NEAR_LIMIT:
        message = javalabMsg.authorizerNearLimit({
          attemptsLeft: detail.remaining
        });
        break;
      case AuthorizerSignalType.USER_BLOCKED:
        message = javalabMsg.userBlocked();
        break;
      case AuthorizerSignalType.CLASSROOM_BLOCKED:
        message = javalabMsg.classroomBlocked();
        break;
    }
    this.onOutputMessage(`${STATUS_MESSAGE_PREFIX} ${message}`);
    this.onNewlineMessage();
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
        unauthorizedMessage = javalabMsg.unauthorizedJavabuilderConnectionTeacher();
      } else {
        unauthorizedMessage = javalabMsg.unauthorizedJavabuilderConnectionStudent();
      }
    } else {
      unauthorizedMessage = javalabMsg.unauthorizedJavabuilderConnectionNotLoggedIn();
    }

    // Send unauthorized message as markdown as some unauthorized messages contain links
    // for further details.
    this.onMarkdownLog(unauthorizedMessage);
    this.onNewlineMessage();
  }
}
