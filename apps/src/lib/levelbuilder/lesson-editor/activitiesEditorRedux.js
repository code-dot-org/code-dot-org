import _ from 'lodash';

const INIT = 'activitiesEditor/INIT';
const ADD_ACTIVITY = 'activitiesEditor/ADD_ACTIVITY';
const MOVE_ACTIVITY = 'activitiesEditor/MOVE_ACTIVITY';
const SET_ACTIVITY = 'activitiesEditor/SET_ACTIVITY';
const REMOVE_ACTIVITY = 'activitiesEditor/REMOVE_ACTIVITY';
const UPDATE_ACTIVITY_FIELD = 'activitiesEditor/UPDATE_ACTIVITY_FIELD';
const ADD_ACTIVITY_SECTION = 'activitiesEditor/ADD_ACTIVITY_SECTION';
const MOVE_ACTIVITY_SECTION = 'activitiesEditor/MOVE_ACTIVITY_SECTION';
const REMOVE_ACTIVITY_SECTION = 'activitiesEditor/REMOVE_ACTIVITY_SECTION';
const UPDATE_ACTIVITY_SECTION_FIELD =
  'activitiesEditor/UPDATE_ACTIVITY_SECTION_FIELD';
const ADD_TIP = 'activitiesEditor/ADD_TIP';
const ADD_LEVEL = 'activitiesEditor/ADD_LEVEL';
const REMOVE_LEVEL = 'activitiesEditor/REMOVE_LEVEL';
const CHOOSE_LEVEL = 'activitiesEditor/CHOOSE_LEVEL';
const REORDER_LEVEL = 'activitiesEditor/REORDER_LEVEL';
const MOVE_LEVEL_TO_ACTIVITY_SECTION =
  'activitiesEditor/MOVE_LEVEL_TO_ACTIVITY_SECTION';
const ADD_VARIANT = 'activitiesEditor/ADD_VARIANT';
const SET_ACTIVE_VARIANT = 'activitiesEditor/SET_ACTIVE_VARIANT';
const REMOVE_VARIANT = 'activitiesEditor/REMOVE_VARIANT';
const SET_FIELD = 'activitiesEditor/SET_FIELD';
const TOGGLE_EXPAND = 'activitiesEditor/TOGGLE_EXPAND';

// NOTE: Position for Activities, Activity Sections and Levels is 1 based.

export const init = (activities, levelKeyList) => ({
  type: INIT,
  activities,
  levelKeyList
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
  levelPosition
) => ({
  type: TOGGLE_EXPAND,
  activityPosition,
  activitySectionPosition,
  levelPosition
});

export const removeLevel = (
  activityPosition,
  activitySectionPosition,
  levelPosition
) => ({
  type: REMOVE_LEVEL,
  activityPosition,
  activitySectionPosition,
  levelPosition
});

export const chooseLevel = (
  activityPosition,
  activitySectionPosition,
  levelPosition,
  variant,
  value
) => ({
  type: CHOOSE_LEVEL,
  activityPosition,
  activitySectionPosition,
  levelPosition,
  variant,
  value
});

export const addVariant = (
  activityPosition,
  activitySectionPosition,
  levelPosition
) => ({
  type: ADD_VARIANT,
  activityPosition,
  activitySectionPosition,
  levelPosition
});

export const removeVariant = (
  activityPosition,
  activitySectionPosition,
  levelPosition,
  levelId
) => ({
  type: REMOVE_VARIANT,
  activityPosition,
  activitySectionPosition,
  levelPosition,
  levelId
});

export const setActiveVariant = (
  activityPosition,
  activitySectionPosition,
  levelPosition,
  id
) => ({
  type: SET_ACTIVE_VARIANT,
  activityPosition,
  activitySectionPosition,
  levelPosition,
  id
});

export const setField = (
  activityPosition,
  activitySectionPosition,
  levelPosition,
  modifier
) => ({
  type: SET_FIELD,
  activityPosition,
  activitySectionPosition,
  levelPosition,
  modifier
});

export const reorderLevel = (
  activityPosition,
  activitySectionPosition,
  originalLevelPosition,
  newLevelPosition
) => ({
  type: REORDER_LEVEL,
  activityPosition,
  activitySectionPosition,
  originalLevelPosition,
  newLevelPosition
});

export const moveLevelToActivitySection = (
  activityPosition,
  activitySectionPosition,
  levelPosition,
  newActivitySectionPosition
) => ({
  type: MOVE_LEVEL_TO_ACTIVITY_SECTION,
  activityPosition,
  activitySectionPosition,
  levelPosition,
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

export const setActivity = (
  activitySectionPosition,
  oldActivityPosition,
  newActivityPosition
) => ({
  type: SET_ACTIVITY,
  activitySectionPosition,
  oldActivityPosition,
  newActivityPosition
});

export const addTip = (activityPosition, activitySectionPosition, tip) => ({
  type: ADD_TIP,
  activityPosition,
  activitySectionPosition,
  tip
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

function updateLevelPositions(levels) {
  for (let i = 0; i < levels.length; i++) {
    levels[i].position = i + 1;
  }
}

export const NEW_LEVEL_ID = -1;

function activities(state = [], action) {
  let newState = _.cloneDeep(state);

  switch (action.type) {
    case INIT:
      return action.activities;
    case REORDER_LEVEL: {
      const activitySections =
        newState[action.activityPosition - 1].activitySections;
      const levels =
        activitySections[action.activitySectionPosition - 1].levels;
      const temp = levels.splice(action.originalLevelPosition - 1, 1);
      levels.splice(action.newLevelPosition - 1, 0, temp[0]);
      updateLevelPositions(levels);
      break;
    }
    case MOVE_LEVEL_TO_ACTIVITY_SECTION: {
      //remove level from old activitySection
      const activitySections =
        newState[action.activityPosition - 1].activitySections;
      const levels =
        activitySections[action.activitySectionPosition - 1].levels;
      const level = levels.splice(action.levelPosition - 1, 1)[0];
      updateLevelPositions(levels);

      // add level to new activitySection
      let newActivityPosition = null;
      newState.forEach(activity => {
        activity.activitySections.forEach(activitySection => {
          if (activitySection.position === action.newActivitySectionPosition) {
            newActivityPosition = activity.position;
          }
        });
      });
      const newActivitySections =
        newState[newActivityPosition - 1].activitySections;
      const newLevels =
        newActivitySections[
          action.newActivitySectionPosition - newActivitySections[0].position
        ].levels;
      newLevels.push(level);
      updateLevelPositions(newLevels);
      break;
    }
    case ADD_ACTIVITY: {
      newState.push({
        key: action.activityKey,
        displayName: '',
        position: action.activityPosition,
        time: 0,
        activitySections: []
      });
      updateActivityPositions(newState);
      break;
    }
    case UPDATE_ACTIVITY_FIELD: {
      newState[action.activityPosition - 1][action.fieldName] =
        action.fieldValue;
      break;
    }
    case UPDATE_ACTIVITY_SECTION_FIELD: {
      const activitySections =
        newState[action.activityPosition - 1].activitySections;
      activitySections[action.activitySectionPosition - 1][action.fieldName] =
        action.fieldValue;
      break;
    }
    case ADD_ACTIVITY_SECTION: {
      const activitySections =
        newState[action.activityPosition - 1].activitySections;
      activitySections.push({
        key: action.activitySectionKey,
        title: '',
        levels: [],
        tips: [],
        remarks: false,
        slide: false,
        text: ''
      });
      updateActivitySectionPositions(newState);
      break;
    }

    case ADD_LEVEL: {
      const activitySections =
        newState[action.activityPosition - 1].activitySections;
      const levels =
        activitySections[action.activitySectionPosition - 1].levels;
      levels.push(action.level);
      updateLevelPositions(levels);
      break;
    }
    case ADD_VARIANT: {
      const activitySections =
        newState[action.activityPosition - 1].activitySections;
      activitySections[action.activitySectionPosition - 1].levels[
        action.levelPosition - 1
      ].ids.push(NEW_LEVEL_ID);
      break;
    }
    case REMOVE_VARIANT: {
      const activitySections =
        newState[action.activityPosition - 1].activitySections;
      const levelIds =
        activitySections[action.activitySectionPosition - 1].levels[
          action.levelPosition - 1
        ].ids;
      const i = levelIds.indexOf(action.levelId);
      levelIds.splice(i, 1);
      break;
    }
    case SET_ACTIVE_VARIANT: {
      const activitySections =
        newState[action.activityPosition - 1].activitySections;
      activitySections[action.activitySectionPosition - 1].levels[
        action.levelPosition - 1
      ].activeId = action.id;
      break;
    }
    case SET_FIELD: {
      const type = Object.keys(action.modifier)[0];
      const activitySections =
        newState[action.activityPosition - 1].activitySections;
      activitySections[action.activitySectionPosition - 1].levels[
        action.levelPosition - 1
      ][type] = action.modifier[type];
      break;
    }
    case REMOVE_ACTIVITY: {
      newState.splice(action.activityPosition - 1, 1);
      updateActivityPositions(newState);
      updateActivitySectionPositions(newState);
      break;
    }
    case REMOVE_ACTIVITY_SECTION: {
      const activitySections =
        newState[action.activityPosition - 1].activitySections;
      activitySections.splice(action.activitySectionPosition - 1, 1);
      updateActivitySectionPositions(newState);
      break;
    }
    case REMOVE_LEVEL: {
      const activitySections =
        newState[action.activityPosition - 1].activitySections;
      const levels =
        activitySections[action.activitySectionPosition - 1].levels;
      levels.splice(action.levelPosition - 1, 1);
      updateLevelPositions(levels);
      break;
    }
    case CHOOSE_LEVEL: {
      const activitySections =
        newState[action.activityPosition - 1].activitySections;
      const level =
        activitySections[action.activitySectionPosition - 1].levels[
          action.levelPosition - 1
        ];
      if (level.ids[action.variant] === level.activeId) {
        level.activeId = action.value;
      }
      level.ids[action.variant] = action.value;
      break;
    }
    case TOGGLE_EXPAND: {
      const activitySections =
        newState[action.activityPosition - 1].activitySections;
      const level =
        activitySections[action.activitySectionPosition - 1].levels[
          action.levelPosition - 1
        ];
      level.expand = !level.expand;
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
    case SET_ACTIVITY: {
      // Remove the activitySection from the old activity
      const oldActivitySections =
        newState[action.oldActivityPosition - 1].activitySections;
      const curActivitySection = oldActivitySections.splice(
        action.activitySectionPosition - 1,
        1
      )[0];

      // add activitySection to the new activity
      const newActivitySections =
        newState[action.newActivityPosition - 1].activitySections;
      newActivitySections.push(curActivitySection);
      updateActivitySectionPositions(newState);

      break;
    }
    case ADD_TIP: {
      const activitySections =
        newState[action.activityPosition - 1].activitySections;
      activitySections[action.activitySectionPosition - 1].tips.push(
        action.tip
      );
      break;
    }
  }

  return newState;
}

function levelKeyList(state = {}, action) {
  switch (action.type) {
    case INIT:
      return action.levelKeyList;
  }
  return state;
}

function levelNameToIdMap(state = {}, action) {
  switch (action.type) {
    case INIT: {
      if (!action.levelKeyList) {
        // This can be falsy if the new editor experiment is not enabled
        return state;
      }

      const levelNameToIdMap = {};
      Object.keys(action.levelKeyList).forEach(levelId => {
        const levelKey = action.levelKeyList[levelId];
        levelNameToIdMap[levelKey] = +levelId;
      });
      return levelNameToIdMap;
    }
  }
  return state;
}

export default {
  activities,
  levelKeyList,
  levelNameToIdMap
};
