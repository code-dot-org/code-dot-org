import project from '../code-studio/initApp/project';
import {createThumbnail} from '../util/thumbnail';
import {canvasFromImage, canvasToBlob, imageFromURI, svgToDataURI} from '../imageUtils';
import {getStore} from '../redux';

// Minimum time to wait after capturing a thumbnail image before capturing
// another thumbnail.
const MIN_CAPTURE_INTERVAL_MS = 60000;

/**
 * @type {number} The last time at which a screenshot capture was attempted.
 */
let lastCaptureTimeMs = 0;

export function captureScreenshot() {
  const {isShareView, isEmbedView} = getStore().getState().pageConstants;
  if (!project.getCurrentId() || !project.isOwner || isShareView || isEmbedView) {
    return;
  }

  // Skip capturing a screenshot if we just captured one recently.
  if (Date.now() - lastCaptureTimeMs < MIN_CAPTURE_INTERVAL_MS) {
    return;
  }
  lastCaptureTimeMs = Date.now();

  const svg = document.getElementById('svgStudio');
  if (!svg) {
    console.warn(`Thumbnail capture failed: svgStudio not found.`);
    return;
  }

  if (!svg.toDataURL) {
    console.warn('Thumbnail capture failed: svg.toDataURL undefined.');
    return;
  }

  svgToDataURI(svg)
    .then(imageFromURI)
    .then(canvasFromImage)
    .then(createThumbnail)
    .then(canvasToBlob)
    .then(project.saveThumbnail);
}
