import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import style from './rubrics.module.scss';
import {
  EmText,
  StrongText,
  BodyThreeText,
} from '@cdo/apps/componentLibrary/typography';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import ReactTooltip from 'react-tooltip';
import {RubricUnderstandingLevels} from '@cdo/apps/util/sharedConstants';
import {aiEvaluationShape} from './rubricShapes';

export default function AiAssessmentBox({
  isAiAssessed,
  studentName,
  aiEvaluation,
  studentSubmitted,
  studentStarted,
}) {
  const hasAiInfo = !!aiEvaluation;
  const aiUnderstandingLevel = aiEvaluation?.understanding;
  const aiConfidence = aiEvaluation?.ai_confidence;

  const boxColor = () => {
    if (isAiAssessed) {
      return aiUnderstandingLevel >= RubricUnderstandingLevels.CONVINCING
        ? style.greenAiAssessment
        : style.redAiAssessment;
    } else {
      return style.noAiAssessment;
    }
  };

  const studentAchievement = () => {
    if (hasAiInfo) {
      const assessment =
        aiUnderstandingLevel >= RubricUnderstandingLevels.CONVINCING
          ? i18n.aiAssessmentDoesMeet()
          : i18n.aiAssessmentDoesNotMeet();
      return i18n.aiStudentAssessment({
        studentName: studentName,
        understandingLevel: assessment,
      });
    } else if (!studentStarted) {
      return i18n.aiEvaluation_student_not_started();
    } else if (!studentSubmitted) {
      return i18n.aiEvaluation_student_not_submitted();
    } else {
      return i18n.aiEvaluation_not_run();
    }
  };

  const aiConfidenceText = () => {
    const confidenceLevels = [i18n.low(), i18n.medium(), i18n.high()];
    const ratingText = confidenceLevels[aiConfidence - 1];
    return i18n.aiConfidence({aiConfidence: ratingText});
  };

  return (
    <div className={boxColor()}>
      {isAiAssessed && (
        <div>
          <BodyThreeText>
            <StrongText>{studentAchievement()}</StrongText>
          </BodyThreeText>
          {aiConfidence && (
            <div>
              <EmText>{aiConfidenceText()}</EmText>
              <span data-tip data-for="info-tip">
                <FontAwesome icon="info-circle" className={style.infoTipIcon} />
              </span>
              <ReactTooltip id="info-tip" effect="solid">
                <div className={style.infoTipText}>
                  {i18n.aiConfidenceTooltip()}
                </div>
              </ReactTooltip>
            </div>
          )}
        </div>
      )}
      {!isAiAssessed && <EmText>{i18n.aiCannotAssess()}</EmText>}
    </div>
  );
}

AiAssessmentBox.propTypes = {
  isAiAssessed: PropTypes.bool.isRequired,
  studentName: PropTypes.string,
  aiEvaluation: aiEvaluationShape,
  studentSubmitted: PropTypes.bool,
  studentStarted: PropTypes.bool,
};
