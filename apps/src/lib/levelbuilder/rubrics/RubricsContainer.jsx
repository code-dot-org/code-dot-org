import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {BodyTwoText, Heading1} from '@cdo/apps/componentLibrary/typography';
import Button from '@cdo/apps/templates/Button';
import {navigateToHref} from '@cdo/apps/utils';
import RubricEditor from './RubricEditor';
import {snakeCase, isNumber} from 'lodash';

const RUBRIC_PATH = '/rubrics';

export default function RubricsContainer({
  unitName,
  lessonNumber,
  levels,
  rubric,
  lessonId,
}) {
  const [learningGoalList, setLearningGoalList] = useState(
    !!rubric
      ? rubric.learningGoals
      : [
          {
            key: 'ui-1',
            id: 'ui-1',
            learningGoal: '',
            aiEnabled: false,
            position: 1,
            learningGoalEvidenceLevelsAttributes: [
              {
                teacherDescription: '',
                understanding: 0,
                aiPrompt: '',
              },
              {
                teacherDescription: '',
                understanding: 1,
                aiPrompt: '',
              },
              {
                teacherDescription: '',
                understanding: 2,
                aiPrompt: '',
              },
              {
                teacherDescription: '',
                understanding: 3,
                aiPrompt: '',
              },
            ],
          },
        ]
  );

  const generateLearningGoalKey = () => {
    let learningGoalNumber = learningGoalList.length + 1;
    while (
      learningGoalList.some(
        learningGoal =>
          learningGoal.key === `learningGoal-${learningGoalNumber}`
      )
    ) {
      learningGoalNumber++;
    }

    return `ui-${learningGoalNumber}`;
  };

  const emptyKeyConcept = () => {
    const newKey = generateLearningGoalKey();
    const newId = newKey;
    const nextPosition =
      Math.max(...learningGoalList.map(obj => obj.position)) + 1;

    return {
      key: newKey,
      id: newId,
      learningGoal: '',
      aiEnabled: false,
      position: nextPosition,
      learningGoalEvidenceLevelsAttributes: [
        {
          teacherDescription: '',
          understanding: 0,
          aiPrompt: '',
        },
        {
          teacherDescription: '',
          understanding: 1,
          aiPrompt: '',
        },
        {
          teacherDescription: '',
          understanding: 2,
          aiPrompt: '',
        },
        {
          teacherDescription: '',
          understanding: 3,
          aiPrompt: '',
        },
      ],
    };
  };

  const addNewConceptHandler = event => {
    event.preventDefault();

    const startingData = emptyKeyConcept();

    const oldLearningGoalList = learningGoalList;

    setLearningGoalList([...oldLearningGoalList, startingData]);
  };

  const deleteKeyConcept = id => {
    event.preventDefault();
    var updatedLearningGoalList = learningGoalList.filter(
      item => item.id !== id
    );
    setLearningGoalList(updatedLearningGoalList);
  };

  const updateLearningGoal = (
    idToUpdate,
    keyToUpdate,
    newValue,
    evidenceLevel,
    evidenceLevelKeyToUpdate
  ) => {
    const newLearningGoalData = learningGoalList.map(learningGoal => {
      if (idToUpdate === learningGoal.id) {
        if (keyToUpdate === 'learningGoalEvidenceLevelsAttributes') {
          const newEvidenceLevels =
            learningGoal.learningGoalEvidenceLevelsAttributes;
          newEvidenceLevels.find(
            level => level.understanding === evidenceLevel
          )[evidenceLevelKeyToUpdate] = newValue;
          return {
            ...learningGoal,
            [keyToUpdate]: newEvidenceLevels,
          };
        } else {
          return {
            ...learningGoal,
            [keyToUpdate]: newValue,
          };
        }
      } else {
        return learningGoal;
      }
    });
    setLearningGoalList(newLearningGoalData);
  };

  // TODO-AITT-168: Check that there is at least one submittable programming level here
  const initialLevelForAssessment = !!rubric ? rubric.levelId : levels[0].id;
  const [selectedLevelForAssessment, setSelectedLevelForAssessment] = useState(
    initialLevelForAssessment
  );

  // TODO-AITT-169: Create notification for when a rubric has been saved
  // TODO-AITT-171: Enable deleting LearningGoals when saveRubric is called
  const saveRubric = event => {
    event.preventDefault();
    const dataUrl = !!rubric ? `/rubrics/${rubric.id}` : RUBRIC_PATH;
    const method = !!rubric ? 'PATCH' : 'POST';

    // Checking that the csrf-token exists since it is disabled on test
    const csrfToken = document.querySelector('meta[name="csrf-token"]')
      ? document.querySelector('meta[name="csrf-token"]').attributes['content']
          .value
      : null;
    const learningGoalListAsData = removeNewIds(
      transformKeys(learningGoalList)
    );

    const rubric_data = {
      levelId: selectedLevelForAssessment,
      lessonId: lessonId,
      learningGoalsAttributes: learningGoalListAsData,
    };

    fetch(dataUrl, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify(rubric_data),
    })
      .then(response => response.json())
      .then(data => {
        if (!rubric) {
          navigateToHref(data.redirectUrl);
        }
      })
      .catch(err => {
        console.error('Error saving rubric:' + err);
      });
  };

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

  /**
   * Transforms the keys of an object from camelCase to snake_case.
   * Intended to transform the keys of objects in an array of an object.
   * In this case, it is only intended into the first nested layer.
   * @param {object} obj - The object with keys in camelCase format.
   * @returns {object} - The object with keys in snake_case format.
   */
  function transformObjectKeys(obj) {
    const newObj = {};

    for (const [key, value] of Object.entries(obj)) {
      if (Array.isArray(value)) {
        newObj[snakeCase(key)] = value.map(item => transformObjectKeys(item));
      } else {
        newObj[snakeCase(key)] = value;
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

  const handleDropdownChange = event => {
    setSelectedLevelForAssessment(event.target.value);
  };

  function renderOptions() {
    const selectOptions = levels
      .filter(level => level.properties.submittable === 'true')
      .map(level => (
        <option key={level.id} value={level.id}>
          {level.name}
        </option>
      ));
    return selectOptions;
  }

  return (
    <div>
      <Heading1>Create or modify your rubric</Heading1>
      <BodyTwoText>
        This rubric will be used for {unitName}, lesson {lessonNumber}.
      </BodyTwoText>

      <div style={styles.containerStyle}>
        <label>Choose a level for this rubric to be evaluated on</label>
        <select
          id="rubric_level_id"
          required={true}
          onChange={handleDropdownChange}
          value={selectedLevelForAssessment}
        >
          {renderOptions()}
        </select>
      </div>

      <RubricEditor
        learningGoalList={learningGoalList}
        addNewConcept={addNewConceptHandler}
        deleteItem={id => deleteKeyConcept(id)}
        updateLearningGoal={updateLearningGoal}
      />
      <div style={styles.bottomRow}>
        <Button
          color={Button.ButtonColor.brandSecondaryDefault}
          text="Save your rubric"
          onClick={saveRubric}
          size={Button.ButtonSize.narrow}
        />
      </div>
    </div>
  );
}

RubricsContainer.propTypes = {
  unitName: PropTypes.string,
  lessonNumber: PropTypes.number,
  levels: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      properties: PropTypes.object,
    })
  ),
  rubric: PropTypes.object,
  lessonId: PropTypes.number,
};

const styles = {
  containerStyle: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  bottomRow: {
    display: 'flex',
    justifyContent: 'space-between',
  },
};
