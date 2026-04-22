import {ModelParameters} from '@cdo/apps/aichat/types';
import {getTypedKeys} from '@cdo/apps/types/utils';

import {
  AiCustomizations,
  FieldVisibilities,
  ModelCardInfo,
  Visibility,
} from '../types';

const haveDifferentValues = (
  value1: AiCustomizations[keyof AiCustomizations],
  value2: AiCustomizations[keyof AiCustomizations]
): boolean => {
  if (typeof value1 === 'object' && typeof value2 === 'object') {
    return JSON.stringify(value1) !== JSON.stringify(value2);
  }
  // In the case that field values are saved as different types, compare as strings.
  if (
    typeof value1 !== typeof value2 &&
    value1 !== undefined &&
    value2 !== undefined
  ) {
    return value1.toString() !== value2.toString();
  }

  return value1 !== value2;
};

// Used to decide which model customizations have changed
// between the previous save and the current one,
// such that we can display a notification for each to users.
export const findChangedProperties = (
  previous: ModelParameters | undefined,
  next: ModelParameters
) => {
  const allKeys = getTypedKeys(next);
  if (!previous) {
    return allKeys;
  }
  return allKeys.filter(key => haveDifferentValues(previous[key], next[key]));
};

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
