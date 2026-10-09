export enum TheaterSignalType {
  // Carries the url of the generated audio track.
  AUDIO_URL = 'AUDIO_URL',
  // Carries the url of the generated image.
  VISUAL_URL = 'VISUAL_URL',
  // Asks the user for an image via the photo prompter.
  GET_IMAGE = 'GET_IMAGE',
  // The program produced no audio.
  NO_AUDIO = 'NO_AUDIO',
  DESCRIPTION = 'DESCRIPTION',
  CAPTION = 'CAPTION',
  // No caption is coming, so the transcript is read instead.
  NO_CAPTION = 'NO_CAPTION',
}

export enum InputMessage {
  UPLOAD_SUCCESS = 'UPLOAD_SUCCESS',
  UPLOAD_ERROR = 'UPLOAD_ERROR',
}

// DOM ids of the elements rendered by TheaterVisualization.
export const THEATER_IMAGE_ID = 'theater';
export const THEATER_AUDIO_ID = 'theater-audio';
export const THEATER_DESCRIPTION_ID = 'theater-description';

// Marks a caption as a guess, for a student who cannot check it.
export const CAPTION_PREFIX = 'Automatic description:';

export const CAPTION_ENDPOINT = '/v3/images/caption';
export const CAPTION_ENABLED_ENDPOINT = '/v3/images/caption/enabled';

// How long to wait for a caption before reading the transcript instead.
export const CAPTION_WAIT_MS = 6000;

// Gives the run button's label change time to be read before the caption.
export const AFTER_RUN_ANNOUNCEMENT_MS = 250;
