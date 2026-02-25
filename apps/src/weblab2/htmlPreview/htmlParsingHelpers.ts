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
        channel.postMessage({type: "CONSOLE_LOG", level: method, args: args});
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

const parametersScript = `
(function() {
  window._parameters = {parameters};
})();
`;

export const addParametersToDocument = (
  parameters: Record<string, string>,
  doc: Document
) => {
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
