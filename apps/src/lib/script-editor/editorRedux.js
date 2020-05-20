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
const SET_FLEX_CATEGORY = 'scriptEditor/SET_FLEX_CATEGORY';

export const init = (lessons, levelKeyList, flexCategoryMap) => ({
  type: INIT,
  lessons,
  levelKeyList,
  flexCategoryMap
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

export const setFlexCategory = (lesson, flexCategory) => ({
  type: SET_FLEX_CATEGORY,
  lesson,
  flexCategory
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
        flex_category: action.groupName,
        name: action.lessonName,
        levels: []
      });
      updateLessonPositions(newState);
      break;
    }
    case ADD_LESSON: {
      const groupName = newState[action.position - 1].flex_category;
      newState.splice(action.position, 0, {
        id: state.newLessonId,
        name: action.lessonName,
        flex_category: groupName,
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
      const groupName = newState[action.position - 1].flex_category;
      newState = newState.filter(lesson => lesson.flex_category !== groupName);
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
      updateLessonPositions(newState);
      break;
    }
    case MOVE_LESSON: {
      const index = action.position - 1;
      const swap = action.direction === 'up' ? index - 1 : index + 1;
      if (newState[index].flex_category === newState[swap].flex_category) {
        const temp = newState[index];
        newState[index] = newState[swap];
        newState[swap] = temp;
        updateLessonPositions(newState);
      } else {
        // Move the lesson into the adjacent group, without changing its
        // position relative to other lessons.
        newState[index].flex_category = newState[swap].flex_category;
      }
      break;
    }
    case SET_LESSON_LOCKABLE: {
      newState[action.lesson - 1].lockable = action.lockable;
      break;
    }
    case SET_FLEX_CATEGORY: {
      // Remove the lesson from the array and update its flex category.
      const index = action.lesson - 1;
      const [curLesson] = newState.splice(index, 1);
      curLesson.flex_category = action.flexCategory;

      // Insert the lesson after the last lesson with the same flex_category,
      // or at the end of the list if none matches.
      const categories = newState.map(lesson => lesson.flex_category);
      const lastIndex = categories.lastIndexOf(action.flexCategory);
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

function flexCategoryMap(state = {}, action) {
  switch (action.type) {
    case INIT:
      return action.flexCategoryMap;
  }
  return state;
}

export default {
  lessons,
  levelKeyList,
  levelNameToIdMap,
  flexCategoryMap
};
