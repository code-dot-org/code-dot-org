export function getTemplateImageUrl(templateFilename: string): string {
  return `/blockly/media/certificates/${templateFilename}`;
}

/** Loads a certificate template for canvas export; crossOrigin set before src. */
export function loadTemplateImage(
  templateFilename: string,
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(
        new Error(
          `Certificate template failed to load: ${getTemplateImageUrl(templateFilename)}`,
        ),
      );
    image.src = getTemplateImageUrl(templateFilename);
  });
}
