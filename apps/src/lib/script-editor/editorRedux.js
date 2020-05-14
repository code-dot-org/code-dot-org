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

export const toggleExpand = (groupPosition, lessonPosition, levelPosition) => ({
  type: TOGGLE_EXPAND,
  groupPosition,
  lessonPosition,
  levelPosition
});

export const removeLevel = (lessonPosition, groupPosition, levelPosition) => ({
  type: REMOVE_LEVEL,
  lessonPosition,
  groupPosition,
  levelPosition
});

export const chooseLevel = (
  groupPosition,
  lessonPosition,
  levelPosition,
  variant,
  levelId
) => ({
  type: CHOOSE_LEVEL,
  groupPosition,
  lessonPosition,
  levelPosition,
  variant,
  levelId
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

export const reorderLevel = (
  groupPosition,
  lessonPosition,
  originalPosition,
  newPosition
) => ({
  type: REORDER_LEVEL,
  groupPosition,
  lessonPosition,
  originalPosition,
  newPosition
});

export const moveLevelToLesson = (
  groupPosition,
  lessonPosition,
  levelPosition,
  newLessonPosition
) => ({
  type: MOVE_LEVEL_TO_LESSON,
  groupPosition,
  lessonPosition,
  levelPosition,
  newLessonPosition
});

export const addLevel = (lessonPosition, lessonGroupPosition) => ({
  type: ADD_LEVEL,
  lessonPosition,
  lessonGroupPosition
});

export const moveGroup = (groupPosition, direction) => ({
  type: MOVE_GROUP,
  groupPosition,
  direction
});

export const moveLesson = (lessonPosition, groupPosition, direction) => ({
  type: MOVE_LESSON,
  lessonPosition,
  groupPosition,
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

function updateGroupPositions(lessonGorups) {
  for (let i = 0; i < lessonGorups.length; i++) {
    lessonGorups[i].position = i + 1;
  }
}

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
    case REORDER_LEVEL: {
      const lessons = newState[action.groupPosition - 1].lessons;
      const levels =
        lessons[action.lessonPosition - lessons[0].position].levels;
      const temp = levels.splice(action.originalPosition - 1, 1);
      levels.splice(action.newPosition - 1, 0, temp[0]);
      updateLevelPositions(levels);
      break;
    }
    case MOVE_LEVEL_TO_LESSON: {
      //remove level from old lesson
      const lessons = newState[action.groupPosition - 1].lessons;
      const levels =
        lessons[action.lessonPosition - lessons[0].position].levels;
      const level = levels.splice(action.levelPosition - 1, 1)[0];
      updateLevelPositions(levels);

      // add level to new lesson
      let newGroupPosition = null;
      newState.forEach(lessonGroup => {
        lessonGroup.lessons.forEach(lesson => {
          if (lesson.position === action.newLessonPosition) {
            newGroupPosition = lessonGroup.position;
          }
        });
      });
      const newLessons = newState[newGroupPosition - 1].lessons;
      const newLevels =
        newLessons[action.newLessonPosition - newLessons[0].position].levels;
      newLevels.push(level);
      updateLevelPositions(newLevels);
      break;
    }
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
    case CHOOSE_LEVEL: {
      const lessons = newState[action.groupPosition - 1].lessons;
      const level =
        lessons[action.lessonPosition - lessons[0].position].levels[
          action.levelPosition - 1
        ];
      if (level.ids[action.variant] === level.activeId) {
        level.activeId = action.levelId;
      }
      level.ids[action.variant] = action.levelId;
      break;
    }
    case TOGGLE_EXPAND: {
      const lessons = newState[action.groupPosition - 1].lessons;
      const level =
        lessons[action.lessonPosition - lessons[0].position].levels[
          action.levelPosition - 1
        ];
      level.expand = !level.expand;
      break;
    }
    case MOVE_GROUP: {
      if (
        action.direction !== 'up' &&
        action.groupPosition === newState.length
      ) {
        break;
      }
      const index = action.groupPosition - 1;
      const swap = action.direction === 'up' ? index - 1 : index + 1;
      const tempGroup = newState[index];
      newState[index] = newState[swap];
      newState[swap] = tempGroup;
      updateGroupPositions(newState);
      updateLessonPositions(newState);
      break;
    }
    case MOVE_LESSON: {
      const groupIndex = action.groupPosition - 1;

      const lessons = newState[groupIndex].lessons;

      const lessonIndex = action.lessonPosition - lessons[0].position;
      const lessonSwapIndex =
        action.direction === 'up' ? lessonIndex - 1 : lessonIndex + 1;

      if (lessonSwapIndex >= 0 && lessonSwapIndex <= lessons.length - 1) {
        //if lesson is staying in the same lesson group
        const tempLesson = lessons[lessonIndex];
        lessons[lessonIndex] = lessons[lessonSwapIndex];
        lessons[lessonSwapIndex] = tempLesson;
      } else {
        // add to new lesson group
        const groupSwapIndex =
          action.direction === 'up' ? groupIndex - 1 : groupIndex + 1;

        // Remove the lesson
        const oldLessons = newState[groupIndex].lessons;
        const curLesson = oldLessons.splice(lessonIndex, 1)[0];

        // add lesson
        const newLessons = newState[groupSwapIndex].lessons;
        action.direction === 'up'
          ? newLessons.push(curLesson)
          : newLessons.unshift(curLesson);
      }
      updateLessonPositions(newState);
      break;
    }
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
