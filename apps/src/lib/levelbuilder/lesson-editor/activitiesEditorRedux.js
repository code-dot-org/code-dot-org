import _ from 'lodash';
import PropTypes from 'prop-types';
import {
  activityShape,
  scriptLevelShape,
  tipShape
} from '@cdo/apps/lib/levelbuilder/shapes';

const INIT = 'activitiesEditor/INIT';
const ADD_ACTIVITY = 'activitiesEditor/ADD_ACTIVITY';
const MOVE_ACTIVITY = 'activitiesEditor/MOVE_ACTIVITY';
const REMOVE_ACTIVITY = 'activitiesEditor/REMOVE_ACTIVITY';
const UPDATE_ACTIVITY_FIELD = 'activitiesEditor/UPDATE_ACTIVITY_FIELD';
const ADD_ACTIVITY_SECTION = 'activitiesEditor/ADD_ACTIVITY_SECTION';
const MOVE_ACTIVITY_SECTION = 'activitiesEditor/MOVE_ACTIVITY_SECTION';
const REMOVE_ACTIVITY_SECTION = 'activitiesEditor/REMOVE_ACTIVITY_SECTION';
const UPDATE_ACTIVITY_SECTION_FIELD =
  'activitiesEditor/UPDATE_ACTIVITY_SECTION_FIELD';
const ADD_TIP = 'activitiesEditor/ADD_TIP';
const UPDATE_TIP = 'activitiesEditor/UPDATE_TIP';
const REMOVE_TIP = 'activitiesEditor/REMOVE_TIP';
const ADD_LEVEL = 'activitiesEditor/ADD_LEVEL';
const REMOVE_LEVEL = 'activitiesEditor/REMOVE_LEVEL';
const REORDER_LEVEL = 'activitiesEditor/REORDER_LEVEL';
const MOVE_LEVEL_TO_ACTIVITY_SECTION =
  'activitiesEditor/MOVE_LEVEL_TO_ACTIVITY_SECTION';
const SET_SCRIPT_LEVEL_FIELD = 'activitiesEditor/SET_SCRIPT_LEVEL_FIELD';
const TOGGLE_EXPAND = 'activitiesEditor/TOGGLE_EXPAND';

export const NEW_LEVEL_ID = -1;

// NOTE: Position for Activities, Activity Sections and Levels is 1 based.

export const init = (activities, searchOptions) => ({
  type: INIT,
  activities,
  searchOptions
});

export const addActivity = (activityPosition, activityKey) => ({
  type: ADD_ACTIVITY,
  activityPosition,
  activityKey
});

export const updateActivityField = (
  activityPosition,
  fieldName,
  fieldValue
) => ({
  type: UPDATE_ACTIVITY_FIELD,
  activityPosition,
  fieldName,
  fieldValue
});

export const updateActivitySectionField = (
  activityPosition,
  activitySectionPosition,
  fieldName,
  fieldValue
) => ({
  type: UPDATE_ACTIVITY_SECTION_FIELD,
  activityPosition,
  activitySectionPosition,
  fieldName,
  fieldValue
});

export const addActivitySection = (activityPosition, activitySectionKey) => ({
  type: ADD_ACTIVITY_SECTION,
  activityPosition,
  activitySectionKey
});

export const toggleExpand = (
  activityPosition,
  activitySectionPosition,
  scriptLevelPosition
) => ({
  type: TOGGLE_EXPAND,
  activityPosition,
  activitySectionPosition,
  scriptLevelPosition
});

export const removeLevel = (
  activityPosition,
  activitySectionPosition,
  scriptLevelPosition
) => ({
  type: REMOVE_LEVEL,
  activityPosition,
  activitySectionPosition,
  scriptLevelPosition
});

export const setScriptLevelField = (
  activityPosition,
  activitySectionPosition,
  scriptLevelPosition,
  modifier
) => ({
  type: SET_SCRIPT_LEVEL_FIELD,
  activityPosition,
  activitySectionPosition,
  scriptLevelPosition,
  modifier
});

export const reorderLevel = (
  activityPosition,
  activitySectionPosition,
  originalScriptLevelPosition,
  newScriptLevelPosition
) => ({
  type: REORDER_LEVEL,
  activityPosition,
  activitySectionPosition,
  originalScriptLevelPosition,
  newScriptLevelPosition
});

export const moveLevelToActivitySection = (
  activityPosition,
  activitySectionPosition,
  scriptLevelPosition,
  newActivityPosition,
  newActivitySectionPosition
) => ({
  type: MOVE_LEVEL_TO_ACTIVITY_SECTION,
  activityPosition,
  activitySectionPosition,
  scriptLevelPosition,
  newActivityPosition,
  newActivitySectionPosition
});

export const addLevel = (activityPosition, activitySectionPosition, level) => ({
  type: ADD_LEVEL,
  activityPosition,
  activitySectionPosition,
  level
});

export const moveActivity = (activityPosition, direction) => ({
  type: MOVE_ACTIVITY,
  activityPosition,
  direction
});

export const moveActivitySection = (
  activityPosition,
  activitySectionPosition,
  direction
) => ({
  type: MOVE_ACTIVITY_SECTION,
  activityPosition,
  activitySectionPosition,
  direction
});

export const removeActivity = activityPosition => ({
  type: REMOVE_ACTIVITY,
  activityPosition
});

export const removeActivitySection = (
  activityPosition,
  activitySectionPosition
) => ({
  type: REMOVE_ACTIVITY_SECTION,
  activityPosition,
  activitySectionPosition
});

export const addTip = (activityPosition, activitySectionPosition, tip) => ({
  type: ADD_TIP,
  activityPosition,
  activitySectionPosition,
  tip
});

export const updateTip = (
  activityPosition,
  activitySectionPosition,
  newTip
) => ({
  type: UPDATE_TIP,
  activityPosition,
  activitySectionPosition,
  newTip
});

export const removeTip = (
  activityPosition,
  activitySectionPosition,
  tipKey
) => ({
  type: REMOVE_TIP,
  activityPosition,
  activitySectionPosition,
  tipKey
});

function updateActivityPositions(activities) {
  for (let i = 0; i < activities.length; i++) {
    activities[i].position = i + 1;
  }
}

function updateActivitySectionPositions(activities) {
  activities.forEach(activity => {
    let position = 1;
    activity.activitySections.forEach(activitySection => {
      activitySection.position = position;
      position++;
    });
  });
}

function updateScriptLevelPositions(activities) {
  let nextLevelNumber = 1;
  activities.forEach(activity => {
    activity.activitySections.forEach(section => {
      section.scriptLevels.forEach((scriptLevel, index) => {
        scriptLevel.position = index + 1;
        scriptLevel.levelNumber = nextLevelNumber++;
      });
    });
  });
}

function getScriptLevels(newState, action) {
  const activitySections =
    newState[action.activityPosition - 1].activitySections;

  return activitySections[action.activitySectionPosition - 1].scriptLevels;
}

function activities(state = [], action) {
  let newState = _.cloneDeep(state);

  switch (action.type) {
    case INIT:
      validateActivities(action.activities, action.type);
      return action.activities;
    case ADD_ACTIVITY: {
      newState.push({
        ...emptyActivity,
        key: action.activityKey,
        position: action.activityPosition
      });
      updateActivityPositions(newState);
      break;
    }
    case REMOVE_ACTIVITY: {
      newState.splice(action.activityPosition - 1, 1);
      if (newState.length === 0) {
        newState.push(emptyActivity);
      }
      updateActivityPositions(newState);
      updateActivitySectionPositions(newState);
      break;
    }
    case MOVE_ACTIVITY: {
      if (
        action.direction !== 'up' &&
        action.activityPosition === newState.length
      ) {
        break;
      }
      const index = action.activityPosition - 1;
      const swap = action.direction === 'up' ? index - 1 : index + 1;
      const tempActivity = newState[index];
      newState[index] = newState[swap];
      newState[swap] = tempActivity;
      updateActivityPositions(newState);
      updateActivitySectionPositions(newState);
      break;
    }
    case UPDATE_ACTIVITY_FIELD: {
      newState[action.activityPosition - 1][action.fieldName] =
        action.fieldValue;
      break;
    }
    case ADD_ACTIVITY_SECTION: {
      const activitySections =
        newState[action.activityPosition - 1].activitySections;
      activitySections.push({
        ...emptyActivitySection,
        key: action.activitySectionKey
      });
      updateActivitySectionPositions(newState);
      break;
    }
    case REMOVE_ACTIVITY_SECTION: {
      const activitySections =
        newState[action.activityPosition - 1].activitySections;
      activitySections.splice(action.activitySectionPosition - 1, 1);
      if (activitySections.length === 0) {
        activitySections.push(emptyActivitySection);
      }
      updateActivitySectionPositions(newState);
      break;
    }
    case MOVE_ACTIVITY_SECTION: {
      const activityIndex = action.activityPosition - 1;

      const activitySections = newState[activityIndex].activitySections;

      const activitySectionIndex = action.activitySectionPosition - 1;
      const activitySectionSwapIndex =
        action.direction === 'up'
          ? activitySectionIndex - 1
          : activitySectionIndex + 1;

      if (
        activitySectionSwapIndex >= 0 &&
        activitySectionSwapIndex <= activitySections.length - 1
      ) {
        //if activitySection is staying in the same activity
        const tempActivitySection = activitySections[activitySectionIndex];
        activitySections[activitySectionIndex] =
          activitySections[activitySectionSwapIndex];
        activitySections[activitySectionSwapIndex] = tempActivitySection;
      } else {
        const activitySwapIndex =
          action.direction === 'up' ? activityIndex - 1 : activityIndex + 1;

        // Remove the activitySection from the old activity
        const oldActivitySections = newState[activityIndex].activitySections;
        const curActivitySection = oldActivitySections.splice(
          activitySectionIndex,
          1
        )[0];

        // add activitySection to the new activity
        const newActivitySections =
          newState[activitySwapIndex].activitySections;
        action.direction === 'up'
          ? newActivitySections.push(curActivitySection)
          : newActivitySections.unshift(curActivitySection);
      }
      updateActivitySectionPositions(newState);
      break;
    }
    case UPDATE_ACTIVITY_SECTION_FIELD: {
      const activitySections =
        newState[action.activityPosition - 1].activitySections;
      activitySections[action.activitySectionPosition - 1][action.fieldName] =
        action.fieldValue;
      break;
    }
    case ADD_TIP: {
      validateTip(action.tip, action.type);
      const activitySections =
        newState[action.activityPosition - 1].activitySections;
      activitySections[action.activitySectionPosition - 1].tips.push(
        action.tip
      );
      break;
    }
    case UPDATE_TIP: {
      validateTip(action.newTip, action.type);
      const activitySections =
        newState[action.activityPosition - 1].activitySections;
      const index = activitySections[
        action.activitySectionPosition - 1
      ].tips.indexOf(tip => tip.key === action.newTip.key);
      activitySections[action.activitySectionPosition - 1].tips.splice(
        index - 1,
        1,
        action.newTip
      );
      break;
    }
    case REMOVE_TIP: {
      const activitySections =
        newState[action.activityPosition - 1].activitySections;
      activitySections[
        action.activitySectionPosition - 1
      ].tips = activitySections[action.activitySectionPosition - 1].tips.filter(
        tip => {
          return tip.key !== action.tipKey;
        }
      );
      break;
    }

    case ADD_LEVEL: {
      validateScriptLevel(action.level, action.type);
      const scriptLevels = getScriptLevels(newState, action);
      scriptLevels.push(action.level);
      updateScriptLevelPositions(newState);
      break;
    }
    case REMOVE_LEVEL: {
      const scriptLevels = getScriptLevels(newState, action);
      scriptLevels.splice(action.scriptLevelPosition - 1, 1);
      updateScriptLevelPositions(newState);
      break;
    }
    case REORDER_LEVEL: {
      const scriptLevels = getScriptLevels(newState, action);
      const temp = scriptLevels.splice(
        action.originalScriptLevelPosition - 1,
        1
      );
      scriptLevels.splice(action.newScriptLevelPosition - 1, 0, temp[0]);
      updateScriptLevelPositions(newState);
      break;
    }
    case MOVE_LEVEL_TO_ACTIVITY_SECTION: {
      //remove level from old activitySection
      const scriptLevels = getScriptLevels(newState, action);
      const scriptLevel = scriptLevels.splice(
        action.scriptLevelPosition - 1,
        1
      )[0];
      updateScriptLevelPositions(newState);

      // add level to new activitySection
      const newActivitySections =
        newState[action.newActivityPosition - 1].activitySections;
      const newScriptLevels =
        newActivitySections[action.newActivitySectionPosition - 1].scriptLevels;
      newScriptLevels.push(scriptLevel);
      updateScriptLevelPositions(newState);
      break;
    }
    case SET_SCRIPT_LEVEL_FIELD: {
      const type = Object.keys(action.modifier)[0];
      const scriptLevels = getScriptLevels(newState, action);
      scriptLevels[action.scriptLevelPosition - 1][type] =
        action.modifier[type];
      break;
    }
    case TOGGLE_EXPAND: {
      const scriptLevels = getScriptLevels(newState, action);
      const scriptLevel = scriptLevels[action.scriptLevelPosition - 1];
      scriptLevel.expand = !scriptLevel.expand;
      break;
    }
  }

  return newState;
}

function searchOptions(state = {}, action) {
  switch (action.type) {
    case INIT:
      return action.searchOptions;
  }
  return state;
}

// Serialize the activities into JSON, renaming any keys which are different
// on the backend.
export const getSerializedActivities = rawActivities => {
  const activities = _.cloneDeep(rawActivities);
  activities.forEach(activity => {
    activity.name = activity.displayName;
    delete activity.displayName;

    activity.activitySections.forEach(activitySection => {
      activitySection.name = activitySection.displayName;
      delete activitySection.displayName;

      activitySection.description = activitySection.text;
      delete activitySection.text;

      activitySection.scriptLevels.forEach(scriptLevel => {
        // The server expects id to be absent if a new script level is to be
        // created.
        if (scriptLevel.id === NEW_LEVEL_ID) {
          delete scriptLevel.id;
        }

        // The position within the activity section
        scriptLevel.activitySectionPosition = scriptLevel.position;

        // Other position values will be recomputed from the
        // activitySectionPosition on the server.
        delete scriptLevel.position;
        delete scriptLevel.levelNumber;
      });
    });
  });

  return JSON.stringify(activities);
};

// Use PropTypes.checkPropTypes to enforce that each entry in the array of
// activities matches the shape defined in activityShape.
function validateActivities(activities, location) {
  const propTypes = {activities: PropTypes.arrayOf(activityShape)};
  PropTypes.checkPropTypes(propTypes, {activities}, 'property', location);
}

// Use PropTypes.checkPropTypes to enforce that each entry in the array of
// tip matches the shape defined in tipShape.
function validateTip(tip, location) {
  const propTypes = {tip: tipShape};
  PropTypes.checkPropTypes(propTypes, {tip}, 'property', location);
}

// Use PropTypes.checkPropTypes to enforce that each entry in the array of
// level matches the shape defined in scriptLevelShape.
function validateScriptLevel(scriptLevel, location) {
  const propTypes = {scriptLevel: scriptLevelShape};
  PropTypes.checkPropTypes(propTypes, {scriptLevel}, 'property', location);
}

export default {
  activities,
  searchOptions
};

export const emptyActivitySection = {
  key: 'activity-section-1',
  displayName: '',
  levels: [],
  tips: [],
  remarks: false,
  slide: false,
  text: '',
  scriptLevels: [],
  position: 1
};

export const emptyActivity = {
  key: 'activity-1',
  displayName: '',
  position: 1,
  duration: 0,
  activitySections: [emptyActivitySection]
};
