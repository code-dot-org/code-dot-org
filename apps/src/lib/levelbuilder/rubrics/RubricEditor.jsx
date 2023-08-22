import React from 'react';
import PropTypes from 'prop-types';
import LearningGoalItem from './LearningGoalItem';
import Button from '@cdo/apps/templates/Button';

export default function RubricEditor({
  addNewConcept,
  deleteItem,
  learningGoalList,
  handleAiEnabledChange,
  handleLearningGoalNameChange,
}) {
  const renderLearningGoalItems = learningGoalList.map(goal => (
    <LearningGoalItem
      deleteItem={() => deleteItem(goal.id)}
      id={goal.id}
      exisitingLearningGoalData={goal}
      handleAiEnabledChange={handleAiEnabledChange}
      handleLearningGoalNameChange={handleLearningGoalNameChange}
    />
  ));

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
  handleAiEnabledChange: PropTypes.func,
  deleteItem: PropTypes.func,
  addNewConcept: PropTypes.func,
  handleLearningGoalNameChange: PropTypes.func,
};
