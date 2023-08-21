import React, {useState} from 'react';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';
import {borderRadius} from '@cdo/apps/lib/levelbuilder/constants';
import EvidenceDescriptions from './EvidenceDescriptions';
import Button from '../../../templates/Button';

export default function LearningGoalItem({deleteItem}) {
  const [aiEnabled, setAiEnabled] = useState(false);

  const handleCheckboxChange = () => {
    setAiEnabled(!aiEnabled);
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
                  style={{width: 600}}
                  className="uitest-rubric-key-concept-input"
                />
              </label>
            </div>
            <label style={styles.labelAndInput}>
              Use AI to assess
              <input
                type="checkbox"
                checked={aiEnabled}
                onChange={handleCheckboxChange}
                style={styles.checkbox}
              />
            </label>
          </div>
        </div>
      </div>
      <div style={styles.activityBody}>
        <EvidenceDescriptions isAiEnabled={aiEnabled} />
        <Button
          text="Delete key concept"
          color={Button.ButtonColor.red}
          onClick={() => deleteItem()}
          icon="trash"
          iconClassName="fa-trash"
          className="ui-test-delete-concept-button"
        />
      </div>
    </div>
  );
}

LearningGoalItem.propTypes = {
  deleteItem: PropTypes.func,
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
    marginLeft: 7,
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
};
