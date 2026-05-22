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
  METHODS.forEach(function(method) {
    const originalMethod = console[method];
    console[method] = function() {
      const args = [];
      for (let i = 0; i < arguments.length; i++) { args.push(serialize(arguments[i])); }
      try {
        channel.postMessage({type: "${ProjectServiceWorkerMessageType.CONSOLE_LOG}", level: method, args: args});
      } catch(e) {}
      return originalMethod.apply(console, arguments);
    };
  });
  window.addEventListener('unhandledrejection', function(event) {
    const reason = event.reason !== undefined
      ? serialize(event.reason) : 'Unhandled Promise rejection';
    try {
      channel.postMessage({type: "${ProjectServiceWorkerMessageType.CONSOLE_LOG}", level: "error", args: [reason]});
    } catch(e) {}
  });
  const tagNames = {
    img: 'Image', script: 'Script', audio: 'Audio', video: 'Video'
  };
  window.addEventListener('error', function(event) {
    if (event.target && event.target !== window) {
      const tag = event.target.tagName ? event.target.tagName.toLowerCase() : 'resource';
      const resourceType = tag === 'link'
        ? (event.target.rel && event.target.rel.includes('stylesheet') ? 'Stylesheet' : 'Link resource')
        : (tagNames[tag] || tag);
      const filename =
        (event.target.src || event.target.href || 'unknown').split('/').pop();
      try {
        channel.postMessage({type: "${ProjectServiceWorkerMessageType.CONSOLE_LOG}", level: "error",
          args: [resourceType + ' not found: ' + filename]});
      } catch(e) {}
    } else {
      const filename = event.filename ? event.filename.split('/').pop() : 'unknown';
      try {
        channel.postMessage({type: "${ProjectServiceWorkerMessageType.CONSOLE_LOG}", level: "error",
          args: [event.message + ' (' + filename + ', line ' + event.lineno + ')']});
      } catch(e) {}
    }
  }, true);
})();
`;

// Adds a script to the document that intercepts console output and JS errors,
// broadcasting them via BroadcastChannel so the parent frame can display them.
// Captures console.log/warn/error/info, uncaught JS errors, unhandled Promise
// rejections, and failed resource loads (images, scripts, stylesheets, etc.).
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

const parametersScript = `
(function() {
  window._parameters = {parameters};
})();
`;

export const addParametersToDocument = (parameters: object, doc: Document) => {
  const script = doc.createElement('script');
  script.textContent = parametersScript.replace(
    '{parameters}',
    JSON.stringify(parameters)
  );
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
