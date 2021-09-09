import {
  WebSocketMessageType,
  StatusMessageType,
  STATUS_MESSAGE_PREFIX
} from './constants';
import {handleException} from './javabuilderExceptionHandler';
import project from '@cdo/apps/code-studio/initApp/project';
import javalabMsg from '@cdo/javalab/locale';

// Creates and maintains a websocket connection with javabuilder while a user's code is running.
export default class JavabuilderConnection {
  constructor(
    javabuilderUrl,
    onMessage,
    miniApp,
    serverLevelId,
    options,
    onNewlineMessage,
    setIsRunning
  ) {
    this.channelId = project.getCurrentId();
    this.javabuilderUrl = javabuilderUrl;
    this.onOutputMessage = onMessage;
    this.miniApp = miniApp;
    this.levelId = serverLevelId;
    this.options = options;
    this.onNewlineMessage = onNewlineMessage;
    this.setIsRunning = setIsRunning;
  }

  // Get the access token to connect to javabuilder and then open the websocket connection.
  // The token prevents access to our javabuilder AWS execution environment by un-verified users.
  connectJavabuilder() {
    // Don't attempt to connect to Javabuilder if we do not have a project identifier.
    // This typically occurs if a teacher is trying to view a student's project
    // that has not been modified from the starter code.
    // This case does not apply to students, who are able to execute unmodified starter code.
    // See this comment for more detail: https://github.com/code-dot-org/code-dot-org/pull/42313#discussion_r701417221
    if (project.getCurrentId() === undefined) {
      this.onOutputMessage(javalabMsg.errorProjectNotEditedYet());
      return;
    }

    $.ajax({
      url: '/javabuilder/access_token',
      type: 'get',
      data: {
        projectUrl: project.getProjectSourcesUrl(),
        channelId: this.channelId,
        projectVersion: project.getCurrentSourceVersionId(),
        levelId: this.levelId,
        options: this.options
      }
    })
      .done(result => this.establishWebsocketConnection(result.token))
      .fail(error => {
        if (error.status === 403) {
          this.onOutputMessage(
            javalabMsg.errorJavabuilderConnectionNotAuthorized()
          );
          this.onNewlineMessage();
        } else {
          this.onOutputMessage(javalabMsg.errorJavabuilderConnectionGeneral());
          this.onNewlineMessage();
          console.error(error.responseText);
        }
      });
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
    this.miniApp?.onCompile?.();
  }

  onStatusMessage(messageKey) {
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
      case StatusMessageType.GENERATING_RESULTS:
        message = javalabMsg.generatingResults();
        lineBreakCount = 1;
        break;
      case StatusMessageType.EXITED:
        this.onNewlineMessage();
        this.onExit();
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
        this.onStatusMessage(data.value);
        break;
      case WebSocketMessageType.SYSTEM_OUT:
        this.onOutputMessage(data.value);
        break;
      case WebSocketMessageType.NEIGHBORHOOD:
      case WebSocketMessageType.THEATER:
      case WebSocketMessageType.PLAYGROUND:
        this.miniApp.handleSignal(data);
        break;
      case WebSocketMessageType.EXCEPTION:
        handleException(data, this.onOutputMessage);
        this.onNewlineMessage();
        this.onExit();
        break;
      case WebSocketMessageType.DEBUG:
        if (window.location.hostname.includes('localhost')) {
          this.onOutputMessage('--- Localhost debugging message ---');
          this.onOutputMessage(data.value);
          this.onNewlineMessage();
        }
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
    if (this.miniApp) {
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
      // Set isRunning to false
      this.setIsRunning(false);
    }
  }

  onError(error) {
    this.onOutputMessage(
      'We hit an error connecting to our server. Try again.'
    );
    this.onNewlineMessage();
    // Set isRunning to false
    this.setIsRunning(false);
    console.error(`[error] ${error.message}`);
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
}
