import * as thumbnailUtils from '../util/thumbnail';

// Number of ticks after which to capture a thumbnail image of the play space.
// 300 ticks equates to approximately 1-1.5 seconds in apps that become idle
// after the first few ticks, or 10-15 seconds in apps that draw constantly.
export const CAPTURE_TICK_COUNT = 300;

// Minimum time to wait after capturing a thumbnail image before capturing
// another thumbnail.
const MIN_CAPTURE_INTERVAL_MS = 60000;

export function captureScreenshot() {
  const visualization = document.getElementById('visualization');
  const interval = MIN_CAPTURE_INTERVAL_MS;
  thumbnailUtils.captureThumbnailFromElement(visualization, interval);
}
