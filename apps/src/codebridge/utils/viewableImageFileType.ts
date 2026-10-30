import {SUPPORTED_IMAGE_EXTENSIONS} from '@cdo/apps/lab2/constants';

/**
 * Determines if a given file extension is a viewable image format.
 *
 * @param extension - The file extension to check (e.g., "jpg", "png").
 * @param viewableImageFileTypesArray - An optional array of viewable image file extensions. If not provided, a default array is used.
 * @returns `true` if the file extension is a viewable image format, `false` otherwise.
 */
export const viewableImageFileType = (
  extension: string,
  viewableImageFileTypesArray = SUPPORTED_IMAGE_EXTENSIONS
) => {
  const viewableImageFileTypes = new Set(viewableImageFileTypesArray);
  return viewableImageFileTypes.has(extension);
};
