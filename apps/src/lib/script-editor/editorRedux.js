import _ from 'lodash';

const INIT = 'scriptEditor/INIT';
const ADD_GROUP = 'scriptEditor/ADD_GROUP';
const ADD_LESSON = 'scriptEditor/ADD_LESSON';
const TOGGLE_EXPAND = 'scriptEditor/TOGGLE_EXPAND';
const REMOVE_LEVEL = 'scriptEditor/REMOVE_LEVEL';
const CHOOSE_LEVEL = 'scriptEditor/CHOOSE_LEVEL';
const ADD_VARIANT = 'scriptEditor/ADD_VARIANT';
const REMOVE_VARIANT = 'scriptEditor/REMOVE_VARIANT';
const SET_ACTIVE_VARIANT = 'scriptEditor/SET_ACTIVE_VARIANT';
const SET_FIELD = 'scriptEditor/SET_FIELD';
const REORDER_LEVEL = 'scriptEditor/REORDER_LEVEL';
const MOVE_LEVEL_TO_LESSON = 'scriptEditor/MOVE_LEVEL_TO_LESSON';
const ADD_LEVEL = 'scriptEditor/ADD_LEVEL';
const MOVE_GROUP = 'scriptEditor/MOVE_GROUP';
const MOVE_LESSON = 'scriptEditor/MOVE_LESSON';
const REMOVE_GROUP = 'scriptEditor/REMOVE_GROUP';
const REMOVE_LESSON = 'scriptEditor/REMOVE_LESSON';
const SET_LESSON_LOCKABLE = 'scriptEditor/SET_LESSON_LOCKABLE';
const SET_LESSON_GROUP = 'scriptEditor/SET_LESSON_GROUP';

export const init = (lessons, levelKeyList, lessonGroupMap) => ({
  type: INIT,
  lessons,
  levelKeyList,
  lessonGroupMap
});

export const addGroup = (lessonName, groupName) => ({
  type: ADD_GROUP,
  lessonName,
  groupName
});

export const addLesson = (position, lessonName) => ({
  type: ADD_LESSON,
  position,
  lessonName
});

export const toggleExpand = (lesson, level) => ({
  type: TOGGLE_EXPAND,
  lesson,
  level
});

export const removeLevel = (lesson, level) => ({
  type: REMOVE_LEVEL,
  lesson,
  level
});

export const chooseLevel = (lesson, level, variant, value) => ({
  type: CHOOSE_LEVEL,
  lesson,
  level,
  variant,
  value
});

export const addVariant = (lesson, level) => ({
  type: ADD_VARIANT,
  lesson,
  level
});

export const removeVariant = (lesson, level, levelId) => ({
  type: REMOVE_VARIANT,
  lesson,
  level,
  levelId
});

export const setActiveVariant = (lesson, level, id) => ({
  type: SET_ACTIVE_VARIANT,
  lesson,
  level,
  id
});

export const setField = (lesson, level, modifier) => ({
  type: SET_FIELD,
  lesson,
  level,
  modifier
});

export const reorderLevel = (lesson, originalPosition, newPosition) => ({
  type: REORDER_LEVEL,
  lesson,
  originalPosition,
  newPosition
});

export const moveLevelToLesson = (lesson, position, newLesson) => ({
  type: MOVE_LEVEL_TO_LESSON,
  lesson,
  position,
  newLesson
});

export const addLevel = lesson => ({
  type: ADD_LEVEL,
  lesson
});

export const moveGroup = (position, direction) => ({
  type: MOVE_GROUP,
  position,
  direction
});

export const moveLesson = (position, direction) => ({
  type: MOVE_LESSON,
  position,
  direction
});

export const removeGroup = position => ({
  type: REMOVE_GROUP,
  position
});

export const removeLesson = position => ({
  type: REMOVE_LESSON,
  position
});

export const setLessonLockable = (lesson, lockable) => ({
  type: SET_LESSON_LOCKABLE,
  lesson,
  lockable
});

export const setLessonGroup = (lesson, lessonGroup) => ({
  type: SET_LESSON_GROUP,
  lesson,
  lessonGroup
});

function updateLessonPositions(lessons) {
  let relativePosition = 1;
  for (let i = 0; i < lessons.length; i++) {
    lessons[i].position = i + 1;
    if (lessons[i].lockable) {
      lessons[i].relativePosition = undefined;
    } else {
      lessons[i].relativePosition = relativePosition;
      relativePosition++;
    }
  }
}

function updateLevelPositions(levels) {
  for (let i = 0; i < levels.length; i++) {
    levels[i].position = i + 1;
  }
}

export const NEW_LEVEL_ID = -1;

function lessons(state = [], action) {
  let newState = _.cloneDeep(state);

  switch (action.type) {
    case INIT:
      return action.lessons;
    case REORDER_LEVEL: {
      const levels = newState[action.lesson - 1].levels;
      const temp = levels.splice(action.originalPosition - 1, 1);
      levels.splice(action.newPosition - 1, 0, temp[0]);
      updateLevelPositions(levels);
      break;
    }
    case MOVE_LEVEL_TO_LESSON: {
      const levels = newState[action.lesson - 1].levels;
      const level = levels.splice(action.position - 1, 1)[0];
      updateLevelPositions(levels);
      const newLevels = newState[action.newLesson - 1].levels;
      newLevels.push(level);
      updateLevelPositions(newLevels);
      break;
    }
    case ADD_GROUP: {
      newState.push({
        lesson_group_display_name: Object.values(action.groupName)[0],
        name: action.lessonName,
        levels: []
      });
      updateLessonPositions(newState);
      break;
    }
    case ADD_LESSON: {
      const groupName = newState[action.position - 1].lesson_group;
      newState.splice(action.position, 0, {
        id: state.newLessonId,
        name: action.lessonName,
        lesson_group: groupName,
        levels: []
      });
      updateLessonPositions(newState);
      break;
    }
    case ADD_LEVEL: {
      const levels = newState[action.lesson - 1].levels;
      levels.push({
        ids: [NEW_LEVEL_ID],
        activeId: NEW_LEVEL_ID,
        expand: true
      });
      updateLevelPositions(levels);
      break;
    }
    case ADD_VARIANT: {
      newState[action.lesson - 1].levels[action.level - 1].ids.push(
        NEW_LEVEL_ID
      );
      break;
    }
    case REMOVE_VARIANT: {
      const levelIds = newState[action.lesson - 1].levels[action.level - 1].ids;
      const i = levelIds.indexOf(action.levelId);
      levelIds.splice(i, 1);
      break;
    }
    case SET_ACTIVE_VARIANT: {
      newState[action.lesson - 1].levels[action.level - 1].activeId = action.id;
      break;
    }
    case SET_FIELD: {
      const type = Object.keys(action.modifier)[0];
      newState[action.lesson - 1].levels[action.level - 1][type] =
        action.modifier[type];
      break;
    }
    case REMOVE_GROUP: {
      const groupName = newState[action.position - 1].lesson_group;
      newState = newState.filter(lesson => lesson.lesson_group !== groupName);
      updateLessonPositions(newState);
      break;
    }
    case REMOVE_LESSON: {
      newState.splice(action.position - 1, 1);
      updateLessonPositions(newState);
      break;
    }
    case REMOVE_LEVEL: {
      const levels = newState[action.lesson - 1].levels;
      levels.splice(action.level - 1, 1);
      updateLevelPositions(levels);
      break;
    }
    case CHOOSE_LEVEL: {
      const level = newState[action.lesson - 1].levels[action.level - 1];
      if (level.ids[action.variant] === level.activeId) {
        level.activeId = action.value;
      }
      level.ids[action.variant] = action.value;
      break;
    }
    case TOGGLE_EXPAND: {
      const level = newState[action.lesson - 1].levels[action.level - 1];
      level.expand = !level.expand;
      break;
    }
    case MOVE_GROUP: {
      if (action.direction !== 'up' && action.position === newState.length) {
        break;
      }
      const index = action.position - 1;
      const groupName = newState[index].lesson_group;
      let categories = newState.map(s => s.lesson_group);
      let start = categories.indexOf(groupName);
      let count = categories.filter(c => c === groupName).length;
      const swap = newState.splice(start, count);
      categories = newState.map(s => s.lesson_group);
      const swappedGroupName =
        newState[action.direction === 'up' ? index - 1 : index].lesson_group;
      start = categories.indexOf(swappedGroupName);
      count = categories.filter(c => c === swappedGroupName).length;
      newState.splice(
        action.direction === 'up' ? start : start + count,
        0,
        ...swap
      );
      updateLessonPositions(newState);
      break;
    }
    case MOVE_LESSON: {
      const index = action.position - 1;
      const swap = action.direction === 'up' ? index - 1 : index + 1;
      if (newState[index].lesson_group === newState[swap].lesson_group) {
        const temp = newState[index];
        newState[index] = newState[swap];
        newState[swap] = temp;
        updateLessonPositions(newState);
      } else {
        // Move the lesson into the adjacent group, without changing its
        // position relative to other lessons.
        newState[index].lesson_group = newState[swap].lesson_group;
      }
      break;
    }
    case SET_LESSON_LOCKABLE: {
      newState[action.lesson - 1].lockable = action.lockable;
      break;
    }
    case SET_LESSON_GROUP: {
      // Remove the lesson from the array and update its lesson group.
      const index = action.lesson - 1;
      const [curLesson] = newState.splice(index, 1);
      curLesson.lesson_group = action.lessonGroup;

      // Insert the lesson after the last lesson with the same lesson_group,
      // or at the end of the list if none matches.
      const categories = newState.map(lesson => lesson.lesson_group);
      const lastIndex = categories.lastIndexOf(action.lessonGroup);
      const targetIndex = lastIndex > 0 ? lastIndex + 1 : newState.length;
      newState.splice(targetIndex, 0, curLesson);

      updateLessonPositions(newState);

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

function lessonGroupMap(state = {}, action) {
  let newState = _.cloneDeep(state);

  switch (action.type) {
    case INIT:
      return action.lessonGroupMap;
    case ADD_GROUP: {
      _.merge(newState, action.groupName);
      break;
    }
  }
  return newState;
}

export default {
  lessons,
  levelKeyList,
  levelNameToIdMap,
  lessonGroupMap
};
