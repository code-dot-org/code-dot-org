import project from '../code-studio/initApp/project';
import * as thumbnailUtils from '../util/thumbnail';
import {html2canvas} from '../util/htmlToCanvasWrapper';

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

/**
 * @type {boolean} Whether a screenshot capture is pending.
 */
let isCapturePending = false;

export function init() {
  lastCaptureTimeMs = 0;
  isCapturePending = false;
}

/**
 * Whether the thumbnail screenshot capture is complete. Needed for testing.
 * @returns {boolean}
 */
export function isCaptureComplete() {
  return !isCapturePending;
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
  if (!visualization) {
    console.warn(`visualization not found. skipping screenshot.`);
    return;
  }

  isCapturePending = true;

  // Record a square center-cropped image of the app window.

  const options = {
    background: '#eee',
  };

  // html2canvas can take up to 2 seconds to capture the visualization contents
  // onto the canvas.
  html2canvas(visualization, options).then(canvas => {
    if (!isCapturePending) {
      // We most likely got here because a level test triggered a screenshot
      // capture, the test completed, and then another test started before the
      // capture completed.
      console.log('not saving screenshot because no capture is pending');
      return;
    }

    // Center-crop and scale the image down so we don't send so much data over
    // the network.
    const thumbnailCanvas = thumbnailUtils.createThumbnail(canvas);

    return new Promise((resolve, reject) => {
      thumbnailCanvas.toBlob(pngBlob => {
        project.saveThumbnail(pngBlob).then(resolve, reject);
      });
    });
  }).catch(e => {
    console.log(`error capturing screenshot: ${e}`);
  }).then(() => {
    isCapturePending = false;
  });
}
