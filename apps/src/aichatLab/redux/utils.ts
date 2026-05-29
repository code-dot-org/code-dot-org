import {findChangedProperties} from '@cdo/apps/aichat/redux/utils';
import {getTypedKeys} from '@cdo/apps/types/utils';

import {
  AiCustomizations,
  FieldVisibilities,
  ModelCardInfo,
  Visibility,
} from '../types';

// Used to decide whether to unpublish a project based on whether
// it has its model card filled out or not.
export const hasFilledOutModelCard = (modelCardInfo: ModelCardInfo) => {
  for (const key of getTypedKeys(modelCardInfo)) {
    if (key === 'isPublished') {
      continue;
    } else if (key === 'exampleTopics') {
      if (
        !modelCardInfo['exampleTopics'].filter(topic => topic.length).length
      ) {
        return false;
      }
    } else if (!modelCardInfo[key].length) {
      return false;
    }
  }

  return true;
};

export const anyFieldsChanged = (
  levelDefaultAiCustomizations: AiCustomizations,
  AiCustomizations: AiCustomizations
) => {
  return (
    findChangedProperties(levelDefaultAiCustomizations, AiCustomizations)
      .length === 0
  );
};

export const allFieldsHidden = (fieldVisibilities: FieldVisibilities) =>
  getTypedKeys(fieldVisibilities).every(
    key => fieldVisibilities[key] === Visibility.HIDDEN
  );
