// All of the console.log statements here will be replaced with Firehose logging.
// Jira task here: https://codedotorg.atlassian.net/browse/CSA-613
export default function testJavabuilderWebsocketConnection() {
  try {
    console.log('attemping websocket connection');

    let socket = new WebSocket(
      'wss://javabuilderbeta.code.org?Authorization=connectivityTest'
    );

    socket.onopen = function(e) {
      socket.send('connectivityTest');
    };

    socket.onmessage = function(message) {
      if (message.data === 'success') {
        console.log('success');
      } else {
        console.log('unexpected response message');
      }
      socket.close();
    };

    socket.onerror = function(error) {
      console.log('websocket error');
    };
  } catch {
    console.log('unknown error');
  }
}
