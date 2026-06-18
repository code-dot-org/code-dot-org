export enum TheaterSignalType {
  // Carries the url of the generated audio track.
  AUDIO_URL = 'AUDIO_URL',
  // Carries the url of the generated image.
  VISUAL_URL = 'VISUAL_URL',
  // Asks the user for an image via the photo prompter.
  GET_IMAGE = 'GET_IMAGE',
  // The program produced no audio.
  NO_AUDIO = 'NO_AUDIO',
}

export enum InputMessage {
  UPLOAD_SUCCESS = 'UPLOAD_SUCCESS',
  UPLOAD_ERROR = 'UPLOAD_ERROR',
}

export enum InputMessageType {
  SYSTEM_IN = 'SYSTEM_IN',
  THEATER = 'THEATER',
}

// DOM ids of the image and audio elements rendered by TheaterVisualization.
export const THEATER_IMAGE_ID = 'theater';
export const THEATER_AUDIO_ID = 'theater-audio';
