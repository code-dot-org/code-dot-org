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

export const init = (lessonGroups, levelKeyList) => ({
  type: INIT,
  lessonGroups,
  levelKeyList
});

export const addGroup = (position, groupKey, groupName) => ({
  type: ADD_GROUP,
  position,
  groupKey,
  groupName
});

export const addLesson = (lessonName, lessonGroupPosition) => ({
  type: ADD_LESSON,
  lessonName,
  lessonGroupPosition
});

export const toggleExpand = (lesson, level) => ({
  type: TOGGLE_EXPAND,
  lesson,
  level
});

export const removeLevel = (lessonPosition, groupPosition, levelPosition) => ({
  type: REMOVE_LEVEL,
  lessonPosition,
  groupPosition,
  levelPosition
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

export const addLevel = (lessonPosition, lessonGroupPosition) => ({
  type: ADD_LEVEL,
  lessonPosition,
  lessonGroupPosition
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

export const removeGroup = groupPosition => ({
  type: REMOVE_GROUP,
  groupPosition
});

export const removeLesson = (lessonPosition, groupPosition) => ({
  type: REMOVE_LESSON,
  lessonPosition,
  groupPosition
});

export const setLessonLockable = (groupPosition, lessonPosition, lockable) => ({
  type: SET_LESSON_LOCKABLE,
  groupPosition,
  lessonPosition,
  lockable
});

export const setLessonGroup = (
  lessonPosition,
  oldLessonGroupPosition,
  newLessonGroupPosition
) => ({
  type: SET_LESSON_GROUP,
  lessonPosition,
  oldLessonGroupPosition,
  newLessonGroupPosition
});

function updateLessonPositions(lessonsGroups) {
  let relativePosition = 1;
  let absolutePosition = 1;
  lessonsGroups.forEach(lessonGroup => {
    lessonGroup.lessons.forEach(lesson => {
      lesson.position = absolutePosition;
      if (lesson.lockable) {
        lesson.relativePosition = undefined;
      } else {
        lesson.relativePosition = relativePosition;
        relativePosition++;
      }
      absolutePosition++;
    });
  });
}

function updateLevelPositions(levels) {
  for (let i = 0; i < levels.length; i++) {
    levels[i].position = i + 1;
  }
}

export const NEW_LEVEL_ID = -1;

function lessonGroups(state = [], action) {
  let newState = _.cloneDeep(state);

  switch (action.type) {
    case INIT:
      return action.lessonGroups;
    /*
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
    }*/
    case ADD_GROUP: {
      newState.push({
        key: action.groupKey,
        display_name: action.groupName,
        user_facing: false,
        position: action.position,
        lessons: []
      });
      break;
    }
    case ADD_LESSON: {
      const lessons = newState[action.lessonGroupPosition].lessons;
      lessons.push({
        id: state.newLessonId,
        name: action.lessonName,
        levels: []
      });
      updateLessonPositions(newState);
      break;
    }

    case ADD_LEVEL: {
      const lessons = newState[action.lessonGroupPosition - 1].lessons;
      const levels =
        lessons[action.lessonPosition - lessons[0].position].levels;
      levels.push({
        ids: [NEW_LEVEL_ID],
        activeId: NEW_LEVEL_ID,
        expand: true
      });
      updateLevelPositions(levels);
      break;
    }
    /*
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
    */
    case REMOVE_GROUP: {
      newState.splice(action.groupPosition - 1, 1);
      updateLessonPositions(newState);
      break;
    }
    case REMOVE_LESSON: {
      const lessons = newState[action.groupPosition - 1].lessons;
      lessons.splice(action.lessonPosition - lessons[0].position, 1);
      updateLessonPositions(newState);
      break;
    }
    case REMOVE_LEVEL: {
      const lessons = newState[action.groupPosition - 1].lessons;
      const levels =
        lessons[action.lessonPosition - lessons[0].position].levels;
      levels.splice(action.levelPosition - 1, 1);
      updateLevelPositions(levels);
      break;
    }
    /*
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
    */
    case SET_LESSON_LOCKABLE: {
      const lessons = newState[action.groupPosition - 1].lessons;
      lessons[action.lessonPosition - lessons[0].position].lockable =
        action.lockable;

      updateLessonPositions(newState);
      break;
    }
    case SET_LESSON_GROUP: {
      // Remove the lesson
      const oldLessons = newState[action.oldLessonGroupPosition - 1].lessons;
      const curLesson = oldLessons.splice(
        action.lessonPosition - oldLessons[0].position,
        1
      )[0];

      // add lesson
      const newLessons = newState[action.newLessonGroupPosition - 1].lessons;
      newLessons.push(curLesson);
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

export default {
  lessonGroups,
  levelKeyList,
  levelNameToIdMap
};
