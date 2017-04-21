/**
 * @fileoverview Utility functions related to processing thumbnail images
 * of code studio apps.
 */

// Export html2canvas as a non-default so that it can be stubbed by tests.
import html2canvas from 'html2canvas';
export {html2canvas};

// Thumbnail image width and height in pixels.
const THUMBNAIL_SIZE = 180;

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
