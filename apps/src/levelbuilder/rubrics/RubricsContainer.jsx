import PropTypes from 'prop-types';
import React, {useState} from 'react';

import {
  BodyThreeText,
  BodyTwoText,
  Heading1,
} from '@cdo/apps/componentLibrary/typography';
import Button from '@cdo/apps/legacySharedComponents/Button';
import {RubricUnderstandingLevels} from '@cdo/generated-scripts/sharedConstants';

import RubricEditor from './RubricEditor';
import {saveRubricToTable, SAVING_TEXT, styles} from './rubricHelper';

export default function RubricsContainer({
  unitName,
  lessonNumber,
  submittableLevels,
  rubric,
  lessonId,
}) {
  const [learningGoalList, setLearningGoalList] = useState(
    !!rubric ? rubric.learningGoals : initialLearningGoal
  );

  const [saveNotificationText, setSaveNotificationText] = useState('');
  const hasSubmittableLevels = submittableLevels.length > 0;

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
      tips: null,
      learningGoalEvidenceLevelsAttributes: [
        {
          teacherDescription: '',
          understanding: RubricUnderstandingLevels.NONE,
          aiPrompt: '',
        },
        {
          teacherDescription: '',
          understanding: RubricUnderstandingLevels.LIMITED,
          aiPrompt: '',
        },
        {
          teacherDescription: '',
          understanding: RubricUnderstandingLevels.CONVINCING,
          aiPrompt: '',
        },
        {
          teacherDescription: '',
          understanding: RubricUnderstandingLevels.EXTENSIVE,
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

  const deleteLearningGoal = idToDelete => {
    const newLearningGoalData = learningGoalList.map(learningGoal => {
      if (idToDelete === learningGoal.id) {
        return {
          ...learningGoal,
          _destroy: true,
        };
      } else {
        return learningGoal;
      }
    });
    setLearningGoalList(newLearningGoalData);
  };

  // TODO-AITT-168: Check that there is at least one submittable programming level here
  const initialLevelForAssessment = !!rubric
    ? rubric.levelId
    : submittableLevels[0].id;
  const [selectedLevelForAssessment, setSelectedLevelForAssessment] = useState(
    initialLevelForAssessment
  );

  // TODO-AITT-171: Enable deleting LearningGoals when saveRubric is called
  const saveRubric = async event => {
    event.preventDefault();
    await saveRubricToTable(
      setSaveNotificationText,
      rubric,
      learningGoalList,
      setLearningGoalList,
      selectedLevelForAssessment,
      lessonId
    );
  };

  function renderOptions() {
    const selectOptions = submittableLevels.map(level => (
      <option key={level.id} value={level.id}>
        {level.name}
      </option>
    ));
    return selectOptions;
  }

  const handleDropdownChange = event => {
    setSelectedLevelForAssessment(event.target.value);
  };

  const pageHeader = !!rubric ? 'Modify your rubric' : 'Create your rubric';

  return (
    <div>
      <Heading1>{pageHeader}</Heading1>
      {hasSubmittableLevels && (
        <div>
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
            deleteLearningGoal={deleteLearningGoal}
            updateLearningGoal={updateLearningGoal}
          />
          <div style={styles.bottomRow}>
            <Button
              className="ui-test-save-button"
              color={Button.ButtonColor.brandSecondaryDefault}
              text="Save your rubric"
              onClick={saveRubric}
              size={Button.ButtonSize.narrow}
              disabled={saveNotificationText === SAVING_TEXT}
            />
          </div>
          <div style={styles.bottomRow}>
            <BodyThreeText>{saveNotificationText}</BodyThreeText>
          </div>
        </div>
      )}
      {!hasSubmittableLevels && (
        <div>
          <BodyTwoText>
            {unitName}, lesson {lessonNumber} currently has no submittable
            levels. To create or modify a rubric, there must be a submittable
            level connected to the rubric. Go back to the lesson landing page
            and either add a new submittable level or modify an existing level
            to be submittable.
          </BodyTwoText>
        </div>
      )}
    </div>
  );
}

RubricsContainer.propTypes = {
  unitName: PropTypes.string,
  lessonNumber: PropTypes.number,
  submittableLevels: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    })
  ),
  rubric: PropTypes.object,
  lessonId: PropTypes.number,
};

const initialLearningGoal = [
  {
    key: 'ui-1',
    id: 'ui-1',
    learningGoal: '',
    aiEnabled: false,
    position: 1,
    learningGoalEvidenceLevelsAttributes: [
      {
        teacherDescription: '',
        understanding: RubricUnderstandingLevels.NONE,
        aiPrompt: '',
      },
      {
        teacherDescription: '',
        understanding: RubricUnderstandingLevels.LIMITED,
        aiPrompt: '',
      },
      {
        teacherDescription: '',
        understanding: RubricUnderstandingLevels.CONVINCING,
        aiPrompt: '',
      },
      {
        teacherDescription: '',
        understanding: RubricUnderstandingLevels.EXTENSIVE,
        aiPrompt: '',
      },
    ],
  },
];
