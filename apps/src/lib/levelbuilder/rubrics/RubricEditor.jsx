import React from 'react';
import PropTypes from 'prop-types';
import LearningGoalItem from './LearningGoalItem';
import Button from '@cdo/apps/templates/Button';

export default function RubricEditor({
  addNewConcept,
  deleteItem,
  learningGoalList,
  updateLearningGoal,
}) {
  const renderLearningGoalItems = learningGoalList.map(goal => {
    return (
      <LearningGoalItem
        deleteItem={() => deleteItem(goal.id)}
        id={goal.id}
        key={goal.id}
        exisitingLearningGoalData={goal}
        updateLearningGoal={updateLearningGoal}
      />
    );
  });

  return (
    <div>
      {renderLearningGoalItems}
      <Button
        color={Button.ButtonColor.gray}
        text="Add new Key Concept"
        onClick={addNewConcept}
        size={Button.ButtonSize.narrow}
        icon="plus-circle"
        iconClassName="fa fa-plus-circle"
        id="ui-test-add-new-concept-button"
      />
    </div>
  );
}

RubricEditor.propTypes = {
  learningGoalList: PropTypes.array,
  deleteItem: PropTypes.func,
  addNewConcept: PropTypes.func,
  updateLearningGoal: PropTypes.func,
};
