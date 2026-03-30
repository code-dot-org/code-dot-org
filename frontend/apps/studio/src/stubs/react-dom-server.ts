// Browser-safe stub for react-dom/server.
// intro.js-react imports renderToStaticMarkup at the top level,
// but react-dom/server requires Node-only modules (util, process).
// This stub provides a no-op so the import doesn't crash in the browser.
export function renderToStaticMarkup() {
  return '';
}

export function renderToString() {
  return '';
}
