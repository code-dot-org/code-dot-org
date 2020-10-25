import _ from 'lodash';
import PropTypes from 'prop-types';
import {lessonGroupShape} from '@cdo/apps/lib/levelbuilder/shapes';

const INIT = 'scriptEditor/INIT';
const ADD_GROUP = 'scriptEditor/ADD_GROUP';
const ADD_LESSON = 'scriptEditor/ADD_LESSON';
const MOVE_GROUP = 'scriptEditor/MOVE_GROUP';
const MOVE_LESSON = 'scriptEditor/MOVE_LESSON';
const REMOVE_GROUP = 'scriptEditor/REMOVE_GROUP';
const REMOVE_LESSON = 'scriptEditor/REMOVE_LESSON';
const SET_LESSON_GROUP = 'scriptEditor/SET_LESSON_GROUP';
const CONVERT_GROUP_USER_FACING = 'scriptEditor/CONVERT_GROUP_USER_FACING';
const CONVERT_GROUP_NON_USER_FACING =
  'scriptEditor/CONVERT_GROUP_NON_USER_FACING';
const REORDER_LESSON = 'scriptEditor/REORDER_LESSON';
const UPDATE_LESSON_GROUP_FIELD = 'scriptEditor/UPDATE_LESSON_GROUP_FIELD';

// NOTE: Position for Lesson Groups and Lessons is 1 based.

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

export const addLesson = (groupPosition, lessonKey, lessonName) => ({
  type: ADD_LESSON,
  groupPosition,
  lessonKey,
  lessonName
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
  type: CONVERT_GROUP_USER_FACING,
  groupPosition,
  key,
  displayName
});

export const convertGroupToNonUserFacing = groupPosition => ({
  type: CONVERT_GROUP_NON_USER_FACING,
  groupPosition
});

export const reorderLesson = (
  groupPosition,
  originalLessonPosition,
  newLessonPosition
) => ({
  type: REORDER_LESSON,
  groupPosition,
  originalLessonPosition,
  newLessonPosition
});

export const updateLessonGroupField = (
  lessonGroupPosition,
  fieldName,
  fieldValue
) => ({
  type: UPDATE_LESSON_GROUP_FIELD,
  lessonGroupPosition,
  fieldName,
  fieldValue
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

function lessonGroups(state = [], action) {
  let newState = _.cloneDeep(state);

  switch (action.type) {
    case INIT:
      validateLessonGroups(action.lessonGroups, action.type);
      return action.lessonGroups;
    case ADD_GROUP: {
      newState.push({
        key: action.groupKey,
        displayName: action.groupName,
        userFacing: true,
        position: action.groupPosition,
        bigQuestions: '',
        description: '',
        lessons: []
      });
      updateGroupPositions(newState);
      break;
    }
    case ADD_LESSON: {
      const lessons = newState[action.groupPosition - 1].lessons;
      lessons.push({
        key: action.lessonKey,
        name: action.lessonName,
        levels: []
      });
      updateLessonPositions(newState);
      break;
    }
    case REMOVE_GROUP: {
      newState.splice(action.groupPosition - 1, 1);
      if (newState.length === 0) {
        newState.push(emptyNonUserFacingGroup);
      }
      updateLessonPositions(newState);
      break;
    }
    case REMOVE_LESSON: {
      const lessons = newState[action.groupPosition - 1].lessons;
      lessons.splice(action.lessonPosition - lessons[0].position, 1);
      updateLessonPositions(newState);
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
    case CONVERT_GROUP_USER_FACING: {
      newState[action.groupPosition - 1].key = action.key;
      newState[action.groupPosition - 1].displayName = action.displayName;
      newState[action.groupPosition - 1].userFacing = true;
      break;
    }
    case CONVERT_GROUP_NON_USER_FACING: {
      newState[action.groupPosition - 1].displayName = null;
      newState[action.groupPosition - 1].bigQuestions = '';
      newState[action.groupPosition - 1].description = '';
      newState[action.groupPosition - 1].userFacing = false;
      break;
    }
    case REORDER_LESSON: {
      const lessons = newState[action.groupPosition - 1].lessons;
      const temp = lessons.splice(action.originalLessonPosition - 1, 1);
      lessons.splice(action.newLessonPosition - 1, 0, temp[0]);
      updateLessonPositions(newState);
      break;
    }
    case UPDATE_LESSON_GROUP_FIELD: {
      const lessonGroup = newState[action.lessonGroupPosition - 1];
      lessonGroup[action.fieldName] = action.fieldValue;
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

export default {
  levelKeyList,
  lessonGroups
};

// Use PropTypes.checkPropTypes to enforce that each entry in the array of
// lessonGroups matches the shape defined in lessonGroupShape.
function validateLessonGroups(lessonGroups, location) {
  const propTypes = {activities: PropTypes.arrayOf(lessonGroupShape)};
  PropTypes.checkPropTypes(propTypes, {lessonGroups}, 'property', location);
}

export const emptyNonUserFacingGroup = {
  key: `non-user-facing-lg`,
  displayName: null,
  userFacing: false,
  position: 1,
  bigQuestions: '',
  description: '',
  lessons: []
};
