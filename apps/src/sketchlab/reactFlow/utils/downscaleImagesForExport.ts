// html-to-image inlines every <img> as base64 at its original resolution, so a
// sketch holding a few camera-roll photos produces tens of megabytes of SVG and
// Safari fails to render it. We swap each oversized image for one drawn at the
// size the export will actually show, and put the originals back afterwards.
// html-to-image leaves a data-url source alone, so our version is what it embeds.

// A JPEG source has no alpha to preserve, so it re-encodes as JPEG.
const JPEG_SOURCE_PATTERN = /^data:image\/jpeg|\.jpe?g(\?|$)/i;
const JPEG_QUALITY = 0.85;

const downscaledDataUrl = (
  image: HTMLImageElement,
  outputScale: number
): string | undefined => {
  // offsetWidth is the layout size, unaffected by the canvas zoom transform.
  const boxWidth = image.offsetWidth * outputScale;
  const boxHeight = image.offsetHeight * outputScale;
  const {naturalWidth, naturalHeight} = image;
  if (!boxWidth || !boxHeight || !naturalWidth || !naturalHeight) {
    return undefined;
  }
  // The node paints the image with object-fit: contain, so the largest useful
  // size keeps the source aspect ratio. Sizing to the box would stretch it.
  const fit = Math.min(boxWidth / naturalWidth, boxHeight / naturalHeight);
  if (fit >= 1) {
    return undefined;
  }
  const targetWidth = Math.max(1, Math.round(naturalWidth * fit));
  const targetHeight = Math.max(1, Math.round(naturalHeight * fit));
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext('2d');
  if (!context) {
    return undefined;
  }
  context.imageSmoothingQuality = 'high';
  context.drawImage(image, 0, 0, targetWidth, targetHeight);
  return JPEG_SOURCE_PATTERN.test(image.src)
    ? canvas.toDataURL('image/jpeg', JPEG_QUALITY)
    : canvas.toDataURL('image/png');
};

// Returns a function restoring the sources this replaced.
export const downscaleImagesForExport = (
  root: HTMLElement,
  outputScale: number
): (() => void) => {
  const originalSources = new Map<HTMLImageElement, string>();
  Array.from(root.querySelectorAll('img')).forEach(image => {
    let replacement: string | undefined;
    try {
      // Reading a canvas tainted by a cross-origin image throws; that image
      // keeps its original source and gets embedded the old way.
      replacement = downscaledDataUrl(image, outputScale);
    } catch (error) {
      return;
    }
    if (replacement) {
      originalSources.set(image, image.src);
      image.src = replacement;
    }
  });
  return () =>
    originalSources.forEach((source, image) => {
      image.src = source;
    });
};
