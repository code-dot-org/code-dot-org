import React from 'react';
import PropTypes from 'prop-types';
import LearningGoalItem from './LearningGoalItem';
import Button from '@cdo/apps/templates/Button';

export default function RubricEditor({
  addNewConcept,
  deleteLearningGoal,
  learningGoalList,
  updateLearningGoal,
  disabled,
}) {
  const renderLearningGoalItems = learningGoalList.map(goal => {
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
      {renderLearningGoalItems}
      <Button
        color={Button.ButtonColor.gray}
        text={
          disabled
            ? 'Create a submittable level to create a rubric'
            : 'Add new Key Concept'
        }
        onClick={addNewConcept}
        size={Button.ButtonSize.narrow}
        icon="plus-circle"
        iconClassName="fa fa-plus-circle"
        id="ui-test-add-new-concept-button"
        disabled={disabled}
      />
    </div>
  );
}

RubricEditor.propTypes = {
  learningGoalList: PropTypes.array,
  deleteLearningGoal: PropTypes.func,
  addNewConcept: PropTypes.func,
  updateLearningGoal: PropTypes.func,
  disabled: PropTypes.bool,
};
