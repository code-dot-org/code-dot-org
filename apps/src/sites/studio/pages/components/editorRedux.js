/* global levelKeyList */

import _ from 'lodash';

const ADD_GROUP = 'scriptEditor/ADD_GROUP';
const ADD_STAGE = 'scriptEditor/ADD_STAGE';
const TOGGLE_EXPAND = 'scriptEditor/TOGGLE_EXPAND';
const REMOVE_LEVEL = 'scriptEditor/REMOVE_LEVEL';
const CHOOSE_LEVEL_TYPE = 'scriptEditor/CHOOSE_LEVEL_TYPE';
const CHOOSE_LEVEL = 'scriptEditor/CHOOSE_LEVEL';
const ADD_VARIANT = 'scriptEditor/ADD_VARIANT';
const REORDER_LEVEL = 'scriptEditor/REORDER_LEVEL';
const ADD_LEVEL = 'scriptEditor/ADD_LEVEL';
const MOVE_GROUP = 'scriptEditor/MOVE_GROUP';
const MOVE_STAGE = 'scriptEditor/MOVE_STAGE';
const REMOVE_GROUP = 'scriptEditor/REMOVE_GROUP';
const REMOVE_STAGE = 'scriptEditor/REMOVE_STAGE';

export const addGroup = (stageName, groupName) => ({
  type: ADD_GROUP,
  stageName,
  groupName
});

export const addStage = (position, stageName) => ({
  type: ADD_STAGE,
  position,
  stageName
});

export const toggleExpand = (stage, level) => ({
  type: TOGGLE_EXPAND,
  stage,
  level
});

export const removeLevel = (stage, level) => ({
  type: REMOVE_LEVEL,
  stage,
  level
});

export const chooseLevelType = (stage, level, value) => ({
  type: CHOOSE_LEVEL_TYPE,
  stage,
  level,
  value
});

export const chooseLevel = (stage, level, variant, value) => ({
  type: CHOOSE_LEVEL,
  stage,
  level,
  variant,
  value
});

export const addVariant = (stage, level) => ({
  type: ADD_VARIANT,
  stage,
  level
});

export const reorderLevel = (stage, originalPosition, newPosition) => ({
  type: REORDER_LEVEL,
  stage,
  originalPosition,
  newPosition
});

export const addLevel = (stage) => ({
  type: ADD_LEVEL,
  stage
});

export const moveGroup = (position, direction) => ({
  type: MOVE_GROUP,
  position,
  direction
});

export const moveStage = (position, direction) => ({
  type: MOVE_STAGE,
  position,
  direction
});

export const removeGroup = (position) => ({
  type: REMOVE_GROUP,
  position
});

export const removeStage = (position) => ({
  type: REMOVE_STAGE,
  position
});

function updatePositions(node) {
  for (var i = 0; i < node.length; i++) {
    node[i].position = i + 1;
  }
}

let newStageId = -1;
let newLevelId = -1;

export default function reducer(state, action) {
  let newState = _.cloneDeep(state);

  switch (action.type) {
    case REORDER_LEVEL: {
      const levels = newState[action.stage - 1].levels;
      const temp = levels.splice(action.originalPosition - 1, 1);
      levels.splice(action.newPosition - 1, 0, temp[0]);
      updatePositions(levels);
      break;
    }
    case ADD_GROUP: {
      newState.push({
        id: newStageId--,
        flex_category: action.groupName,
        name: action.stageName,
        levels: []
      });
      updatePositions(newState);
      break;
    }
    case ADD_STAGE: {
      const groupName = newState[action.position - 1].flex_category;
      newState.splice(action.position, 0, {
        id: newStageId--,
        name: action.stageName,
        flex_category: groupName,
        levels: []
      });
      updatePositions(newState);
      break;
    }
    case ADD_LEVEL: {
      const levels = newState[action.stage - 1].levels;
      const id = newLevelId--;
      levels.push({
        ids: [id],
        activeId: id,
        expand: true
      });
      updatePositions(levels);
      break;
    }
    case ADD_VARIANT: {
      newState[action.stage - 1].levels[action.level - 1].ids.push(newLevelId--);
      break;
    }
    case REMOVE_GROUP: {
      const groupName = newState[action.position - 1].flex_category;
      newState = newState.filter(stage => stage.flex_category !== groupName);
      updatePositions(newState);
      break;
    }
    case REMOVE_STAGE: {
      newState.splice(action.position - 1, 1);
      updatePositions(newState);
      break;
    }
    case REMOVE_LEVEL: {
      const levels = newState[action.stage - 1].levels;
      levels.splice(action.level - 1, 1);
      updatePositions(levels);
      break;
    }
    case CHOOSE_LEVEL: {
      const level = newState[action.stage - 1].levels[action.level - 1];
      if (level.ids[action.variant] === level.activeId) {
        level.activeId = action.value;
        level.key = levelKeyList[action.value];
      }
      level.ids[action.variant] = action.value;
      break;
    }
    case CHOOSE_LEVEL_TYPE: {
      newState[action.stage - 1].levels[action.level - 1].kind = action.value;
      break;
    }
    case TOGGLE_EXPAND: {
      const level = newState[action.stage - 1].levels[action.level - 1];
      level.expand = !level.expand;
      break;
    }
    case MOVE_GROUP: {
      if (action.direction !== 'up' && action.position === newState.length) {
        break;
      }
      const index = action.position - 1;
      const groupName = newState[index].flex_category;
      let categories = newState.map(s => s.flex_category);
      let start = categories.indexOf(groupName);
      let count = categories.filter(c => c === groupName).length;
      const swap = newState.splice(start, count);
      categories = newState.map(s => s.flex_category);
      const swappedGroupName = newState[action.direction === 'up' ? index - 1 : index].flex_category;
      start = categories.indexOf(swappedGroupName);
      count = categories.filter(c => c === swappedGroupName).length;
      newState.splice(action.direction === 'up' ? start : start + count, 0, ...swap);
      console.log(newState.map(s => s.flex_category));
      updatePositions(newState);
      break;
    }
    case MOVE_STAGE: {
      const index = action.position - 1;
      const swap = (action.direction === 'up' ? index - 1 : index + 1);
      const temp = newState[index];
      newState[index] = newState[swap];
      newState[swap] = temp;
      updatePositions(newState);
      break;
    }
  }

  return newState;
}
