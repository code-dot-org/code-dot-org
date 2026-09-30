// Loading an image the page already has a URL for (apps' imageUtils).

/** The image at `src`, a data, object or site URL, once it has loaded. */
export function toImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

/** The pixel size of the image at `dataURI`. */
export async function dataURIToSourceSize(
  dataURI: string,
): Promise<{x: number; y: number}> {
  const image = await toImage(dataURI);
  return {x: image.width, y: image.height};
}

/** A loaded image as a PNG data URI. */
export function imageToDataURI(image: HTMLImageElement): string {
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;
  canvas.getContext('2d')?.drawImage(image, 0, 0);
  return canvas.toDataURL();
}
