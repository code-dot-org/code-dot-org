import {WEBLAB2_IMAGE_FILE_TYPES} from '@cdo/apps/weblab2/constants';

/**
 * Determines if a given file extension is a viewable image format.
 *
 * @param extension - The file extension to check (e.g., "jpg", "png").
 * @param viewableImageFileTypesArray - An optional array of viewable image file extensions. If not provided, a default array is used.
 * @returns `true` if the file extension is a viewable image format, `false` otherwise.
 */
export const viewableImageFileType = (
  extension: string,
  viewableImageFileTypesArray = WEBLAB2_IMAGE_FILE_TYPES
) => {
  const viewableImageFileTypes = new Set(viewableImageFileTypesArray);
  return viewableImageFileTypes.has(extension);
};
