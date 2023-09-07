import React from 'react';
import PropTypes from 'prop-types';
import {Heading6} from '@cdo/apps/componentLibrary/typography';
import EvidenceDescriptionsRow from './EvidenceDescriptionsRow';

export default function EvidenceDescriptions({
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
        isAiEnabled={learningGoalData.aiEnabled}
        evidenceLabel={'Extensive Evidence'}
        evidenceLevelData={
          learningGoalData.learningGoalEvidenceLevelsAttributes[3]
        }
        updateLearningGoal={updateLearningGoal}
      />
      <EvidenceDescriptionsRow
        isAiEnabled={learningGoalData.aiEnabled}
        evidenceLabel={'Convincing Evidence'}
        evidenceLevelData={
          learningGoalData.learningGoalEvidenceLevelsAttributes[2]
        }
        updateLearningGoal={updateLearningGoal}
      />
      <EvidenceDescriptionsRow
        isAiEnabled={learningGoalData.aiEnabled}
        evidenceLabel={'Limited Evidence'}
        evidenceLevelData={
          learningGoalData.learningGoalEvidenceLevelsAttributes[1]
        }
        updateLearningGoal={updateLearningGoal}
      />
      <EvidenceDescriptionsRow
        isAiEnabled={learningGoalData.aiEnabled}
        evidenceLabel={'No Evidence'}
        evidenceLevelData={
          learningGoalData.learningGoalEvidenceLevelsAttributes[0]
        }
        updateLearningGoal={updateLearningGoal}
      />
    </div>
  );
}

EvidenceDescriptions.propTypes = {
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
