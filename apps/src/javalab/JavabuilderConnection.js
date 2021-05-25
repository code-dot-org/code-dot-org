/* globals dashboard */
import {WebSocketMessageType} from './constants';
import {handleException} from './javabuilderExceptionHandler';

// Creates and maintains a websocket connection with javabuilder while a user's code is running.
export default class JavabuilderConnection {
  constructor(
    channelId,
    javabuilderUrl,
    onMessage,
    miniApp,
    serverLevelId,
    options
  ) {
    this.channelId = channelId;
    this.javabuilderUrl = javabuilderUrl;
    this.onOutputMessage = onMessage;
    this.miniApp = miniApp;
    this.levelId = serverLevelId;
    this.options = options;
  }

  // Get the access token to connect to javabuilder and then open the websocket connection.
  // The token prevents access to our javabuilder AWS execution environment by un-verified users.
  connectJavabuilder() {
    $.ajax({
      url: '/javabuilder/access_token',
      type: 'get',
      data: {
        projectUrl: dashboard.project.getProjectSourcesUrl(),
        channelId: this.channelId,
        projectVersion: dashboard.project.getCurrentSourceVersionId(),
        levelId: this.levelId,
        options: this.options
      }
    })
      .done(result => this.establishWebsocketConnection(result.token))
      .fail(error => {
        this.onOutputMessage(
          'We hit an error connecting to our server. Try again.'
        );
        console.error(error.responseText);
      });
  }

  establishWebsocketConnection(token) {
    let url = this.javabuilderUrl;
    if (window.location.hostname.includes('localhost')) {
      // We're hitting the local javabuilder server. Just pass the projectUrl and levelId.
      // TODO: Enable token decryption on local javabuilder server.
      url += `?projectUrl=${dashboard.project.getProjectSourcesUrl()}?levelId=${
        this.levelId
      }`;
    } else {
      url += `?Authorization=${token}`;
    }

    this.socket = new WebSocket(url);
    this.socket.onopen = this.onOpen.bind(this);
    this.socket.onmessage = this.onMessage.bind(this);
    this.socket.onclose = this.onClose.bind(this);
    this.socket.onerror = this.onError.bind(this);
  }

  onOpen() {
    this.onOutputMessage('Compiling...');
    this.miniApp?.onCompile?.();
  }

  onMessage(event) {
    const data = JSON.parse(event.data);
    switch (data.type) {
      case WebSocketMessageType.SYSTEM_OUT:
        this.onOutputMessage(data.value);
        break;
      case WebSocketMessageType.NEIGHBORHOOD:
        this.miniApp.handleSignal(data);
        break;
      case WebSocketMessageType.EXCEPTION:
        handleException(data, this.onOutputMessage);
        break;
      case WebSocketMessageType.DEBUBG:
        if (window.location.hostname.includes('localhost')) {
          this.onOutputMessage('--- Localhost debugging message ---');
          this.onOutputMessage(data.value);
        }
        break;
      default:
        console.log(data);
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

  onError(error) {
    this.onOutputMessage(
      'We hit an error connecting to our server. Try again.'
    );
    console.error(`[error] ${error.message}`);
  }

  // Send a message across the websocket connection to Javabuilder
  sendMessage(message) {
    this.socket.send(message);
  }
}
