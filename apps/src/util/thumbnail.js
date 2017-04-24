/**
 * @fileoverview Utility functions related to processing thumbnail images
 * of code studio apps.
 */

import {canvasFromImage, canvasToBlob, imageFromURI, svgToDataURI} from '../imageUtils';
import {getStore} from '../redux';
import project from '../code-studio/initApp/project';

// Export html2canvas as a non-default so that it can be stubbed by tests.
import html2canvas from 'html2canvas';
export {html2canvas};

// Thumbnail image width and height in pixels.
const THUMBNAIL_SIZE = 180;

/**
 * @type {number} The last time at which a screenshot capture was attempted.
 */
let lastCaptureTimeMs = 0;

/**
 * Converts the contents of an SVG element into an image, shrinks it to
 * width and height equal to THUMBNAIL_SIZE, and saves it to
 * @param {SVGElement} svg Svg element to capture the contents of.
 * @param {number} minCaptureIntervalMs Minimum allowable time between
 *   thumbnail image captures in milliseconds.
 */
export function captureThumbnailFromSvg(svg, minCaptureIntervalMs) {
  const {isShareView, isEmbedView} = getStore().getState().pageConstants;
  if (!project.getCurrentId() || !project.isOwner || isShareView || isEmbedView) {
    return;
  }

  // Skip capturing a screenshot if we just captured one recently.
  if (Date.now() - lastCaptureTimeMs < minCaptureIntervalMs) {
    return;
  }
  lastCaptureTimeMs = Date.now();

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

/**
 * Paint an image of an existing canvas onto a new thumbnail canvas. If the
 * existing canvas is taller than it is wide, capture a square center region.
 * The new canvas has a white background, and width and height equal to
 * THUMBNAIL_SIZE.
 * @param {HTMLCanvasElement} canvas Canvas to copy from.
 * @returns {HTMLCanvasElement}
 */
export function createThumbnail(canvas) {
  const thumbnailCanvas = document.createElement('canvas');
  thumbnailCanvas.width = THUMBNAIL_SIZE;
  thumbnailCanvas.height = THUMBNAIL_SIZE;

  // Make sure any empty areas appear white.
  const thumbnailContext = thumbnailCanvas.getContext('2d');
  thumbnailContext.fillStyle = 'white';
  thumbnailContext.fillRect(0, 0, THUMBNAIL_SIZE, THUMBNAIL_SIZE);

  // By default, specify a square region that will capture the entire image
  // if it is square or shorter than it is wide.

  const sx = 0;
  let sy = 0;
  const sWidth = canvas.width;
  const sHeight = sWidth;

  // If the canvas is taller than it is wide, capture a square center region.
  //
  //      canvas
  // |--------------|  -------------                ----
  // |              |        ^                       sy
  // |--------------|        |        ------------  ----
  // |              |        |              ^
  // |    square    |        |              |
  // |    center    |  canvas.height  canvas.width
  // |    region    |        |              |
  // |              |        |              v
  // |--------------|        |        ------------
  // |              |        v
  // |--------------|  -------------
  //
  // | canvas.width |
  //

  if (canvas.height > canvas.width) {
    sy = (canvas.height - canvas.width) / 2;
  }

  thumbnailContext.drawImage(canvas, sx, sy, sWidth, sHeight, 0, 0, THUMBNAIL_SIZE, THUMBNAIL_SIZE);
  return thumbnailCanvas;
}
