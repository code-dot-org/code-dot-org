export enum IframeMessageType {
  IFRAME_READY = 'IFRAME_READY',
  CHANGE_FILE_HREF = 'CHANGE_FILE_HREF',
  CHANGE_FILE_URL_BAR = 'CHANGE_FILE_URL_BAR',
  SET_SOURCE = 'SET_SOURCE',
  FILE_UPDATED = 'FILE_UPDATED',
  SET_ALLOW_SCRIPTS = 'SET_ALLOW_SCRIPTS',
  REFRESH = 'REFRESH',
  LEVEL_LOADING = 'LEVEL_LOADING',
}

export enum PreviewViewMode {
  DESKTOP = 'desktop',
  MOBILE = 'mobile',
}

export const DEFAULT_START_HTML_FILE = 'index.html';
export const PROJECT_SERVICE_WORKER_BROADCAST_CHANNEL = 'weblab2-file-preview';

// Service worker broadcast channel message types.
export enum ProjectServiceWorkerMessageType {
  SERVING_HTML_FILE = 'SERVING_HTML_FILE',
  RECEIVED_SOURCE = 'RECEIVED_SOURCE',
  UPDATED_CURRENT_FILE = 'UPDATED_CURRENT_FILE',
  UPDATE_FILES = 'UPDATE_FILES',
  SET_CURRENT_FILE = 'SET_CURRENT_FILE',
}
