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

export default function AiAssessmentBox({
  isAiAssessed,
  studentName,
  aiUnderstandingLevel,
  aiConfidence,
}) {
  const boxColor = () => {
    if (isAiAssessed) {
      return aiUnderstandingLevel >= RubricUnderstandingLevels.CONVINCING
        ? style.greenAiAssessment
        : style.redAiAssessment;
    } else {
      return style.noAiAssessment;
    }
  };

  const studentAchievment = () => {
    const assessment =
      aiUnderstandingLevel >= RubricUnderstandingLevels.CONVINCING
        ? i18n.aiAssessmentDoesMeet()
        : i18n.aiAssessmentDoesNotMeet();
    return i18n.aiStudentAssessment({
      studentName: studentName,
      understandingLevel: assessment,
    });
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
            <StrongText>{studentAchievment()}</StrongText>
          </BodyThreeText>
          {aiConfidence && (
            <div>
              <EmText>{aiConfidenceText()}</EmText>
              <span data-tip data-for="info-tip">
                <FontAwesome icon="info-circle" className={style.infoTipIcon} />
              </span>
              <ReactTooltip id="info-tip" effect="solid">
                PLACEHOLDER TEXT FOR INFO TIP
              </ReactTooltip>
            </div>
          )}
        </div>
      )}
      {!isAiAssessed && (
        <div>
          <EmText>{i18n.aiCannotAssess()}</EmText>
          <span data-tip data-for="info-tip">
            <FontAwesome icon="info-circle" className={style.infoTipIcon} />
          </span>
          <ReactTooltip id="info-tip" effect="solid">
            PLACEHOLDER TEXT FOR INFO TIP
          </ReactTooltip>
        </div>
      )}
    </div>
  );
}

AiAssessmentBox.propTypes = {
  isAiAssessed: PropTypes.bool.isRequired,
  studentName: PropTypes.string,
  aiUnderstandingLevel: PropTypes.number,
  aiConfidence: PropTypes.number,
};
