// A picture asked for from where it will be used: a block's image dropdown
// or the world palette asks, the lab opens the pictures drawer on a new
// picture, and the finished picture is handed back to the asker. Blockly
// fields have no React context, so the lab registers its handler here.

import {ImageSubject, ImageType} from './ai/images/types';

export interface PictureRequest {
  /** The kind the asker takes; absent leaves the choice to the student. */
  imageType?: ImageType;
  subject?: ImageSubject;
  onPicked: (name: string, imageType: ImageType) => void;
}

type Handler = (request: PictureRequest) => void;

let handler: Handler | null = null;

/** The lab's handler; returns the function that unregisters it. */
export function setPictureRequestHandler(next: Handler): () => void {
  handler = next;
  return () => {
    if (handler === next) {
      handler = null;
    }
  };
}

/** Ask for a picture; false when nothing can answer. */
export function requestPicture(request: PictureRequest): boolean {
  if (!handler) {
    return false;
  }
  handler(request);
  return true;
}
