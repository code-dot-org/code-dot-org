import {getStore} from '../redux';
import {appendOutputLog} from './javalabRedux';

// setup using details from https://javascript.info/websocket
let url;
let socket;
export default function connectAndRunCode(inputUrl) {
  getStore().dispatch(appendOutputLog('Connecting...'));
  url = inputUrl;
  getToken();
}

function getToken() {
  $.ajax({
    url: '/javabuilder/access_token',
    type: 'get',
    data: {
      projectUrl: dashboard.project.getProjectSourcesUrl(),
      channelId: getStore().getState().pageConstants.channelId,
      projectVersion: dashboard.project.getCurrentSourceVersionId()
    }
  })
    .done(result => onSuccess(result))
    .fail(error => onFail(error));
};

function onSuccess(result) {
  openWebsocket(result.token);
}

function onFail(error) {
  getStore().dispatch(appendOutputLog(`We hit an error connecting to our server. Try again.`));
  console.error(error.responseText)
}

function openWebsocket(token) {
  if (hostname.includes('localhost')) {
    // We're hitting the local javabuilder server. Just pass the projectUrl.
    // TODO: Enable token decryption on local javabuilder server.
    socket = new WebSocket(`${url}?projectUrl=${dashboard.project.getProjectSourcesUrl()}`);
  } else {
    socket = new WebSocket(`${url}?Authorization=${token}`);
  }
  socket.onopen = function(e) {
    getStore().dispatch(appendOutputLog('Compiling...'));
  };

  socket.onmessage = function(event) {
    getStore().dispatch(appendOutputLog(event.data));
  };

  socket.onclose = function(event) {
    if (event.wasClean) {
      console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
    } else {
      // e.g. server process ended or network down
      // event.code is usually 1006 in this case
      console.log(`[close] Connection died. code=${event.code}`);
    }
  };

  socket.onerror = function(error) {
    getStore().dispatch(appendOutputLog(`We hit an error connecting to our server. Try again.`));
    console.error(`[error] ${error.message}`);
  };
}

export function sendMessage(message) {
  socket.send(message);
}
