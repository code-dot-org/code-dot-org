// Asking the file menus to act on a project's files, from wherever a kind of
// file is used rather than from a folder button (specs/SHELL_PLAN.md, step
// 4; specs/SHELL_FINISH_PLAN.md, step 4).
//
// The menus own the prompts and already do each of these from a folder's
// row menu, so the doors ask them rather than doing it again
// (`actors/actorDelete` is the same seam for an actor). A request resolves
// once the act is done or abandoned. `make` and `draw` answer the new file's
// id, so the door that asked can take it; the rest answer nothing, and what they
// did is seen in the project. A file made or opened is the one now in
// front, a step on the trail.

import {importSeam} from '../blockly/libraryImport';

export type FileAct =
  /**
   * A new one in `folder` — `maps`, `screens`, `sprites`, `styles` — by a
   * name the learner gives; of `extension` where the folder makes more than
   * one kind.
   */
  | {
      act: 'make';
      folder: string;
      extension?: string;
      /**
       * False to leave it closed, for a door with more to do first; it then
       * asks `open` itself.
       */
      open?: boolean;
    }
  /**
   * A picture drawn from words, into `sprites` or `backgrounds`; answers
   * the kept file's id, or nothing.
   */
  | {act: 'draw'; folder: string}
  /** One of the learner's own files, into a folder that takes them. */
  | {act: 'upload'; folder: string}
  /** Put it in front, in its editor. */
  | {act: 'open'; fileId: string}
  | {act: 'rename'; fileId: string}
  /** A copy, under a name the learner gives. */
  | {act: 'clone'; fileId: string}
  | {act: 'delete'; fileId: string};

const seam = importSeam<[act: FileAct]>();

export const setFileActHandler = seam.register;
export const requestFileAct = seam.request;
