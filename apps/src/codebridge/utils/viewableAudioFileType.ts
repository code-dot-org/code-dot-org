import {SUPPORTED_AUDIO_EXTENSIONS} from '@cdo/apps/lab2/constants';

/**
 * Determines if a given file extension is a playable audio format.
 *
 * @param extension - The file extension to check (e.g., "wav").
 * @param viewableAudioFileTypesArray - An optional array of playable audio file extensions. If not provided, a default array is used.
 * @returns `true` if the file extension is a playable audio format, `false` otherwise.
 */
export const viewableAudioFileType = (
  extension: string,
  viewableAudioFileTypesArray = SUPPORTED_AUDIO_EXTENSIONS
) => {
  const viewableAudioFileTypes = new Set(viewableAudioFileTypesArray);
  return viewableAudioFileTypes.has(extension);
};
