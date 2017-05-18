/**
 * @fileoverview Utility functions related to processing thumbnail images
 * of code studio apps.
 */

import {canvasFromImage, canvasToBlob, imageFromURI, svgToDataURI} from '../imageUtils';
import {getStore} from '../redux';
import project from '../code-studio/initApp/project';
import {html2canvas} from '../util/htmlToCanvasWrapper';

// Thumbnail image width in pixels.
const THUMBNAIL_WIDTH = 220;

// Minimum time to wait after capturing a thumbnail image before capturing
// another thumbnail.
const MIN_CAPTURE_INTERVAL_MS = 60000;

/**
 * @type {number} The last time at which a screenshot capture was attempted.
 */
let lastCaptureTimeMs = 0;

/**
 * Returns true if this level is a project level owned by this user, it is not a
 * shared or embedded level, and enough time has passed since the last capture.
 * Only capture if it has been at least MIN_CAPTURE_INTERVAL_MS milliseconds
 * since the last capture.
 * @returns {boolean}
 */
 function shouldCapture() {
  const {isShareView, isEmbedView} = getStore().getState().pageConstants;
  if (!project.getCurrentId() || !project.isOwner || isShareView || isEmbedView) {
    return false;
  }

  // Skip capturing a screenshot if we just captured one recently.
  const intervalMs = Date.now() - lastCaptureTimeMs;
  if (intervalMs < MIN_CAPTURE_INTERVAL_MS) {
    return;
  }

  return true;
}

/**
 * Converts the contents of an SVG element into an image, shrinks it to a
 * width equal to THUMBNAIL_WIDTH preserving aspect ratio, and saves it to
 * the server.
 * @param {SVGElement} svg SVG element to capture the contents of.
 */
export function captureThumbnailFromSvg(svg) {
  if (!svg) {
    console.warn(`Thumbnail capture failed: svg element not found.`);
    return;
  }
  if (!SVGElement.prototype.toDataURL) {
    console.warn('Thumbnail capture failed: SVGElement.prototype.toDataURL undefined.');
    return;
  }
  if (!shouldCapture()) {
    return;
  }
  lastCaptureTimeMs = Date.now();

  svgToDataURI(svg)
    .then(imageFromURI)
    .then(canvasFromImage)
    .then(createThumbnail)
    .then(canvasToBlob)
    .then(project.saveThumbnail);
}

/**
 * Copies the image from the canvas, shrinks it to a width equal to
 * THUMBNAIL_WIDTH preserving aspect ratio, and saves it to the server.
 * @param {HTMLCanvasElement} canvas
 */
export function captureThumbnailFromCanvas(canvas) {
  if (!canvas) {
    console.warn(`Thumbnail capture failed: canvas element not found.`);
    return;
  }
  if (!shouldCapture()) {
    return;
  }
  lastCaptureTimeMs = Date.now();

  const thumbnailCanvas = createThumbnail(canvas);
  canvasToBlob(thumbnailCanvas).then(project.saveThumbnail);
}

/**
 * @type {boolean} Whether a screenshot capture is pending.
 * Used only by captureThumbnailFromElement.
 */
let isCapturePending = false;

export function init() {
  isCapturePending = false;
  lastCaptureTimeMs = 0;
}

/**
 * Whether the thumbnail screenshot capture is complete. Needed for testing.
 * Used only by captureThumbnailFromElement.
 * @returns {boolean}
 */
export function isCaptureComplete() {
  return lastCaptureTimeMs > 0 && !isCapturePending;
}


/**
 * Copies the image from the element, shrinks it to a width equal to
 * THUMBNAIL_WIDTH preserving aspect ratio, and saves it to the server.
 * @param {HTMLElement} element
 */

export function captureThumbnailFromElement(element) {
  if (!element) {
    console.warn(`Thumbnail capture failed: html element not found.`);
    return;
  }
  if (!shouldCapture()) {
    return;
  }
  lastCaptureTimeMs = Date.now();
  isCapturePending = true;

  const options = {
    background: '#eee',
  };

  // html2canvas can take up to 2 seconds to capture the element contents
  // onto the canvas.
  return html2canvas(element, options).then(canvas => {
    if (!isCapturePending) {
      // We most likely got here because a level test triggered a screenshot
      // capture, the test completed, and then another test started before the
      // capture completed.
      console.log('not saving screenshot because no capture is pending');
      return;
    }

    // Center-crop and scale the image down so we don't send so much data over
    // the network.
    const thumbnailCanvas = createThumbnail(canvas);

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

/**
 * Paint an image of an existing canvas onto a new thumbnail canvas. The new
 * canvas has a width equal to THUMBNAIL_WIDTH and the same aspect ratio as the
 * original canvas.
 * @param {HTMLCanvasElement} canvas Canvas to copy from.
 * @returns {HTMLCanvasElement}
 */
export function createThumbnail(canvas) {
  const thumbnailCanvas = document.createElement('canvas');
  thumbnailCanvas.width = THUMBNAIL_WIDTH;
  thumbnailCanvas.height = (canvas.height / canvas.width) * THUMBNAIL_WIDTH;

  // Make sure any empty areas appear white.
  const thumbnailContext = thumbnailCanvas.getContext('2d');
  thumbnailContext.fillStyle = 'white';
  thumbnailContext.fillRect(0, 0, thumbnailCanvas.width, thumbnailCanvas.height);

  thumbnailContext.drawImage(canvas, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
  return thumbnailCanvas;
}
