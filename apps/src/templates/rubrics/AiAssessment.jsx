import {Typography} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import i18n from '@cdo/locale';

import AiAssessmentBox from './AiAssessmentBox';
import aiBotImage from './images/AiBot_2x.png';
import {
  aiEvaluationShape,
  aiEvidenceShape,
  learningGoalShape,
  reportingDataShape,
  studentLevelInfoShape,
} from './rubricShapes';

import style from './rubrics.module.scss';

export default function AiAssessment({
  isAiAssessed,
  learningGoals,
  currentLearningGoal,
  reportingData,
  studentName,
  studentLevelInfo,
  aiUnderstandingLevel,
  aiConfidence,
  aiEvidence,
  aiEvalInfo,
}) {
  return (
    <div id="tour-ai-assessment" className="uitest-ai-assessment">
      <Typography component="h6" variant="body3" gutterBottom>
        <Typography variant="strong">{i18n.aiAssessment()}</Typography>
      </Typography>
      <div className={style.aiAssessmentBlock}>
        <img alt={i18n.aiBot()} src={aiBotImage} className={style.aiBotImg} />
        <AiAssessmentBox
          isAiAssessed={isAiAssessed}
          aiEvidence={aiEvidence}
          aiUnderstandingLevel={aiUnderstandingLevel}
          currentLearningGoal={currentLearningGoal}
          learningGoals={learningGoals}
          reportingData={reportingData}
          studentName={studentName}
          studentLevelInfo={studentLevelInfo}
          aiEvalInfo={aiEvalInfo}
          aiConfidence={aiConfidence}
        />
      </div>
    </div>
  );
}

AiAssessment.propTypes = {
  isAiAssessed: PropTypes.bool.isRequired,
  learningGoals: PropTypes.arrayOf(learningGoalShape),
  currentLearningGoal: PropTypes.number,
  reportingData: reportingDataShape,
  studentName: PropTypes.string,
  studentLevelInfo: studentLevelInfoShape,
  aiUnderstandingLevel: PropTypes.number,
  aiConfidence: PropTypes.number,
  aiEvidence: PropTypes.arrayOf(aiEvidenceShape),
  aiEvalInfo: aiEvaluationShape,
};
