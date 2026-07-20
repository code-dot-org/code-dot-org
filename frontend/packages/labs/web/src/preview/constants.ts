// Message contracts for the preview. Ported from
// apps/src/weblab2/htmlPreview/constants.ts.
//
// `as const` objects rather than TS enums: this package's `erasableSyntaxOnly`
// forbids enums. The service worker duplicates these string values because a
// service worker cannot import modules — keep the two in sync (see
// public/webLabProjectServiceWorker.js).

/** Parent page (studio origin) <-> preview page (preview origin), via postMessage. */
export const IframeMessage = {
  IFRAME_READY: 'IFRAME_READY',
  CHANGE_FILE_URL_BAR: 'CHANGE_FILE_URL_BAR',
  SET_SOURCE: 'SET_SOURCE',
  FILE_UPDATED: 'FILE_UPDATED',
  SET_ALLOW_SCRIPTS: 'SET_ALLOW_SCRIPTS',
  SET_BLOCK_NETWORK: 'SET_BLOCK_NETWORK',
  REFRESH: 'REFRESH',
  LEVEL_LOADING: 'LEVEL_LOADING',
  SERVICE_WORKER_UNAVAILABLE: 'SERVICE_WORKER_UNAVAILABLE',
  NETWORK_REQUEST: 'NETWORK_REQUEST',
  NETWORK_RESPONSE: 'NETWORK_RESPONSE',
  CONSOLE_LOG: 'CONSOLE_LOG',
  SET_INSPECTOR_ENABLED: 'SET_INSPECTOR_ENABLED',
} as const;

export type IframeMessageType =
  (typeof IframeMessage)[keyof typeof IframeMessage];

/** Preview page <-> project service worker, via BroadcastChannel / postMessage. */
export const ProjectServiceWorkerMessage = {
  SERVING_HTML_FILE: 'SERVING_HTML_FILE',
  RECEIVED_SOURCE: 'RECEIVED_SOURCE',
  UPDATE_FILES: 'UPDATE_FILES',
  KEEP_ALIVE: 'KEEP_ALIVE',
  SET_BLOCK_NETWORK: 'SET_BLOCK_NETWORK',
  NETWORK_REQUEST: 'NETWORK_REQUEST',
  NETWORK_RESPONSE: 'NETWORK_RESPONSE',
  CONSOLE_LOG: 'CONSOLE_LOG',
} as const;

export type ProjectServiceWorkerMessageType =
  (typeof ProjectServiceWorkerMessage)[keyof typeof ProjectServiceWorkerMessage];

/** Channel the service worker and the injected page scripts talk over. */
export const PROJECT_SERVICE_WORKER_BROADCAST_CHANNEL = 'weblab2-file-preview';

/** Path the preview origin serves the project service worker from. */
export const PROJECT_SERVICE_WORKER_URL = '/webLabProjectServiceWorker.js';

export const PreviewViewMode = {
  DESKTOP: 'desktop',
  MOBILE: 'mobile',
} as const;

export type PreviewViewModeType =
  (typeof PreviewViewMode)[keyof typeof PreviewViewMode];
