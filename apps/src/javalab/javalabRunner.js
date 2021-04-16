import {getStore} from '../redux';
import {appendOutputLog} from './javalabRedux';
import project from '@cdo/apps/code-studio/initApp/project';
// import {getCurrentSourceVersionId} from '@cdo/apps/code-studio/initApp/project';

let url;
export default function connectAndRunCode(inputUrl) {
  url = inputUrl;
  // getStore().dispatch(appendOutputLog("Hello from the runner!"))
  getToken();
}

function getToken() {
  // debugger;
  // TODO: Use token to connect to Java Builder
  $.ajax({
    url: '/javabuilder/access_token',
    type: 'get',
    data: {
      projectUrl: "https://studio.code.org/v3/sources/gzxs-3qIKTXinR4rYchhJKh3a4VzfuDYO0AOhuAnSKc", // dashboard.project.getProjectSourcesUrl(),
      channelId: getStore().getState().pageConstants.channelId,
      projectVersion: dashboard.project.getCurrentSourceVersionId()
    }
  })
    .done(result => onSuccess(result))
    .fail(result => onFail(result));
};

function onSuccess(result) {
  debugger;
  let shareUrl = dashboard.project.getProjectSourcesUrl();
  console.log(result)
  console.log(result.token)
  openWebsocket(result.token);
  // getStore().dispatch(appendOutputLog(token));
}

function onFail(error) {
  // debugger;
  console.log(error.responseText)
  // getStore().dispatch(appendOutputLog(token));
}

let socket;
function openWebsocket(token) {
  // debugger;
  url = "wss://nsgeezjyul.execute-api.us-east-1.amazonaws.com/development/"
  console.log(`${url}?projectUrl=${dashboard.project.getProjectSourcesUrl()}&Authorization=${token}`)
  socket = new WebSocket(`${url}?Authorization=${token}`);
  socket.onopen = function(e) {
    console.log("[open] Connection established");
    console.log("Sending to server");
    // socket.send("Jessie");
  };

  socket.onmessage = function(event) {
    console.log(`[message] Data received from server: ${event.data}`);
    getStore().dispatch(appendOutputLog(event.data));
  };

  socket.onclose = function(event) {
    if (event.wasClean) {
      console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
    } else {
      // e.g. server process killed or network down
      // event.code is usually 1006 in this case
      console.log('[close] Connection died');
    }
  };

  socket.onerror = function(error) {
    console.log('Error');
  };
}

export function sendMessage(message) {
  socket.send(message);
}
