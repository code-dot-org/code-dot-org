// helper to allow behind the scenes test of javabuilder connection
// on load of high traffic pages. particularly interested
// in collecting data on whether schools often block websockets.
export default function testJavabuilderWebsocketConnection() {
  getToken().then(token => {
    // Only run test if we have token for logging.
    if (token) {
      testWebsocketConnection(token);
    }
  });
}

const testWebsocketConnection = token => {
  let socket;

  try {
    logEvent('started', token);
    socket = new WebSocket(
      'wss://javabuilderbeta.code.org?Authorization=connectivityTest'
    );
  } catch (error) {
    logEvent('websocket-initialization-error', token, error.toString());
  }

  socket.onopen = function(e) {
    socket.send('connectivityTest');
  };

  socket.onmessage = function(message) {
    if (message.data === 'success') {
      logEvent('success', token);
    } else {
      logEvent('unexpected-message-response', token, message.data);
    }
    socket.close();
  };

  socket.onerror = function(e) {
    logEvent('websocket-error', token);
    socket.close();
  };
};

const getToken = () => {
  // We already have a tag with the CSRF token on non-cached pages (eg, teacher dashboard)
  const csrfContainer = document.querySelector('meta[name="csrf-token"]');
  if (csrfContainer?.content) {
    return Promise.resolve(csrfContainer?.content);
  }

  // Get CSRF token if on cached page (eg, CSP applab level)
  return fetch('/javabuilder_connection_test/csrf_token', {method: 'GET'}).then(
    response => response.headers.get('csrf-token')
  );
};

// We log via our own servers to avoid
// schools potentially blocking API calls to third parties,
// which might affect our results if we were to log to firehose directly.
const logEvent = (event, token, detail) => {
  const payload = {event};
  if (detail) {
    payload.detail = detail;
  }

  fetch('/javabuilder_connection_test/log', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'X-CSRF-Token': token
    },
    body: JSON.stringify(payload)
  });
};
