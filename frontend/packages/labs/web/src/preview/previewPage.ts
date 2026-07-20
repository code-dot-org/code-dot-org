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

/** How often to ping the worker so the browser does not reclaim it, as legacy. */
const KEEP_ALIVE_INTERVAL_MS = 15000;

/** How long to wait for the worker to confirm it has the project. */
const SEND_FILES_TIMEOUT_MS = 2000;

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
        // Never let the HTTP cache answer for the worker script. Without this a
        // browser can keep serving a stale copy, and since the worker is what
        // serves the project, a stale one is not a cosmetic problem — it is a
        // preview that misbehaves until someone unregisters it by hand.
        {updateViaCache: 'none'},
      );
      // Pick up a changed worker script on load rather than whenever the browser
      // next feels like checking. Combined with the worker's skipWaiting and
      // clients.claim, an edit takes effect on the next reload; a worker that
      // activates mid-session starts empty, which reload() already handles by
      // re-sending the project before it navigates.
      registration.update().catch(() => {
        // An update check is best-effort; the existing worker still serves.
      });
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

  // Keep the worker from being terminated while the lab is open. It holds the
  // project in memory, so a browser reclaiming an idle worker drops the files;
  // the next navigation then finds nothing to serve and falls through to the
  // network, which on the demo's preview origin is the dev server that also
  // serves the lab — the lab then loads inside its own preview. Legacy pings on
  // the same interval (weblab2/htmlPreview/useProjectServiceWorker.ts).
  const keepAlive = window.setInterval(
    () => worker?.postMessage({type: ProjectServiceWorkerMessage.KEEP_ALIVE}),
    KEEP_ALIVE_INTERVAL_MS,
  );
  window.addEventListener('pagehide', () => window.clearInterval(keepAlive));

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

  // The policy that came with the current project, kept so we can re-send the
  // files without being told it again.
  let contentSecurityPolicy = '';

  /**
   * Hand the project to the worker and wait until it says it has it. The worker
   * confirms with RECEIVED_SOURCE; navigating before that arrives races the
   * worker's own startup (see reload).
   */
  const sendFiles = () =>
    new Promise<void>(resolve => {
      const done = () => {
        channel.removeEventListener('message', onMessage);
        window.clearTimeout(timeout);
        resolve();
      };
      const onMessage = (event: MessageEvent) => {
        if (event.data?.type === ProjectServiceWorkerMessage.RECEIVED_SOURCE) {
          done();
        }
      };
      // Never hang the preview on a worker that does not answer; a navigation
      // that serves nothing is recoverable, a preview that never loads is not.
      const timeout = window.setTimeout(done, SEND_FILES_TIMEOUT_MS);
      channel.addEventListener('message', onMessage);
      // Post to the live controller, not the reference captured at startup: a
      // worker the browser reclaimed and restarted is a different instance.
      (navigator.serviceWorker.controller ?? worker)?.postMessage({
        type: ProjectServiceWorkerMessage.UPDATE_FILES,
        files: withInjectedScripts(files),
        contentSecurityPolicy,
      });
    });

  const reload = async () => {
    // Always re-send, and wait for the worker to confirm, before navigating.
    // The worker holds the project in memory, so a browser that reclaimed it
    // restarts it empty; it would then serve nothing and the request would fall
    // through to the network, loading whatever else the preview origin serves
    // (in the demo, the lab itself) instead of the student's page. Re-sending is
    // cheap and idempotent, so do it on every navigation rather than trying to
    // detect when the worker died.
    await sendFiles();
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
        contentSecurityPolicy = data.contentSecurityPolicy;
        reload();
        break;
      }
      case IframeMessage.FILE_UPDATED: {
        files = data.files as PreviewFiles;
        contentSecurityPolicy = data.contentSecurityPolicy;
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
