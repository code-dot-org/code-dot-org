// Asking for the Actor Creator from somewhere that does not own it.
//
// The Creator is the file menus': it is built from a dozen things they hold —
// the kinds that can be copied, the stock templates, the project's pictures
// decoded, the fold that writes an actor with its picture and abilities — so
// it stays there (`files/FileMenus`). The MAP EDITOR's palette wants it too:
// a lesson told on the map makes a new kind from the map
// (specs/KINDS_FROM_THE_MAP_PLAN.md).
//
// The same seam the import shelves and Enhance use (`blockly/libraryImport`):
// a request resolves with the new actor's MODULE PATH, or with nothing — when
// the learner cancelled, and when nobody is listening, which is a test or the
// headless generator and is ordinary rather than an error.
//
// WHAT THE ASKER GETS BACK BESIDES THE PATH: the tab it was on. The Creator
// opens the file it writes, which is right from the Actors menu and wrong
// from a canvas — a learner who asked from the map wants the new kind on the
// palette, not to be taken to its blocks. The file menus put the active tab
// back when the request came through here.

import {importSeam} from '../../blockly/libraryImport';

const seam = importSeam();

export const setActorCreateHandler = seam.register;
export const requestActorCreate = seam.request;
