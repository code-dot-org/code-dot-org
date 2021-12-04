import $ from 'jquery';

// All of the console.log statements here will be replaced with Firehose logging.
// Jira task here: https://codedotorg.atlassian.net/browse/CSA-613
export default function testJavabuilderWebsocketConnection() {
  try {
    logToFirehose('started');
    console.log('attemping websocket connection');

    let socket = new WebSocket(
      'wss://javabuilderbeta.code.org?Authorization=connectivityTest'
    );

    socket.onopen = function(e) {
      socket.send('connectivityTest');
    };

    socket.onmessage = function(message) {
      if (message.data === 'success') {
        logToFirehose('success');
        console.log('success');
      } else {
        console.log('unexpected response message');
      }
      socket.close();
    };

    socket.onerror = function(error) {
      logToFirehose('websocket error', error.toString());
      console.log('websocket error');
    };
  } catch (error) {
    logToFirehose('other error', error.toString());
    console.log('other error');
  }
}

const logToFirehose = (event, error) => {
  const payload = {event};
  if (error) {
    payload.error = error;
  }

  return $.ajax({
    url: '/javabuilder/connectivity_test_logging',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(payload)
  });
};
