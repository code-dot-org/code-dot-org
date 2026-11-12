// Page zoom as a browser does it: the layout narrows and everything is
// drawn larger, so the page reflows and taps land where they look. The
// viewport carries it, which the WebView honors in wide-viewport mode
// (WebViewSetup.kt). The old labs rewrite their viewport when they start,
// so it is reapplied on every change. The level, a percentage, is in the
// codeai_zoom cookie. Debug builds of the app let it change from the
// header controls (page_debug_controls.js).
var ZOOM_LEVELS = [50, 67, 75, 80, 90, 100, 110, 125, 150, 175, 200];
var ZOOM_COOKIE = 'codeai_zoom';

// Read once per page: applyZoom() runs on every change to the page, and reading
// document.cookie that often cost a level load about 0.3s on a Fire HD 8.
var zoom = null;

function zoomLevel() {
  if (!DEBUG_BUILD) {
    return 100;
  }
  if (zoom === null) {
    var level = Number(cookieValue(ZOOM_COOKIE));
    zoom = ZOOM_LEVELS.indexOf(level) >= 0 ? level : 100;
  }
  return zoom;
}

function viewportContent() {
  var scale = zoomLevel() / 100;
  // outerWidth is the WebView's width, whatever the page's scale.
  var width = Math.round((window.outerWidth || screen.width) / scale);
  return `width=${width}, initial-scale=${scale}, minimum-scale=${scale}, maximum-scale=${scale}, user-scalable=no, viewport-fit=cover`;
}

function applyZoom() {
  var metas = document.querySelectorAll('meta[name="viewport"]');
  if (metas.length === 0) {
    var meta = document.createElement('meta');
    meta.name = 'viewport';
    (document.head || document.documentElement).appendChild(meta);
    metas = [meta];
  }
  var content = viewportContent();
  for (var i = 0; i < metas.length; i++) {
    if (metas[i].getAttribute('content') !== content) {
      metas[i].setAttribute('content', content);
    }
  }
}

function setZoomLevel(level) {
  if (ZOOM_LEVELS.indexOf(level) < 0) {
    return;
  }
  document.cookie = `${ZOOM_COOKIE}=${level}; path=/; max-age=315569520; secure; samesite=lax`;
  zoom = level;
  applyZoom();
}

onPageChange(applyZoom);
window.addEventListener('resize', applyZoom);
