import {Typography} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import {UNDERSTANDING_LEVEL_STRINGS} from '@cdo/apps/templates/rubrics/rubricHelpers';
import {RubricUnderstandingLevels} from '@cdo/generated-scripts/sharedConstants';

import EvidenceDescriptionsRow from './EvidenceDescriptionsRow';

export default function EvidenceDescriptions({
  learningGoalData,
  updateLearningGoal,
}) {
  return (
    <div>
      <div style={styles.grid}>
        <Typography style={styles.columnHeaders} variant="h6" gutterBottom>
          Evidence level
        </Typography>
        <Typography style={styles.columnHeaders} variant="h6" gutterBottom>
          Description for external viewers
        </Typography>
        <Typography style={styles.columnHeaders} variant="h6" gutterBottom>
          Description for AI generated evaluation
        </Typography>
      </div>
      <EvidenceDescriptionsRow
        isAiEnabled={learningGoalData.aiEnabled}
        evidenceLabel={
          UNDERSTANDING_LEVEL_STRINGS[RubricUnderstandingLevels.EXTENSIVE]
        }
        evidenceLevelData={
          learningGoalData.learningGoalEvidenceLevelsAttributes[
            RubricUnderstandingLevels.EXTENSIVE
          ]
        }
        updateLearningGoal={updateLearningGoal}
        learningGoalId={learningGoalData.id}
      />
      <EvidenceDescriptionsRow
        isAiEnabled={learningGoalData.aiEnabled}
        evidenceLabel={
          UNDERSTANDING_LEVEL_STRINGS[RubricUnderstandingLevels.CONVINCING]
        }
        evidenceLevelData={
          learningGoalData.learningGoalEvidenceLevelsAttributes[
            RubricUnderstandingLevels.CONVINCING
          ]
        }
        updateLearningGoal={updateLearningGoal}
        learningGoalId={learningGoalData.id}
      />
      <EvidenceDescriptionsRow
        isAiEnabled={learningGoalData.aiEnabled}
        evidenceLabel={
          UNDERSTANDING_LEVEL_STRINGS[RubricUnderstandingLevels.LIMITED]
        }
        evidenceLevelData={
          learningGoalData.learningGoalEvidenceLevelsAttributes[
            RubricUnderstandingLevels.LIMITED
          ]
        }
        updateLearningGoal={updateLearningGoal}
        learningGoalId={learningGoalData.id}
      />
      <EvidenceDescriptionsRow
        isAiEnabled={learningGoalData.aiEnabled}
        evidenceLabel={
          UNDERSTANDING_LEVEL_STRINGS[RubricUnderstandingLevels.NONE]
        }
        evidenceLevelData={
          learningGoalData.learningGoalEvidenceLevelsAttributes[
            RubricUnderstandingLevels.NONE
          ]
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
