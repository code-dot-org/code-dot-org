// Asking the file menus to make, rename or delete a Screen or a Map, from
// the toolbar over the map editor (specs/SHELL_PLAN.md, step 4).
//
// The menus own the prompts and already do each of these from a folder's
// row menu, so the toolbar asks them rather than doing it again
// (`actors/actorDelete` is the same seam for an actor). A request resolves
// once the act is done or abandoned, with nothing either way: what it did
// is seen in the project, and a file it made is the one now open.

import {importSeam} from '../blockly/libraryImport';

export type FileAct =
  | {act: 'make'; folder: 'maps' | 'screens'}
  | {act: 'rename'; fileId: string}
  | {act: 'delete'; fileId: string};

const seam = importSeam<[act: FileAct]>();

export const setFileActHandler = seam.register;
export const requestFileAct = seam.request;
