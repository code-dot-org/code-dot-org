// Theater wire-protocol enums. Names must match the Javabuilder side; see
// org.code.theater in the javabuilder repo.

export enum TheaterSignalType {
  AUDIO_URL = 'AUDIO_URL',
  VISUAL_URL = 'VISUAL_URL',
  GET_IMAGE = 'GET_IMAGE',
  NO_AUDIO = 'NO_AUDIO',
}

// Values sent back to Javabuilder over the WebSocket as
// `{messageType: 'THEATER', message: <one of these>}`.
export enum TheaterInputMessage {
  UPLOAD_SUCCESS = 'UPLOAD_SUCCESS',
  UPLOAD_ERROR = 'UPLOAD_ERROR',
}
