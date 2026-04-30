// This variable keeps track of the most recent remove event ID so that we can
// assign a unique remove event ID in increasing sequence to a new event.
// This ID is specifically used to look up and remove events from the chat workspace

import {getTypedKeys, ValueOf} from '@cdo/apps/types/utils';

import {ModelParameters} from '../types';

// (e.g. model updates and notification events).
let latestRemoveId = 0;
export const getNewRemoveId = () => {
  latestRemoveId += 1;
  return latestRemoveId;
};

const haveDifferentValues = (
  value1: ValueOf<ModelParameters>,
  value2: ValueOf<ModelParameters>
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
