import React from 'react';
import PropTypes from 'prop-types';
import {Heading6} from '@cdo/apps/componentLibrary/typography';
import EvidenceDescriptionsRow from './EvidenceDescriptionsRow';
import {UNDERSTANDING_LEVEL_STRINGS} from '@cdo/apps/templates/rubrics/rubricHelpers';

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
        evidenceLabel={UNDERSTANDING_LEVEL_STRINGS[3]}
        evidenceLevelData={
          learningGoalData.learningGoalEvidenceLevelsAttributes[3]
        }
        updateLearningGoal={updateLearningGoal}
        learningGoalId={learningGoalData.id}
      />
      <EvidenceDescriptionsRow
        isAiEnabled={learningGoalData.aiEnabled}
        evidenceLabel={UNDERSTANDING_LEVEL_STRINGS[2]}
        evidenceLevelData={
          learningGoalData.learningGoalEvidenceLevelsAttributes[2]
        }
        updateLearningGoal={updateLearningGoal}
        learningGoalId={learningGoalData.id}
      />
      <EvidenceDescriptionsRow
        isAiEnabled={learningGoalData.aiEnabled}
        evidenceLabel={UNDERSTANDING_LEVEL_STRINGS[1]}
        evidenceLevelData={
          learningGoalData.learningGoalEvidenceLevelsAttributes[1]
        }
        updateLearningGoal={updateLearningGoal}
        learningGoalId={learningGoalData.id}
      />
      <EvidenceDescriptionsRow
        isAiEnabled={learningGoalData.aiEnabled}
        evidenceLabel={UNDERSTANDING_LEVEL_STRINGS[0]}
        evidenceLevelData={
          learningGoalData.learningGoalEvidenceLevelsAttributes[0]
        }
        updateLearningGoal={updateLearningGoal}
        learningGoalId={learningGoalData.id}
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
