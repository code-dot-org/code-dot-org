import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {BodyTwoText, Heading1} from '@cdo/apps/componentLibrary/typography';
import LearningGoalItem from './LearningGoalItem';
import Button from '@cdo/apps/templates/Button';

export default function RubricsContainer({unit, lesson}) {
  // note that the use of currentId here is temporary until we are connected to the data
  const [currentId, setCurrentId] = useState(1);
  const [learningGoalList, setLearningGoalList] = useState([{id: currentId}]);

  // holding levels in this temporary variable before connecting the data
  const tempLevelList = [1, 2, 3, 4, 5];

  const renderLearningGoalItems = learningGoalList.map(goal => (
    <LearningGoalItem
      deleteItem={() => deleteKeyConcept(goal.id)}
      key={goal.id}
    />
  ));

  const deleteKeyConcept = id => {
    var updatedLearningGoalList = learningGoalList.filter(
      item => item.id !== id
    );
    setLearningGoalList(updatedLearningGoalList);
  };

  const addNewConceptHandler = event => {
    // temporary tool for creating unique Ids
    var updatedId = currentId + 1;

    setCurrentId(updatedId);

    // update the goal list
    setLearningGoalList(oldList => {
      return [...oldList, {id: updatedId}];
    });
  };

  return (
    <div>
      <Heading1>Create or modify your rubric</Heading1>
      <BodyTwoText>
        This rubric will be used for Unit {unit}, lesson {lesson}.
      </BodyTwoText>

      <div style={styles.containerStyle}>
        <label>Choose a level for this rubric to be evaluated on</label>
        <select
          required={true}
          onChange={() => console.log('dropdown changed')}
        >
          {tempLevelList.map(level => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>

      {renderLearningGoalItems}
      <div style={styles.bottomRow}>
        <Button
          color={Button.ButtonColor.gray}
          text="Add new Key Concept"
          onClick={addNewConceptHandler}
          size={Button.ButtonSize.narrow}
          icon="plus-circle"
          iconClassName="fa fa-plus-circle"
          id="ui-test-add-new-concept-button"
        />
        <Button
          color={Button.ButtonColor.orange}
          text="Save your rubric"
          onClick={() => console.log('this will work later')}
          size={Button.ButtonSize.narrow}
        />
      </div>
    </div>
  );
}

RubricsContainer.propTypes = {
  unit: PropTypes.number,
  lesson: PropTypes.number,
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
