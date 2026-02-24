import PropTypes from 'prop-types';
import React, {useState} from 'react';

import Button from '@cdo/apps/legacySharedComponents/Button';
import {borderRadius} from '@cdo/apps/levelbuilder/constants';
import color from '@cdo/apps/util/color';

import EvidenceDescriptions from './EvidenceDescriptions';

export default function LearningGoalItem({
  deleteLearningGoal,
  exisitingLearningGoalData,
  updateLearningGoal,
}) {
  const [canEditLearningGoalName, setCanEditLearningGoalName] = useState(false);

  const handleCheckboxChange = () => {
    const newAiEnabledValue = !exisitingLearningGoalData.aiEnabled;
    updateLearningGoal(
      exisitingLearningGoalData.id,
      'aiEnabled',
      newAiEnabledValue
    );
  };

  const handleKeyConceptChange = event => {
    updateLearningGoal(
      exisitingLearningGoalData.id,
      'learningGoal',
      event.target.value
    );
  };

  const handleKeyConceptFocus = event => {
    if (exisitingLearningGoalData.aiEnabled && !canEditLearningGoalName) {
      if (
        confirm(
          'Please contact the teacher tools team before changing the name of any key concept that uses AI assessment.'
        )
      ) {
        setCanEditLearningGoalName(true);
      } else {
        document.activeElement.blur();
      }
    }
  };

  const handleDelete = event => {
    deleteLearningGoal(exisitingLearningGoalData.id);
  };

  return (
    <div className="uitest-learning-goal-card">
      <div
        style={{
          ...styles.activityHeader,
        }}
      >
        <div style={styles.activityHeaderComponents}>
          <div style={styles.inputsAndIcon}>
            <div>
              <label style={styles.labelAndInput}>
                <span style={styles.label}>{`Key Concept:`}</span>
                <input
                  value={exisitingLearningGoalData.learningGoal}
                  style={{width: 600}}
                  className="uitest-rubric-key-concept-input"
                  onChange={handleKeyConceptChange}
                  onFocus={handleKeyConceptFocus}
                />
              </label>
            </div>
            <label style={styles.labelAndInput}>
              Use AI to assess
              <input
                type="checkbox"
                checked={exisitingLearningGoalData.aiEnabled}
                onChange={handleCheckboxChange}
                style={styles.checkbox}
              />
              {/* This span is used for checkbox styling;
              It is hidden from AT devices */}
              <span
                style={
                  exisitingLearningGoalData.aiEnabled
                    ? styles.checkboxChecked
                    : styles.checkboxBlank
                }
                aria-hidden="true"
              >
                ✔
              </span>
            </label>
          </div>
        </div>
      </div>
      <div style={styles.activityBody}>
        <EvidenceDescriptions
          learningGoalData={exisitingLearningGoalData}
          updateLearningGoal={updateLearningGoal}
        />
        <label
          style={{...styles.labelAndInput, ...styles.textboxLabelAndInput}}
        >
          Tips
          <textarea
            value={exisitingLearningGoalData.tips || ''}
            onChange={event =>
              updateLearningGoal(
                exisitingLearningGoalData.id,
                'tips',
                event.target.value
              )
            }
            style={{width: '100%', height: 100}}
          />
        </label>
        <label style={styles.labelAndInput}>
          Unique Key: {exisitingLearningGoalData.key}
        </label>
        <Button
          text="Delete key concept"
          color={Button.ButtonColor.red}
          onClick={handleDelete}
          icon="trash"
          iconClassName="fa-trash"
          className="ui-test-delete-concept-button"
        />
      </div>
    </div>
  );
}

LearningGoalItem.propTypes = {
  deleteLearningGoal: PropTypes.func,
  exisitingLearningGoalData: PropTypes.object,
  updateLearningGoal: PropTypes.func,
};

const styles = {
  activityHeader: {
    fontSize: 18,
    color: 'white',
    background: color.cyan,
    borderTopLeftRadius: borderRadius,
    borderTopRightRadius: borderRadius,
    padding: 10,
  },
  activityHeaderComponents: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    overflow: 'hidden',
  },
  activityBody: {
    background: color.lightest_cyan,
    borderBottomLeftRadius: borderRadius,
    borderBottomRightRadius: borderRadius,
    padding: 10,
    marginBottom: 20,
  },
  checkbox: {
    opacity: 0,
    position: 'absolute',
  },
  checkboxChecked: {
    background: color.cyan,
    color: color.white,
    fontSize: 18,
    textAlign: 'center',
    borderColor: color.white,
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 2,
    margin: 5,
    width: 20,
    height: 20,
  },
  checkboxBlank: {
    background: color.white,
    color: color.white,
    fontSize: 18,
    textAlign: 'center',
    borderColor: color.black,
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 2,
    margin: 5,
    width: 20,
    height: 20,
  },
  label: {
    fontSize: 18,
    marginRight: 5,
  },
  labelAndInput: {
    marginLeft: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  inputsAndIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    flex: '1 1',
  },
  textboxLabelAndInput: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginLeft: 0,
    marginRight: 25,
  },
};
