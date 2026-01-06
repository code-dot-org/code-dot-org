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
  UPDATE_FILES = 'UPDATE_FILES',
  KEEP_ALIVE = 'KEEP_ALIVE',
}

// Allowed hostnames for external image sources in Web Lab 2 projects.
// This mirrors ALLOWED_IMAGE_HOSTNAME_SUFFIXES from dashboard/app/helpers/allowed_hostname_helper.rb
// Note: Keep this list in sync with the backend definition.
export const ALLOWED_IMAGE_HOSTNAME_SUFFIXES = [
  'picsum.photos', // Placeholder images - Public API
];

// Generate Content Security Policy (CSP) img-src policy string from allowed hostnames.
export function generateImageSrcCSPPolicy(): string {
  // For each hostname, allow both http://hostname and http://*.hostname
  // The protocol prefix 'http://' also allows https:// per CSP spec
  const policies = ALLOWED_IMAGE_HOSTNAME_SUFFIXES.flatMap(hostname => [
    `http://${hostname}`,
    `http://*.${hostname}`,
  ]);
  return policies.join(' ');
}
