import _ from 'lodash';

const INIT = 'scriptEditor/INIT';
const ADD_GROUP = 'scriptEditor/ADD_GROUP';
const ADD_STAGE = 'scriptEditor/ADD_STAGE';
const TOGGLE_EXPAND = 'scriptEditor/TOGGLE_EXPAND';
const REMOVE_LEVEL = 'scriptEditor/REMOVE_LEVEL';
const CHOOSE_LEVEL = 'scriptEditor/CHOOSE_LEVEL';
const ADD_VARIANT = 'scriptEditor/ADD_VARIANT';
const REMOVE_VARIANT = 'scriptEditor/REMOVE_VARIANT';
const SET_ACTIVE_VARIANT = 'scriptEditor/SET_ACTIVE_VARIANT';
const SET_FIELD = 'scriptEditor/SET_FIELD';
const REORDER_LEVEL = 'scriptEditor/REORDER_LEVEL';
const ADD_LEVEL = 'scriptEditor/ADD_LEVEL';
const MOVE_GROUP = 'scriptEditor/MOVE_GROUP';
const MOVE_STAGE = 'scriptEditor/MOVE_STAGE';
const REMOVE_GROUP = 'scriptEditor/REMOVE_GROUP';
const REMOVE_STAGE = 'scriptEditor/REMOVE_STAGE';
const SET_STAGE_LOCKABLE = 'scriptEditor/SET_STAGE_LOCKABLE';

export const init = (stages, levelKeyList) => ({
  type: INIT,
  stages,
  levelKeyList
});

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

export const removeVariant = (stage, level, levelId) => ({
  type: REMOVE_VARIANT,
  stage,
  level,
  levelId
});

export const setActiveVariant = (stage, level, id) => ({
  type: SET_ACTIVE_VARIANT,
  stage,
  level,
  id
});

export const setField = (stage, level, modifier) => ({
  type: SET_FIELD,
  stage,
  level,
  modifier
});

export const reorderLevel = (stage, originalPosition, newPosition) => ({
  type: REORDER_LEVEL,
  stage,
  originalPosition,
  newPosition
});

export const addLevel = stage => ({
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

export const removeGroup = position => ({
  type: REMOVE_GROUP,
  position
});

export const removeStage = position => ({
  type: REMOVE_STAGE,
  position
});

export const setStageLockable = (stage, lockable) => ({
  type: SET_STAGE_LOCKABLE,
  stage,
  lockable
});

function updatePositions(node) {
  for (let i = 0; i < node.length; i++) {
    node[i].position = i + 1;
  }
}

export const NEW_LEVEL_ID = -1;

function stages(state = [], action) {
  let newState = _.cloneDeep(state);

  switch (action.type) {
    case INIT:
      return action.stages;
    case REORDER_LEVEL: {
      const levels = newState[action.stage - 1].levels;
      const temp = levels.splice(action.originalPosition - 1, 1);
      levels.splice(action.newPosition - 1, 0, temp[0]);
      updatePositions(levels);
      break;
    }
    case ADD_GROUP: {
      newState.push({
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
        id: state.newStageId,
        name: action.stageName,
        flex_category: groupName,
        levels: []
      });
      updatePositions(newState);
      break;
    }
    case ADD_LEVEL: {
      const levels = newState[action.stage - 1].levels;
      levels.push({
        ids: [NEW_LEVEL_ID],
        activeId: NEW_LEVEL_ID,
        expand: true
      });
      updatePositions(levels);
      break;
    }
    case ADD_VARIANT: {
      newState[action.stage - 1].levels[action.level - 1].ids.push(
        NEW_LEVEL_ID
      );
      break;
    }
    case REMOVE_VARIANT: {
      const levelIds = newState[action.stage - 1].levels[action.level - 1].ids;
      const i = levelIds.indexOf(action.levelId);
      levelIds.splice(i, 1);
      break;
    }
    case SET_ACTIVE_VARIANT: {
      newState[action.stage - 1].levels[action.level - 1].activeId = action.id;
      break;
    }
    case SET_FIELD: {
      const type = Object.keys(action.modifier)[0];
      newState[action.stage - 1].levels[action.level - 1][type] =
        action.modifier[type];
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
      }
      level.ids[action.variant] = action.value;
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
      const swappedGroupName =
        newState[action.direction === 'up' ? index - 1 : index].flex_category;
      start = categories.indexOf(swappedGroupName);
      count = categories.filter(c => c === swappedGroupName).length;
      newState.splice(
        action.direction === 'up' ? start : start + count,
        0,
        ...swap
      );
      updatePositions(newState);
      break;
    }
    case MOVE_STAGE: {
      const index = action.position - 1;
      const swap = action.direction === 'up' ? index - 1 : index + 1;
      const temp = newState[index];
      newState[index] = newState[swap];
      newState[swap] = temp;
      updatePositions(newState);
      break;
    }
    case SET_STAGE_LOCKABLE: {
      newState[action.stage - 1].lockable = action.lockable;
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

function levelKeyToIdMap(state = {}, action) {
  switch (action.type) {
    case INIT: {
      const levelKeyToIdMap = {};
      Object.keys(action.levelKeyList).forEach(levelId => {
        const levelKey = action.levelKeyList[levelId];
        levelKeyToIdMap[levelKey] = +levelId;
      });
      return levelKeyToIdMap;
    }
  }
  return state;
}

export default {
  stages,
  levelKeyList,
  levelKeyToIdMap
};
