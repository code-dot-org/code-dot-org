export default function initializeTouch(blocklyWrapper) {
  // Aliasing Google's setClientFromTouch() so that we can override it, but still be able
  // to call Google's setClientFromTouch() in the override function.
  blocklyWrapper.Touch.originalSetClientFromTouch =
    blocklyWrapper.Touch.setClientFromTouch;

  // This change is needed to make our UI tests work on iPad, iPhone, and Safari 12
  blocklyWrapper.Touch.setClientFromTouch = function(e) {
    // Safari doesn't support e.changedTouches
    if (!e.changedTouches) {
      return;
    }
    blocklyWrapper.Touch.originalSetClientFromTouch(e);
  };
}
