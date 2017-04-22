import * as thumbnailUtils from '../util/thumbnail';

// Number of ticks after which to capture a thumbnail image of the play space.
// 300 ticks equates to approximately 1-1.5 seconds in apps that become idle
// after the first few ticks, or 10-15 seconds in apps that draw constantly.
export const CAPTURE_TICK_COUNT = 300;

// Minimum time to wait after capturing a thumbnail image before capturing
// another thumbnail.
const MIN_CAPTURE_INTERVAL_MS = 60000;

/**
 * @type {number} The last time at which a screenshot capture was attempted.
 */
let lastCaptureTimeMs = 0;

export function init() {
  lastCaptureTimeMs = 0;
  thumbnailUtils.init();
}

export function captureScreenshot() {
  if (!thumbnailUtils.shouldCapture()) {
    return;
  }

  // Skip capturing a screenshot if we just captured one recently.
  if (Date.now() - lastCaptureTimeMs < MIN_CAPTURE_INTERVAL_MS) {
    return;
  }
  lastCaptureTimeMs = Date.now();

  const visualization = document.getElementById('visualization');
  thumbnailUtils.captureThumbnailFromElement(visualization);
}
