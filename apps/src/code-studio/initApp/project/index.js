import unEnhancedProject from './internal';

import {filesVersionId, setFilesVersionId} from './filesVersionId';
import {getCurrentId, setCurrentId} from './currentId';

/*
  filesVersionId and getCurrentId were creating circular dependencies in the clientApi file, which needed both of them.
  but clientApi and all of its child objects were imported into project.js (now project/internal.js), so we couldn't break the link.

  This moves the old object to the wrappered `internal.js` file, and moves filesVersionId and current.id into separate getter/setter files
  contained within this directory.

  This file then re-exports everything from the internal objet, along with the new setters/getters.

  Further, current.id is set via two functions which replace the entire current object. So the re-export here will wrap them so  they receive
  a callback as their last argument which will set the current.id value in the proper location so direct loading of the `currentId` file will work properly.

  Externally, the only change to code required is that project.filesVersionId is deprecated and replaced by project.filesVersionId()
*/

export default {
  ...unEnhancedProject,
  filesVersionId,
  setFilesVersionId,
  getCurrentId,
  setCurrentId,

  fetchSource: (...args) =>
    unEnhancedProject.fetchSource(...args, setCurrentId),
  setCurrentData: (...args) =>
    unEnhancedProject.setCurrentData(...args, setCurrentId),
};
