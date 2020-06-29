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
const CONVERT_GROUP = 'scriptEditor/CONVERT_GROUP';

// NOTE: Position for Lesson Groups, Lessons and Levels is 1 based.

export const init = (lessonGroups, levelKeyList) => ({
  type: INIT,
  lessonGroups,
  levelKeyList
});

export const addGroup = (groupPosition, groupKey, groupName) => ({
  type: ADD_GROUP,
  groupPosition,
  groupKey,
  groupName
});

export const addLesson = (groupPosition, lessonName) => ({
  type: ADD_LESSON,
  groupPosition,
  lessonName
});

export const toggleExpand = (groupPosition, lessonPosition, levelPosition) => ({
  type: TOGGLE_EXPAND,
  groupPosition,
  lessonPosition,
  levelPosition
});

export const removeLevel = (groupPosition, lessonPosition, levelPosition) => ({
  type: REMOVE_LEVEL,
  groupPosition,
  lessonPosition,
  levelPosition
});

export const chooseLevel = (
  groupPosition,
  lessonPosition,
  levelPosition,
  variant,
  value
) => ({
  type: CHOOSE_LEVEL,
  groupPosition,
  lessonPosition,
  levelPosition,
  variant,
  value
});

export const addVariant = (groupPosition, lessonPosition, levelPosition) => ({
  type: ADD_VARIANT,
  groupPosition,
  lessonPosition,
  levelPosition
});

export const removeVariant = (
  groupPosition,
  lessonPosition,
  levelPosition,
  levelId
) => ({
  type: REMOVE_VARIANT,
  groupPosition,
  lessonPosition,
  levelPosition,
  levelId
});

export const setActiveVariant = (
  groupPosition,
  lessonPosition,
  levelPosition,
  id
) => ({
  type: SET_ACTIVE_VARIANT,
  groupPosition,
  lessonPosition,
  levelPosition,
  id
});

export const setField = (
  groupPosition,
  lessonPosition,
  levelPosition,
  modifier
) => ({
  type: SET_FIELD,
  groupPosition,
  lessonPosition,
  levelPosition,
  modifier
});

export const reorderLevel = (
  groupPosition,
  lessonPosition,
  originalLevelPosition,
  newLevelPosition
) => ({
  type: REORDER_LEVEL,
  groupPosition,
  lessonPosition,
  originalLevelPosition,
  newLevelPosition
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

export const addLevel = (groupPosition, lessonPosition) => ({
  type: ADD_LEVEL,
  groupPosition,
  lessonPosition
});

export const moveGroup = (groupPosition, direction) => ({
  type: MOVE_GROUP,
  groupPosition,
  direction
});

export const moveLesson = (groupPosition, lessonPosition, direction) => ({
  type: MOVE_LESSON,
  groupPosition,
  lessonPosition,
  direction
});

export const removeGroup = groupPosition => ({
  type: REMOVE_GROUP,
  groupPosition
});

export const removeLesson = (groupPosition, lessonPosition) => ({
  type: REMOVE_LESSON,
  groupPosition,
  lessonPosition
});

export const setLessonLockable = (groupPosition, lessonPosition, lockable) => ({
  type: SET_LESSON_LOCKABLE,
  groupPosition,
  lessonPosition,
  lockable
});

export const setLessonGroup = (
  lessonPosition,
  oldGroupPosition,
  newGroupPosition
) => ({
  type: SET_LESSON_GROUP,
  lessonPosition,
  oldGroupPosition,
  newGroupPosition
});

export const convertGroupToUserFacing = (groupPosition, key, displayName) => ({
  type: CONVERT_GROUP,
  groupPosition,
  key,
  displayName
});

function updateGroupPositions(lessonGroups) {
  for (let i = 0; i < lessonGroups.length; i++) {
    lessonGroups[i].position = i + 1;
  }
}

function updateLessonPositions(lessonGroups) {
  let relativePosition = 1;
  let absolutePosition = 1;
  lessonGroups.forEach(lessonGroup => {
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
      const temp = levels.splice(action.originalLevelPosition - 1, 1);
      levels.splice(action.newLevelPosition - 1, 0, temp[0]);
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
        position: action.groupPosition,
        lessons: []
      });
      updateGroupPositions(newState);
      break;
    }
    case ADD_LESSON: {
      const lessons = newState[action.groupPosition - 1].lessons;
      lessons.push({
        name: action.lessonName,
        levels: []
      });
      updateLessonPositions(newState);
      break;
    }

    case ADD_LEVEL: {
      const lessons = newState[action.groupPosition - 1].lessons;
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
    case ADD_VARIANT: {
      const lessons = newState[action.groupPosition - 1].lessons;
      lessons[action.lessonPosition - lessons[0].position].levels[
        action.levelPosition - 1
      ].ids.push(NEW_LEVEL_ID);
      break;
    }
    case REMOVE_VARIANT: {
      const lessons = newState[action.groupPosition - 1].lessons;
      const levelIds =
        lessons[action.lessonPosition - lessons[0].position].levels[
          action.levelPosition - 1
        ].ids;
      const i = levelIds.indexOf(action.levelId);
      levelIds.splice(i, 1);
      break;
    }
    case SET_ACTIVE_VARIANT: {
      const lessons = newState[action.groupPosition - 1].lessons;
      lessons[action.lessonPosition - lessons[0].position].levels[
        action.levelPosition - 1
      ].activeId = action.id;
      break;
    }
    case SET_FIELD: {
      const type = Object.keys(action.modifier)[0];
      const lessons = newState[action.groupPosition - 1].lessons;
      lessons[action.lessonPosition - lessons[0].position].levels[
        action.levelPosition - 1
      ][type] = action.modifier[type];
      break;
    }
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
        level.activeId = action.value;
      }
      level.ids[action.variant] = action.value;
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
        const groupSwapIndex =
          action.direction === 'up' ? groupIndex - 1 : groupIndex + 1;

        // Remove the lesson from the old lesson group
        const oldLessons = newState[groupIndex].lessons;
        const curLesson = oldLessons.splice(lessonIndex, 1)[0];

        // add lesson to the new lesson group
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
      // Remove the lesson from the old lesson group
      const oldLessons = newState[action.oldGroupPosition - 1].lessons;
      const curLesson = oldLessons.splice(
        action.lessonPosition - oldLessons[0].position,
        1
      )[0];

      // add lesson to the new lesson group
      const newLessons = newState[action.newGroupPosition - 1].lessons;
      newLessons.push(curLesson);
      updateLessonPositions(newState);

      break;
    }
    case CONVERT_GROUP: {
      newState[action.groupPosition - 1].key = action.key;
      newState[action.groupPosition - 1].display_name = action.displayName;
      newState[action.groupPosition - 1].user_facing = true;
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
