/**
 * @fileoverview Utility functions related to processing thumbnail images
 * of code studio apps.
 */

/**
 * Paint an image of an existing canvas onto a new thumbnail canvas. The new
 * canvas has a white background, and width and height equal to thumbnailSize.
 * @param {HTMLCanvasElement} canvas Canvas to copy from.
 * @param {number} thumbnailSize Width and height of the new thumbnail in pixels.
 * @returns {HTMLCanvasElement}
 */
export function createThumbnail(canvas, thumbnailSize) {
  const thumbnailCanvas = document.createElement('canvas');
  thumbnailCanvas.width = thumbnailSize;
  thumbnailCanvas.height = thumbnailSize;

  // Make sure any empty areas appear white.
  const thumbnailContext = thumbnailCanvas.getContext('2d');
  thumbnailContext.fillStyle = 'white';
  thumbnailContext.fillRect(0, 0, thumbnailSize, thumbnailSize);

  thumbnailContext.drawImage(canvas, 0, 0, thumbnailSize, thumbnailSize);
  return thumbnailCanvas;
}
