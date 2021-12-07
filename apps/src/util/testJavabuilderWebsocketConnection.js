import $ from 'jquery';

// helper to allow behind the scenes test of javabuilder connection
// on load of high traffic pages. particularly interested
// in collecting data on whether schools often block websockets.
export default function testJavabuilderWebsocketConnection() {
  try {
    logToFirehose('started');

    const socket = new WebSocket(
      'wss://javabuilderbeta.code.org?Authorization=connectivityTest'
    );

    socket.onopen = function(e) {
      socket.send('connectivityTest');
    };

    socket.onmessage = function(message) {
      if (message.data === 'success') {
        logToFirehose('success');
      } else {
        logToFirehose('unexpected message response');
      }
      socket.close();
    };

    socket.onerror = function(e) {
      logToFirehose('websocket error');
      socket.close();
    };
  } catch (error) {
    logToFirehose('other error', error.toString());
  }
}

// We log via our own servers to avoid
// schools potentially blocking API calls to third parties,
// which might affect our results if we were to log to firehose directly.
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
