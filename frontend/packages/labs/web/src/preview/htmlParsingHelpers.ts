import {
  PROJECT_SERVICE_WORKER_BROADCAST_CHANNEL,
  ProjectServiceWorkerMessage,
} from './constants';

// Scripts injected into a student page before the service worker serves it, so
// the preview can report what happens inside. Ported from
// apps/src/weblab2/htmlPreview/htmlParsingHelpers.ts.
//
// These run inside the student's page on the preview origin, so they are plain
// strings of ES5-ish JS, not modules.

/** Insert a node as the first child of <head> (or of <html> if there is none). */
const insertFirstInHead = (doc: Document, node: Node) => {
  const head = doc.querySelector('head');
  if (head) {
    head.insertBefore(node, head.firstChild);
  } else {
    doc.documentElement.insertBefore(node, doc.documentElement.firstChild);
  }
};

const addScript = (doc: Document, source: string) => {
  const script = doc.createElement('script');
  script.textContent = source;
  insertFirstInHead(doc, script);
};

const handleCSPViolationScript = `
document.addEventListener("securitypolicyviolation",function(e){
  const broadcastChannel = new BroadcastChannel("${PROJECT_SERVICE_WORKER_BROADCAST_CHANNEL}");
  const requestId = crypto.randomUUID();
  broadcastChannel.postMessage({
    type: "${ProjectServiceWorkerMessage.NETWORK_REQUEST}",
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

/**
 * Report content-security-policy violations (e.g. a blocked script or image) so
 * the debug panel can show why something did not load.
 */
export const addCSPViolationListenerToDocument = (doc: Document) =>
  addScript(doc, handleCSPViolationScript);

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
        channel.postMessage({type: "${ProjectServiceWorkerMessage.CONSOLE_LOG}", level: method, args: args});
      } catch(e) {}
      return originalMethod.apply(console, arguments);
    };
  });
  window.addEventListener('unhandledrejection', function(event) {
    const reason = event.reason !== undefined
      ? serialize(event.reason) : 'Unhandled Promise rejection';
    try {
      channel.postMessage({type: "${ProjectServiceWorkerMessage.CONSOLE_LOG}", level: "error", args: [reason]});
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
        channel.postMessage({type: "${ProjectServiceWorkerMessage.CONSOLE_LOG}", level: "error",
          args: [resourceType + ' not found: ' + filename]});
      } catch(e) {}
    } else {
      const filename = event.filename ? event.filename.split('/').pop() : 'unknown';
      try {
        channel.postMessage({type: "${ProjectServiceWorkerMessage.CONSOLE_LOG}", level: "error",
          args: [event.message + ' (' + filename + ', line ' + event.lineno + ')']});
      } catch(e) {}
    }
  }, true);
})();
`;

/**
 * Mirror the page's console output and errors to the debug panel: console
 * log/warn/error/info, uncaught errors, unhandled rejections, and failed
 * resource loads (images, scripts, stylesheets).
 */
export const addConsoleOverrideToDocument = (doc: Document) =>
  addScript(doc, consoleOverrideScript);

/** Expose level-supplied parameters to the page as `window._parameters`. */
export const addParametersToDocument = (parameters: object, doc: Document) =>
  addScript(
    doc,
    `(function() { window._parameters = ${JSON.stringify(parameters)}; })();`,
  );

/**
 * Point relative URLs at the folder the page is served from, so a page inside a
 * project folder resolves its siblings. Updates an existing <base> if present.
 */
export const addBaseTagToDocument = (doc: Document, baseHref: string) => {
  let baseTag = doc.querySelector('base');
  if (!baseTag) {
    baseTag = doc.createElement('base');
    insertFirstInHead(doc, baseTag);
  }
  baseTag.setAttribute('href', baseHref);
};
