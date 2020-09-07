import _ from 'lodash';

const INIT = 'scriptEditor/INIT';
const ADD_GROUP = 'scriptEditor/ADD_GROUP';
const ADD_LESSON = 'scriptEditor/ADD_LESSON';
const MOVE_GROUP = 'scriptEditor/MOVE_GROUP';
const MOVE_LESSON = 'scriptEditor/MOVE_LESSON';
const REMOVE_GROUP = 'scriptEditor/REMOVE_GROUP';
const REMOVE_LESSON = 'scriptEditor/REMOVE_LESSON';
const SET_LESSON_LOCKABLE = 'scriptEditor/SET_LESSON_LOCKABLE';
const SET_LESSON_GROUP = 'scriptEditor/SET_LESSON_GROUP';
const CONVERT_GROUP = 'scriptEditor/CONVERT_GROUP';

// NOTE: Position for Lesson Groups, Lessons and Levels is 1 based.

export const init = lessonGroups => ({
  type: INIT,
  lessonGroups
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

export const NEW_LEVEL_ID = -1;

function lessonGroups(state = [], action) {
  let newState = _.cloneDeep(state);

  switch (action.type) {
    case INIT:
      return action.lessonGroups;
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

export default {
  lessonGroups
};
