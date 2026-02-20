import {
  PROJECT_SERVICE_WORKER_BROADCAST_CHANNEL,
  ProjectServiceWorkerMessageType,
} from './constants';

const handleCSPViolationScript = `
document.addEventListener("securitypolicyviolation",function(e){
  const broadcastChannel = new BroadcastChannel("${PROJECT_SERVICE_WORKER_BROADCAST_CHANNEL}");
  const requestId = crypto.randomUUID();
  broadcastChannel.postMessage({
    type: "${ProjectServiceWorkerMessageType.NETWORK_REQUEST}",
    requestData: {
      url: e.blockedURI,
      cspDirectiveViolated: e.effectiveDirective,
      id: requestId,
      startTime: new Date().toLocaleString()
    }
  });
  broadcastChannel.close();
});
`;

// Adds a script to the document that listens for CSP violations and broadcasts them
// via BroadcastChannel so the parent can be notified.
export const addCSPViolationListenerToDocument = (doc: Document) => {
  const script = doc.createElement('script');
  script.textContent = handleCSPViolationScript;
  const head = doc.querySelector('head');
  if (head) {
    head.insertBefore(script, head.firstChild);
  } else {
    doc.documentElement.insertBefore(script, doc.documentElement.firstChild);
  }
};

const consoleOverrideScript = `
(function() {
  const channel = new BroadcastChannel("${PROJECT_SERVICE_WORKER_BROADCAST_CHANNEL}");
  const METHODS = ["log", "warn", "error", "info"];
  function serialize(arg) {
    if (arg === undefined) return "undefined";
    if (arg === null) return "null";
    if (arg instanceof Error) return arg.toString();
    if (typeof arg === "string") return arg;
    try { return JSON.stringify(arg); } catch(e) { return String(arg); }
  }
  function parseCallerLocation(stack) {
    if (!stack) return { file: null, line: null };
    var frames = stack.split('\\n');
    // Frame 0 is "Error", frame 1 is this override, frame 2 is the caller.
    var callerFrame = frames[2] || '';
    // Chrome/V8: "    at something (https://...:line:col)" or "    at https://...:line:col"
    var match = callerFrame.match(/(?:https?|blob):\\/\\/[^\\s)]+/);
    if (match) {
      var parts = match[0].split(':');
      parts.pop(); // remove col
      var lineNum = parts.pop(); // remove line
      var url = parts.join(':');
      var file = url.split('/').pop().split('?')[0] || url;
      return { file: file, line: lineNum };
    }
    // Firefox: "@https://...:line:col"
    match = callerFrame.match(/@(.+):(\\d+):\\d+$/);
    if (match) {
      var file = match[1].split('/').pop().split('?')[0] || match[1];
      return { file: file, line: match[2] };
    }
    return { file: null, line: null };
  }
  METHODS.forEach(function(method) {
    const originalMethod = console[method];
    console[method] = function() {
      const args = [];
      for (let i = 0; i < arguments.length; i++) { args.push(serialize(arguments[i])); }
      var location = parseCallerLocation(new Error().stack);
      try {
        channel.postMessage({type: "CONSOLE_LOG", level: method, args: args, file: location.file, line: location.line});
      } catch(e) {}
      return originalMethod.apply(console, arguments);
    };
  });
})();
`;

// Adds a script to the document that overrides console methods (log, warn, error, info)
// and broadcasts the serialized arguments via BroadcastChannel so the parent can capture them.
export const addConsoleOverrideToDocument = (doc: Document) => {
  const script = doc.createElement('script');
  script.textContent = consoleOverrideScript;
  const head = doc.querySelector('head');
  if (head) {
    head.insertBefore(script, head.firstChild);
  } else {
    doc.documentElement.insertBefore(script, doc.documentElement.firstChild);
  }
};

// This adds a base tag to the header of the given document, setting its href to the provided baseHref.
// If a base tag already exists, its href is updated.
export const addBaseTagToDocument = (doc: Document, baseHref: string) => {
  let baseTag = doc.querySelector('base');
  if (!baseTag) {
    baseTag = doc.createElement('base');
    const head = doc.querySelector('head');
    if (head) {
      head.insertBefore(baseTag, head.firstChild);
    } else {
      doc.documentElement.insertBefore(baseTag, doc.documentElement.firstChild);
    }
  }
  baseTag.setAttribute('href', baseHref);
};
