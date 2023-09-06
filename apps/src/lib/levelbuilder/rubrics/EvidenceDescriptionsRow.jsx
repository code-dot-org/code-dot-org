import React from 'react';
import PropTypes from 'prop-types';

export default function EvidenceDescriptionsRow({
  isAiEnabled,
  evidenceLabel,
  evidenceLevelData,
  understanding,
  updateLearningGoal,
}) {
  const handleTeacherDescriptionChange = event => {
    updateLearningGoal(
      evidenceLevelData.learningGoalId,
      'evidenceLevels',
      event.target.value,
      understanding,
      'teacherDescription'
    );
  };

  const handleAiPromptChange = event => {
    updateLearningGoal(
      evidenceLevelData.learningGoalId,
      'evidenceLevels',
      event.target.value,
      understanding,
      'aiPrompt'
    );
  };

  return (
    <div style={styles.grid}>
      <label style={styles.gridLabels}>{evidenceLabel}</label>
      <textarea
        style={styles.textareaBoxes}
        value={evidenceLevelData.teacherDescription}
        onChange={handleTeacherDescriptionChange}
      />
      <textarea
        className={'ui-test-ai-prompt-textbox'}
        style={styles.textareaBoxes}
        disabled={!isAiEnabled}
        required={isAiEnabled}
        value={evidenceLevelData.aiPrompt}
        onChange={handleAiPromptChange}
      />
    </div>
  );
}

EvidenceDescriptionsRow.propTypes = {
  isAiEnabled: PropTypes.bool,
  evidenceLabel: PropTypes.string,
  evidenceLevelData: PropTypes.object,
  understanding: PropTypes.number,
  updateLearningGoal: PropTypes.func,
};

const styles = {
  textareaBoxes: {
    width: '90%',
    height: '80px',
    resize: 'none',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  gridLabels: {
    verticalAlign: 'middle',
    marginBottom: 'auto',
    marginTop: 'auto',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '100px 1fr 1fr',
    gap: '10px',
  },
};
