import {
  IframeMessage,
  PROJECT_SERVICE_WORKER_BROADCAST_CHANNEL,
  PROJECT_SERVICE_WORKER_URL,
  ProjectServiceWorkerMessage,
} from './constants';
import {
  addBaseTagToDocument,
  addConsoleOverrideToDocument,
  addCSPViolationListenerToDocument,
  addParametersToDocument,
} from './htmlParsingHelpers';
import {installInspector, type InspectorController} from './inspector';
import type {PreviewFiles} from './projectFiles';

// The preview page, running on the PREVIEW ORIGIN (not the lab's). Ported and
// reduced from apps/src/weblab2/htmlPreview/InnerHTMLPreview.tsx.
//
// It owns the project service worker and an inner iframe pointed at the
// project's start page; the worker answers that iframe's requests from the
// project files. It holds no lab state — the lab (HTMLPreview, on the studio
// origin) posts the project down and this relays console/network events back up.
// Keeping student code on its own origin is the point: it can never reach the
// lab's cookies or session.
//
// This is a plain module, not a React tree: the page is an iframe host and a
// message relay, so there is nothing to render.

/** The parent origin, named on our URL by the lab (see previewConfig). */
const PARENT_ORIGIN_PARAM = 'parentOrigin';

const parentOrigin = new URLSearchParams(window.location.search).get(
  PARENT_ORIGIN_PARAM,
);

function postToParent(message: unknown) {
  if (parentOrigin) {
    window.parent.postMessage(message, parentOrigin);
  }
}

export async function startPreviewPage() {
  const iframe = document.getElementById(
    'preview-frame',
  ) as HTMLIFrameElement | null;
  if (!iframe) {
    return;
  }

  let files: PreviewFiles = {};
  let currentFile = 'index.html';

  // The element inspector runs here, not in the lab: it needs the inner
  // document, which is same-origin to this page and cross-origin to the lab.
  let inspectorEnabled = false;
  let inspector: InspectorController | null = null;

  // (Re)install the inspector against the live inner document. Runs when the lab
  // toggles it and on every iframe load, because a load replaces the document —
  // taking the previous overlay's nodes and listeners with it.
  const syncInspector = () => {
    inspector?.teardown();
    inspector = null;
    const innerDocument = iframe.contentDocument;
    if (inspectorEnabled && innerDocument) {
      inspector = installInspector(innerDocument);
    }
  };

  iframe.addEventListener('load', syncInspector);

  // Relay the worker's and the page's reports up to the lab.
  const channel = new BroadcastChannel(
    PROJECT_SERVICE_WORKER_BROADCAST_CHANNEL,
  );
  channel.addEventListener('message', event => {
    const {type} = event.data ?? {};
    if (
      type === ProjectServiceWorkerMessage.NETWORK_REQUEST ||
      type === ProjectServiceWorkerMessage.NETWORK_RESPONSE ||
      type === ProjectServiceWorkerMessage.CONSOLE_LOG
    ) {
      postToParent(event.data);
    } else if (type === ProjectServiceWorkerMessage.SERVING_HTML_FILE) {
      postToParent({
        type: IframeMessage.CHANGE_FILE_URL_BAR,
        filePath: event.data.filePath,
      });
    }
  });

  // The worker must control this origin before the iframe loads, or its
  // requests are not intercepted and the project cannot be served.
  let worker: ServiceWorker | null = null;
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        PROJECT_SERVICE_WORKER_URL,
      );
      await navigator.serviceWorker.ready;
      worker = registration.active ?? navigator.serviceWorker.controller;
      if (!navigator.serviceWorker.controller) {
        // `clients.claim()` is asynchronous; wait for control before serving.
        await new Promise<void>(resolve =>
          navigator.serviceWorker.addEventListener(
            'controllerchange',
            () => resolve(),
            {once: true},
          ),
        );
        worker = navigator.serviceWorker.controller;
      }
    } catch {
      worker = null;
    }
  }

  if (!worker) {
    postToParent({type: IframeMessage.SERVICE_WORKER_UNAVAILABLE});
    return;
  }

  /**
   * Inject our reporting scripts into every HTML file BEFORE the worker serves
   * it. This has to happen here, not when the iframe loads: the page's own
   * scripts run while it parses, so an override applied on `load` would miss
   * everything they logged. (Legacy does the same in useProjectServiceWorker.)
   */
  const withInjectedScripts = (source: PreviewFiles): PreviewFiles =>
    Object.fromEntries(
      Object.entries(source).map(([path, file]) => {
        if (!path.endsWith('.html')) {
          return [path, file];
        }
        const doc = new DOMParser().parseFromString(file.content, 'text/html');
        // Relative URLs resolve against the file's own folder.
        const folder = path.includes('/') ? path.replace(/[^/]+$/, '') : '';
        addBaseTagToDocument(doc, `${window.location.origin}/${folder}`);
        addConsoleOverrideToDocument(doc);
        addCSPViolationListenerToDocument(doc);
        addParametersToDocument({}, doc);
        return [path, {...file, content: doc.documentElement.outerHTML}];
      }),
    );

  const sendFiles = (contentSecurityPolicy: string) =>
    worker?.postMessage({
      type: ProjectServiceWorkerMessage.UPDATE_FILES,
      files: withInjectedScripts(files),
      contentSecurityPolicy,
    });

  const reload = () => {
    // Re-point rather than reload(): the src may have changed, and a fresh load
    // is what re-runs the student's scripts.
    iframe.src = `${window.location.origin}/${currentFile}`;
  };

  window.addEventListener('message', event => {
    if (!parentOrigin || event.origin !== parentOrigin) {
      return;
    }
    const data = event.data ?? {};
    switch (data.type) {
      case IframeMessage.SET_SOURCE: {
        files = data.files as PreviewFiles;
        currentFile = data.startFile || currentFile;
        sendFiles(data.contentSecurityPolicy);
        reload();
        break;
      }
      case IframeMessage.FILE_UPDATED: {
        files = data.files as PreviewFiles;
        sendFiles(data.contentSecurityPolicy);
        reload();
        break;
      }
      case IframeMessage.SET_BLOCK_NETWORK:
        worker?.postMessage({
          type: ProjectServiceWorkerMessage.SET_BLOCK_NETWORK,
          blockNetwork: data.blockNetwork,
        });
        break;
      case IframeMessage.SET_INSPECTOR_ENABLED:
        inspectorEnabled = !!data.enabled;
        syncInspector();
        break;
      case IframeMessage.REFRESH:
        reload();
        break;
      case IframeMessage.CHANGE_FILE_URL_BAR:
        currentFile = data.filePath;
        reload();
        break;
      default:
        break;
    }
  });

  postToParent({type: IframeMessage.IFRAME_READY});
}
