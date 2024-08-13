import {snakeCase, isNumber} from 'lodash';

import {navigateToHref} from '@cdo/apps/utils';

export const RUBRIC_PATH = '/rubrics';
export const SAVING_TEXT = 'Saving...';
export const SAVE_COMPLETED_TEXT = 'Save complete!';

export async function saveRubricToTable(
  setSaveNotificationText,
  rubric,
  learningGoalList,
  setLearningGoalList,
  selectedLevelForAssessment,
  lessonId
) {
  setSaveNotificationText(SAVING_TEXT);
  const dataUrl = !!rubric ? `/rubrics/${rubric.id}` : RUBRIC_PATH;
  const method = !!rubric ? 'PATCH' : 'POST';

  // Checking that the csrf-token exists since it is disabled on test
  const csrfToken = document.querySelector('meta[name="csrf-token"]')
    ? document.querySelector('meta[name="csrf-token"]').attributes['content']
        .value
    : null;
  const learningGoalListAsData = resetPositionsOfLearningGoals(
    removeNewIds(transformKeys(learningGoalList))
  );

  const rubric_data = {
    levelId: selectedLevelForAssessment,
    lessonId: lessonId,
    learningGoalsAttributes: learningGoalListAsData,
  };

  try {
    let response = await fetch(dataUrl, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify(rubric_data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      const msg = `Error saving rubric: ${JSON.stringify(errorData, null, 2)}`;
      console.error(msg);
      setSaveNotificationText(msg);
      return;
    }

    let data = await response.json();
    if (!rubric) {
      navigateToHref(data.redirectUrl);
    } else {
      setLearningGoalList(data.learningGoals);
      setSaveNotificationText(SAVE_COMPLETED_TEXT);
      clearNotification(setSaveNotificationText);
    }
  } catch (err) {
    console.error('Error saving rubric:' + err);
  }
}

/**
 * Transforms the keys of an object from camelCase to snake_case.
 * Intended to transform the keys of objects in an array of an object.
 * from camelCase to snake_case. This is recursive so that both the
 * keys in learningGoalList and the keys in learningGoalEvidenceLevelsAttributes
 * (which is nested in learningGoalList) get transformed to snake_case.
 * @param {object} obj - The object with keys in camelCase format.
 * @returns {object} - The object with keys in snake_case format.
 */
function transformObjectKeys(obj) {
  const newObj = {};

  for (const [key, value] of Object.entries(obj)) {
    if (Array.isArray(value)) {
      newObj[snakeCase(key)] = value.map(item => transformObjectKeys(item));
    } else {
      if (key === '_destroy') {
        newObj[key] = value;
      } else {
        newObj[snakeCase(key)] = value;
      }
    }
  }

  return newObj;
}

/**
 * Transforms the keys of objects inside an array from camelCase to snake_case.
 * Designed specifically for an array of objects with keys in camelCase.
 * @param {array} startingList - The list containing objects with camelCase keys.
 * @returns {array} - The list containing objects with snake_case keys.
 */
function transformKeys(startingList) {
  return startingList.map(item => transformObjectKeys(item));
}

/**
 * Removes the Ids from the newly added LearningGoals.
 * Context: We use ids of LearningGoals in the front end to connect data.
 * However, when a new LearningGoal is added in the front end, we want to
 * have an id to modify the components, but then delete that id before saving
 * the new LearningGoals to the back end so that new ids can be assigned by Rails.
 */
function removeNewIds(keyConceptList) {
  keyConceptList.forEach(keyConceptList => {
    if (!isNumber(keyConceptList.id)) {
      delete keyConceptList.id;
    }
  });
  return keyConceptList;
}

function resetPositionsOfLearningGoals(keyConceptList) {
  let position = 1;
  keyConceptList.forEach(keyConcept => {
    if (keyConcept._destroy) {
      keyConcept.position = -1;
    } else {
      keyConcept.position = position;
      position++;
    }
  });
  return keyConceptList;
}

function clearNotification(setSaveNotificationText) {
  setTimeout(() => {
    setSaveNotificationText('');
  }, 8500);
}

export const styles = {
  containerStyle: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  bottomRow: {
    display: 'flex',
    justifyContent: 'end',
  },
};
