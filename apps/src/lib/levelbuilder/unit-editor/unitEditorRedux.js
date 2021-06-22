import _ from 'lodash';
import PropTypes from 'prop-types';
import {lessonGroupShape} from '@cdo/apps/lib/levelbuilder/shapes';

const INIT = 'unitEditor/INIT';
const ADD_GROUP = 'unitEditor/ADD_GROUP';
const ADD_LESSON = 'unitEditor/ADD_LESSON';
const MOVE_GROUP = 'unitEditor/MOVE_GROUP';
const REMOVE_GROUP = 'unitEditor/REMOVE_GROUP';
const REMOVE_LESSON = 'unitEditor/REMOVE_LESSON';
const SET_LESSON_GROUP = 'unitEditor/SET_LESSON_GROUP';
const CONVERT_GROUP_USER_FACING = 'unitEditor/CONVERT_GROUP_USER_FACING';
const CONVERT_GROUP_NON_USER_FACING =
  'unitEditor/CONVERT_GROUP_NON_USER_FACING';
const REORDER_LESSON = 'unitEditor/REORDER_LESSON';
const UPDATE_LESSON_GROUP_FIELD = 'unitEditor/UPDATE_LESSON_GROUP_FIELD';

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
  lessonGroups.forEach(lessonGroup => {
    lessonGroup.lessons.forEach((lesson, lessonIndex) => {
      lesson.position = lessonIndex + 1;
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
        hasLessonPlan: true,
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
      updateGroupPositions(newState);
      updateLessonPositions(newState);
      break;
    }
    case REMOVE_LESSON: {
      const lessons = newState[action.groupPosition - 1].lessons;
      lessons.splice(action.lessonPosition - 1, 1);
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
    case SET_LESSON_GROUP: {
      // Remove the lesson from the old lesson group
      const oldLessons = newState[action.oldGroupPosition - 1].lessons;
      const curLesson = oldLessons.splice(action.lessonPosition - 1, 1)[0];

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

export const mapLessonGroupDataForEditor = rawLessonGroups => {
  let lessonGroups = (rawLessonGroups || [])
    .filter(lesson_group => lesson_group.id)
    .map(lesson_group => ({
      key: lesson_group.key,
      displayName: lesson_group.display_name,
      userFacing: lesson_group.user_facing,
      position: lesson_group.position,
      description: lesson_group.description || '',
      bigQuestions: lesson_group.big_questions || '',
      lessons: lesson_group.lessons
        .filter(lesson => lesson.id)
        .map((lesson, lessonIndex) => ({
          id: lesson.id,
          key: lesson.key,
          position: lessonIndex + 1,
          lockable: lesson.lockable,
          assessment: lesson.assessment,
          unplugged: lesson.unplugged,
          hasLessonPlan: lesson.hasLessonPlan,
          lessonEditPath: lesson.lessonEditPath,
          name: lesson.name,
          /*
           * NOTE: The Script Edit GUI no longer includes the editing of levels
           * as those have been moved out to the lesson edit page. We include
           * level information here behind the scenes because it allows us to
           * continue to use ScriptDSl for the time being until we are ready
           * to move on to our future system.
           */
          // Only include the first level of an assessment (uid ending with "_0").
          levels: lesson.levels
            .filter(level => !level.uid || /_0$/.test(level.uid))
            .map(level => ({
              position: level.position,
              activeId: level.activeId,
              ids: level.ids.slice(),
              kind: level.kind,
              skin: level.skin,
              videoKey: level.videoKey,
              concepts: level.concepts,
              conceptDifficulty: level.conceptDifficulty,
              progression: level.progression,
              named: !!level.name,
              bonus: level.bonus,
              assessment: level.assessment,
              challenge: level.challenge
            }))
        }))
    }));
  if (lessonGroups.length === 0) {
    lessonGroups = [emptyNonUserFacingGroup];
  }

  return lessonGroups;
};

// Replace ' with \'
const escape = str => str.replace(/'/g, "\\'");

export const getSerializedLessonGroups = (rawLessonGroups, levelKeyList) => {
  const lessonGroups = _.cloneDeep(rawLessonGroups);
  let s = [];
  lessonGroups.forEach(lessonGroup => {
    if (lessonGroup.userFacing && lessonGroup.lessons.length > 0) {
      let t = `lesson_group '${lessonGroup.key}'`;
      if (lessonGroup.displayName) {
        t += `, display_name: '${escape(lessonGroup.displayName)}'`;
      }
      s.push(t);
      if (lessonGroup.description) {
        s.push(`lesson_group_description '${escape(lessonGroup.description)}'`);
      }
      if (lessonGroup.bigQuestions) {
        s.push(
          `lesson_group_big_questions '${escape(lessonGroup.bigQuestions)}'`
        );
      }
    }
    if (lessonGroup.lessons) {
      lessonGroup.lessons.forEach(lesson => {
        s = s.concat(serializeLesson(lesson, levelKeyList));
      });
    }
  });

  s.push('');
  return s.join('\n');
};

/**
 * Generate the ScriptDSL format.
 * @param lesson
 * @return {string}
 */
const serializeLesson = (lesson, levelKeyList) => {
  let s = [];
  let t = `lesson '${escape(lesson.key)}'`;
  if (lesson.name) {
    t += `, display_name: '${escape(lesson.name)}'`;
  }
  if (lesson.lockable) {
    t += ', lockable: true';
  }
  t += `, has_lesson_plan: ${lesson.hasLessonPlan}`;
  if (lesson.visible_after) {
    t += ', visible_after: true';
  }
  if (lesson.unplugged) {
    t += ', unplugged: true';
  }
  s.push(t);
  if (lesson.levels) {
    lesson.levels.forEach(level => {
      s = s.concat(serializeLevel(levelKeyList, level.ids[0], level));
    });
  }
  s.push('');
  return s.join('\n');
};

/**
 * Generate the ScriptDSL format.
 * NOTE: The Script Edit GUI no long includes the editing of levels
 * as those have been moved out to the lesson edit page. We include
 * level information here behind the scenes because it allows us to
 * continue to use ScriptDSl for the time being until we are ready
 * to move on to our future system.
 * @param id
 * @param level
 * @return {string}
 */
const serializeLevel = (levelKeyList, id, level) => {
  const s = [];
  const key = levelKeyList[id];
  if (/^blockly:/.test(key)) {
    if (level.skin) {
      s.push(`skin '${escape(level.skin)}'`);
    }
    if (level.videoKey) {
      s.push(`video_key_for_next_level '${escape(level.videoKey)}'`);
    }
    if (level.concepts) {
      // concepts is a comma-separated list of single-quoted strings, so do
      // not escape its single quotes.
      s.push(`concepts ${level.concepts}`);
    }
    if (level.conceptDifficulty) {
      s.push(`level_concept_difficulty '${escape(level.conceptDifficulty)}'`);
    }
  }
  let l = level.bonus ? `bonus '${escape(key)}'` : `level '${escape(key)}'`;
  if (level.progression) {
    l += `, progression: '${escape(level.progression)}'`;
  }
  if (level.named) {
    l += `, named: true`;
  }
  if (level.assessment) {
    l += `, assessment: true`;
  }
  if (level.challenge) {
    l += `, challenge: true`;
  }
  s.push(l);
  return s;
};
