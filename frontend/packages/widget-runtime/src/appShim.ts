// The iframe-side half of the MCP Apps wire protocol: JSON-RPC 2.0 over
// postMessage, per SEP-1865 (spec revision 2026-01-26).
//
// This is inlined into each widget's HTML as a plain script because a
// sandboxed srcdoc iframe cannot import modules from the host bundle. The
// surface mirrors the official @modelcontextprotocol/ext-apps App class
// (connect / event handlers / callTool / updateModelContext), so a widget
// written against this shim ports to the official SDK mechanically. The wire
// messages themselves are the spec's: ui/initialize handshake,
// ui/notifications/* in both directions, and tools/call back to the host.
export const WIDGET_APP_SHIM_JS = String.raw`
(function () {
  'use strict';

  let nextId = 1;
  const pending = new Map();
  const handlers = {toolInput: [], toolResult: [], hostContext: []};

  function post(msg) {
    // The host verifies event.source instead of origin: a sandboxed srcdoc
    // iframe has an opaque origin, so '*' is the only usable target.
    window.parent.postMessage(msg, '*');
  }

  function request(method, params) {
    return new Promise((resolve, reject) => {
      const id = nextId++;
      pending.set(id, {resolve, reject});
      post({jsonrpc: '2.0', id, method, params});
    });
  }

  function notify(method, params) {
    post({jsonrpc: '2.0', method, params});
  }

  function emit(event, payload) {
    handlers[event].forEach(fn => fn(payload));
  }

  window.addEventListener('message', event => {
    const msg = event.data;
    if (!msg || msg.jsonrpc !== '2.0') {
      return;
    }
    if (msg.id !== undefined && msg.method === undefined) {
      // Response to one of our requests.
      const entry = pending.get(msg.id);
      if (!entry) {
        return;
      }
      pending.delete(msg.id);
      if (msg.error) {
        entry.reject(new Error(msg.error.message || 'MCP host error'));
      } else {
        entry.resolve(msg.result);
      }
      return;
    }
    if (msg.id !== undefined && msg.method === 'ping') {
      post({jsonrpc: '2.0', id: msg.id, result: {}});
      return;
    }
    switch (msg.method) {
      case 'ui/notifications/tool-input':
        emit('toolInput', (msg.params && msg.params.arguments) || {});
        break;
      case 'ui/notifications/tool-result':
        emit('toolResult', msg.params || {});
        break;
      case 'ui/notifications/host-context-changed':
        emit('hostContext', msg.params || {});
        break;
    }
  });

  // Reports only on change: the poll below calls this on a timer for the
  // life of the view, so a dedupe keeps that from spamming the host with an
  // identical message every tick.
  let lastReportedWidth = -1;
  let lastReportedHeight = -1;
  function reportSize() {
    const width = document.documentElement.scrollWidth;
    const height = document.body.scrollHeight;
    if (width === lastReportedWidth && height === lastReportedHeight) {
      return;
    }
    lastReportedWidth = width;
    lastReportedHeight = height;
    notify('ui/notifications/size-changed', {width, height});
  }

  // A self-rescheduling setTimeout, not setInterval: observed, a sandboxed
  // srcdoc iframe (sandbox="allow-scripts", no allow-same-origin) can throttle
  // setInterval to a single tick — each setTimeout call is a fresh
  // registration, which keeps firing where the recurring timer stalls.
  function pollSize() {
    reportSize();
    setTimeout(pollSize, 200);
  }

  window.McpApp = {
    // Register before connect(): the host sends tool-input immediately after
    // the initialized notification.
    on(event, fn) {
      handlers[event].push(fn);
    },

    async connect(appCapabilities) {
      const result = await request('ui/initialize', {
        appCapabilities: appCapabilities || {},
      });
      notify('ui/notifications/initialized', {});
      // ResizeObserver's callback delivery shares the rendering-lifecycle
      // gate requestAnimationFrame uses, and a sandboxed srcdoc iframe
      // (sandbox="allow-scripts", no allow-same-origin) can sit outside that
      // gate entirely — observed: rAF callbacks never fire there, so neither
      // does ResizeObserver, and tool-input-driven content growth never gets
      // reported. pollSize's setTimeout chain, proven to keep firing in that
      // same iframe, is the mechanism that actually delivers size changes;
      // ResizeObserver stays on as a same-tick fast path where it does fire.
      if (window.ResizeObserver) {
        new ResizeObserver(reportSize).observe(document.body);
      }
      pollSize();
      return (result && result.hostContext) || {};
    },

    callTool(name, args) {
      return request('tools/call', {name: name, arguments: args || {}});
    },

    // The channel for "the student did something the model should know
    // about". The host folds these into the model's context.
    updateModelContext(params) {
      return request('ui/update-model-context', params);
    },

    // Puts text into the host chat as if the student had typed it.
    sendMessage(text) {
      return request('ui/message', {
        role: 'user',
        content: {type: 'text', text: text},
      });
    },

    reportSize: reportSize,
  };
})();
`;
