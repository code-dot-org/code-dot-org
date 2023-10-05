import React from 'react';
import PropTypes from 'prop-types';
import {Heading6} from '@cdo/apps/componentLibrary/typography';
import EvidenceDescriptionsRow from './EvidenceDescriptionsRow';
import {UNDERSTANDING_LEVEL_STRINGS} from '@cdo/apps/templates/rubrics/rubricHelpers';
import {RubricUnderstandingLevels} from '@cdo/apps/util/sharedConstants';

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
