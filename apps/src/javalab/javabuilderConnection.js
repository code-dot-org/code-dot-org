import {getStore} from '../redux';
export default class JavabuilderConnection {
  constructor(javabuilderUrl, onMessage) {
    this.javabuilderUrl = javabuilderUrl;
    this.onOutputMessage = onMessage;
  }

  connectJavabuilder() {
    $.ajax({
      url: '/javabuilder/access_token',
      type: 'get',
      data: {
        projectUrl: dashboard.project.getProjectSourcesUrl(),
        channelId: getStore().getState().pageConstants.channelId,
        projectVersion: dashboard.project.getCurrentSourceVersionId()
      }
    })
      .done(result => this.establishConnection(result.token))
      .fail(error => {
        this.onOutputMessage(`We hit an error connecting to our server. Try again.`);
        console.error(error.responseText)
      });
  }

  establishConnection(token) {
    // if (hostname.includes('localhost')) {
      // We're hitting the local javabuilder server. Just pass the projectUrl.
      // TODO: Enable token decryption on local javabuilder server.
      this.socket = new WebSocket(`${this.javabuilderUrl}?projectUrl=${dashboard.project.getProjectSourcesUrl()}`);
    // } else {
    //   this.socket = new WebSocket(`${this.javabuilderUrl}?Authorization=${token}`);
    // }

    this.socket.onopen = () => {
      this.onOutputMessage('Compiling...');
    };

    this.socket.onmessage = (event) => {
      this.onOutputMessage(event.data);
    };

    this.socket.onclose = (event) => {
      if (event.wasClean) {
        console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
      } else {
        // e.g. server process ended or network down
        // event.code is usually 1006 in this case
        console.log(`[close] Connection died. code=${event.code}`);
      }
    };

    this.socket.onerror = (error) => {
      this.onOutputMessage(`We hit an error connecting to our server. Try again.`);
      console.error(`[error] ${error.message}`);
    };
  };

  sendMessage(message) {
    this.socket.send(message);
  }
}
