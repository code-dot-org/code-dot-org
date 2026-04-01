import PropTypes from 'prop-types';
import React from 'react';

import Button from '@cdo/apps/legacySharedComponents/Button';
import HelpTip from '@cdo/apps/sharedComponents/HelpTip';

import LearningGoalItem from './LearningGoalItem';
import {styles} from './rubricHelper';

export default function RubricEditor({
  addNewConcept,
  deleteLearningGoal,
  learningGoalList,
  updateLearningGoal,
  aiRubricS3ConfigValue,
  onAiRubricS3ConfigChange,
}) {
  const renderLearningGoalItems = learningGoalList?.map(goal => {
    if (!goal._destroy) {
      return (
        <LearningGoalItem
          deleteLearningGoal={deleteLearningGoal}
          key={goal.id}
          exisitingLearningGoalData={goal}
          updateLearningGoal={updateLearningGoal}
        />
      );
    }
  });

  return (
    <div>
      <div style={styles.containerStyle}>
        <label htmlFor="ai_rubric_s3_config">
          AI Rubric S3 config directory name
          <HelpTip>
            <p>
              An engineer must add the appropriate AI rubric configuration to S3
              and provide you with this directory name before AI can be enabled
              for any learning goals on this level.
            </p>
          </HelpTip>
        </label>
        <input
          id="ai_rubric_s3_config"
          type="text"
          value={aiRubricS3ConfigValue || ''}
          onChange={e => onAiRubricS3ConfigChange(e.target.value)}
          placeholder="e.g. allthethings-L48"
        />
      </div>
      {renderLearningGoalItems}
      <Button
        color={Button.ButtonColor.gray}
        text={'Add new Key Concept'}
        onClick={addNewConcept}
        size={Button.ButtonSize.narrow}
        icon="circle-plus"
        iconClassName="fa-solid fa-circle-plus"
        id="ui-test-add-new-concept-button"
      />
    </div>
  );
}

RubricEditor.propTypes = {
  learningGoalList: PropTypes.array,
  deleteLearningGoal: PropTypes.func,
  addNewConcept: PropTypes.func,
  updateLearningGoal: PropTypes.func,
  aiRubricS3ConfigValue: PropTypes.string,
  onAiRubricS3ConfigChange: PropTypes.func,
};
