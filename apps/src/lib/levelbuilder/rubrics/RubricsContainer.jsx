import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {BodyTwoText, Heading1} from '@cdo/apps/componentLibrary/typography';
import Button from '@cdo/apps/templates/Button';
import {navigateToHref} from '@cdo/apps/utils';
import RubricEditor from './RubricEditor';
import {snakeCase} from 'lodash';

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
            key: 'learningGoal-1',
            id: 'learningGoal-1',
            learningGoal: '',
            aiEnabled: false,
            position: 1,
            learningGoalEvidenceLevelsAttributes: [
              {
                learningGoalId: 'learningGoal-1',
                teacherDescription: '',
                understanding: 0,
                aiPrompt: '',
              },
              {
                learningGoalId: 'learningGoal-1',
                teacherDescription: '',
                understanding: 1,
                aiPrompt: '',
              },
              {
                learningGoalId: 'learningGoal-1',
                teacherDescription: '',
                understanding: 2,
                aiPrompt: '',
              },
              {
                learningGoalId: 'learningGoal-1',
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

    return `learningGoal-${learningGoalNumber}`;
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
          learningGoalId: newId,
          teacherDescription: '',
          understanding: 0,
          aiPrompt: '',
        },
        {
          learningGoalId: newId,
          teacherDescription: '',
          understanding: 1,
          aiPrompt: '',
        },
        {
          learningGoalId: newId,
          teacherDescription: '',
          understanding: 2,
          aiPrompt: '',
        },
        {
          learningGoalId: newId,
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
    descriptionType
  ) => {
    const newLearningGoalData = learningGoalList.map(learningGoal => {
      if (idToUpdate === learningGoal.id) {
        if (keyToUpdate === 'learningGoalEvidenceLevelsAttributes') {
          const newEvidenceLevels =
            learningGoal.learningGoalEvidenceLevelsAttributes;
          newEvidenceLevels.find(
            level => level.understanding === evidenceLevel
          )[descriptionType] = newValue;
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

  // TODO: Check that there is at least one programming level here
  const initialLevelForAssessment = !!rubric ? rubric.levelId : levels[0].id;
  const [selectedLevelForAssessment, setSelectedLevelForAssessment] = useState(
    initialLevelForAssessment
  );

  const saveRubric = event => {
    event.preventDefault();
    const dataUrl = !!rubric ? `/rubrics/${rubric.id}` : RUBRIC_PATH;
    const method = !!rubric ? 'PATCH' : 'POST';

    // Checking that the csrf-token exists since it is disabled on test
    const csrfToken = document.querySelector('meta[name="csrf-token"]')
      ? document.querySelector('meta[name="csrf-token"]').attributes['content']
          .value
      : null;

    const learningGoalListAsData = transformKeys(learningGoalList);

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
   * Transforms the keys of an object from camelCase to snake_case.
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

  // TODO: In the future we might want to filter the levels in the dropdown for "submittable" levels
  //  "submittable" is in the properties of each level in the list.
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
          {levels.map(level => (
            <option key={level.id} value={level.id}>
              {level.name}
            </option>
          ))}
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
    PropTypes.shape({id: PropTypes.number, name: PropTypes.string})
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
