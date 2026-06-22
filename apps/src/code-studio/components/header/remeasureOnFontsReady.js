// Run callback once webfonts have loaded. The header measures text widths on mount,
// which on a cold load precedes the webfont swap; absent a re-measure, the fallback
// font's widths persist in the layout. Returns a cancel that suppresses the callback
// after unmount. document.fonts is absent in some test environments; degrade quietly.
export default function remeasureOnFontsReady(callback) {
  let cancelled = false;
  document.fonts?.ready.then(() => {
    if (!cancelled) {
      callback();
    }
  });
  return () => {
    cancelled = true;
  };
}
