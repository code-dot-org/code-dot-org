import React from 'react';
import PropTypes from 'prop-types';
import {Heading6} from '@cdo/apps/componentLibrary/typography';
import EvidenceDescriptionsRow from './EvidenceDescriptionsRow';

export default function EvidenceDescriptions({
  isAiEnabled,
  learningGoalData,
  updateLearningGoal,
}) {
  return (
    <div>
      <div style={styles.grid}>
        <Heading6 style={styles.columnHeaders}>Evidence level</Heading6>
        <Heading6 style={styles.columnHeaders}>
          Description for external viewers
        </Heading6>
        <Heading6 style={styles.columnHeaders}>
          Description for AI generated evaluation
        </Heading6>
      </div>
      <EvidenceDescriptionsRow
        isAiEnabled={isAiEnabled}
        evidenceLabel={'Extensive Evidence'}
        evidenceLevelData={learningGoalData.evidenceLevels[3]}
        understanding={3}
        updateLearningGoal={updateLearningGoal}
      />
      <EvidenceDescriptionsRow
        isAiEnabled={isAiEnabled}
        evidenceLabel={'Convincing Evidence'}
        evidenceLevelData={learningGoalData.evidenceLevels[2]}
        understanding={2}
        updateLearningGoal={updateLearningGoal}
      />
      <EvidenceDescriptionsRow
        isAiEnabled={isAiEnabled}
        evidenceLabel={'Limited Evidence'}
        evidenceLevelData={learningGoalData.evidenceLevels[1]}
        understanding={1}
        updateLearningGoal={updateLearningGoal}
      />
      <EvidenceDescriptionsRow
        isAiEnabled={isAiEnabled}
        evidenceLabel={'No Evidence'}
        evidenceLevelData={learningGoalData.evidenceLevels[0]}
        understanding={0}
        updateLearningGoal={updateLearningGoal}
      />
    </div>
  );
}

EvidenceDescriptions.propTypes = {
  isAiEnabled: PropTypes.bool,
  learningGoalData: PropTypes.object,
  updateLearningGoal: PropTypes.func,
};

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: '100px 1fr 1fr',
    gap: '10px',
  },
  columnHeaders: {
    textAlign: 'center',
  },
};
