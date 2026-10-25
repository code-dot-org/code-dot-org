// What a Screen or a Map looks like, for the switcher
// (specs/SHELL_FINISH_PLAN.md, step 1).
//
// A place's picture is a hidden file beside it: `main.picture` next to
// `main.map`, holding the image as a data URL. A file rather than a cache,
// so it is saved with the project and goes wherever the place goes; text
// rather than an uploaded PNG, because an upload is a round trip to a server
// for a picture that is redrawn whenever the place changes. The compiler
// never sees one (`runtime/projectFiles`), so writing it does not restart
// the game. It follows its place through a rename or a delete as a `.sheet`
// follows its image (`files/companions`).

import {getNextFileId} from '@code-dot-org/codebridge';
import type {MultiFileSource} from '@code-dot-org/core/api';

import {companionOf, followOwners, type Companion} from '../files/companions';

/** The extension of a place's picture, which hides it from every list. */
export const PICTURE_EXTENSION = 'picture';

/** The kinds of file that are places, and have a picture. */
const PLACE = /\.(map|screen|world)$/;

/** `main.map` → `main.picture`. */
export const pictureFileName = (placeName: string): string =>
  `${placeName.replace(/\.[^.]+$/, '')}.${PICTURE_EXTENSION}`;

const PICTURES: Companion = {
  owns: file => PLACE.test(file.name),
  nameFor: pictureFileName,
};

/** The picture of the place in `fileId`, as a data URL, if it has one. */
export function placePicture(
  source: MultiFileSource,
  fileId: string,
): string | undefined {
  const place = source.files[fileId];
  if (!place) {
    return undefined;
  }
  return companionOf(source, PICTURES, place)?.contents || undefined;
}

/** The project with the place in `fileId` pictured as `picture`. */
export function withPlacePicture(
  source: MultiFileSource,
  fileId: string,
  picture: string,
): MultiFileSource {
  const place = source.files[fileId];
  if (!place || !PLACE.test(place.name)) {
    return source;
  }
  const existing = companionOf(source, PICTURES, place);
  if (existing?.contents === picture) {
    return source;
  }
  const files = {...source.files};
  if (existing) {
    files[existing.id] = {...existing, contents: picture};
  } else {
    const id = getNextFileId(Object.values(source.files));
    files[id] = {
      id,
      name: pictureFileName(place.name),
      language: 'plaintext',
      contents: picture,
      folderId: place.folderId,
    };
  }
  return {...source, files};
}

/** The project after a file operation, each picture beside its place. */
export const followPlaces = (
  next: MultiFileSource,
  previous: MultiFileSource,
): MultiFileSource => followOwners(next, previous, PICTURES);
