// The Type choice as students see it: a sprite is offered as a character
// or an object.

import {ImageSubject, ImageType} from './types';

export interface ImageKind {
  value: string;
  imageType: ImageType;
  subject?: ImageSubject;
}

export const IMAGE_KINDS: ImageKind[] = [
  {value: 'background', imageType: 'background'},
  {value: 'character', imageType: 'sprite', subject: 'character'},
  {value: 'object', imageType: 'sprite', subject: 'object'},
  {value: 'block', imageType: 'block'},
];

/** The kind a type and subject name; a sprite with no subject is a
    character. */
export function imageKindFor(
  imageType: ImageType,
  subject?: ImageSubject
): ImageKind {
  const wanted = imageType === 'sprite' ? subject ?? 'character' : undefined;
  return (
    IMAGE_KINDS.find(
      kind => kind.imageType === imageType && kind.subject === wanted
    ) ?? IMAGE_KINDS[0]
  );
}
