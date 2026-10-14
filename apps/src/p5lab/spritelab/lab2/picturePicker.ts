// Blockly fields have no React context, so the lab registers here the
// handler that answers a block's or the world palette's picture request.

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
