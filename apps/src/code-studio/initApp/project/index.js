import unEnhancedProject from './internal';

import {filesVersionId, setFilesVersionId} from './filesVersionId';
import {getCurrentId, setCurrentId} from './currentId';

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
