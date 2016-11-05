/* global levelKeyList */

import _ from 'lodash';

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
    case 'REORDER_LEVEL': {
      const levels = newState[action.stage - 1].levels;
      const temp = levels.splice(action.levelA - 1, 1);
      levels.splice(action.levelB - 1, 0, temp[0]);
      updatePositions(levels);
      break;
    }
    case 'ADD_GROUP': {
      newState.push({
        id: newStageId--,
        flex_category: prompt('Enter new group name'),
        name: prompt('Enter new stage name'),
        levels: []
      });
      updatePositions(newState);
      break;
    }
    case 'ADD_STAGE': {
      const groupName = newState[action.position - 1].flex_category;
      newState.splice(action.position, 0, {
        id: newStageId--,
        name: prompt('Enter new stage name'),
        flex_category: groupName,
        levels: []
      });
      updatePositions(newState);
      break;
    }
    case 'ADD_LEVEL': {
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
    case 'ADD_VARIANT': {
      newState[action.stage - 1].levels[action.level - 1].ids.push(newLevelId--);
      break;
    }
    case 'REMOVE_GROUP': {
      const groupName = newState[action.position - 1].flex_category;
      newState = newState.filter(stage => stage.flex_category !== groupName);
      updatePositions(newState);
      break;
    }
    case 'REMOVE_STAGE': {
      newState.splice(action.position - 1, 1);
      updatePositions(newState);
      break;
    }
    case 'REMOVE_LEVEL': {
      const levels = newState[action.stage - 1].levels;
      levels.splice(action.level - 1, 1);
      updatePositions(levels);
      break;
    }
    case 'CHOOSE_LEVEL': {
      const level = newState[action.stage - 1].levels[action.level - 1];
      if (level.ids[action.variant] === level.activeId) {
        level.activeId = action.value;
        level.key = levelKeyList[action.value];
      }
      level.ids[action.variant] = action.value;
      break;
    }
    case 'CHOOSE_LEVEL_TYPE': {
      newState[action.stage - 1].levels[action.level - 1].kind = action.value;
      break;
    }
    case 'TOGGLE_EXPAND': {
      const level = newState[action.stage - 1].levels[action.level - 1];
      level.expand = !level.expand;
      break;
    }
    case 'MOVE_GROUP': {
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
    case 'MOVE_STAGE': {
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
