import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import style from './rubrics.module.scss';
import {EmText, Heading6} from '@cdo/apps/componentLibrary/typography';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import ReactTooltip from 'react-tooltip';
import {RubricUnderstandingLevels} from '@cdo/apps/util/sharedConstants';

export default function AiAssessmentBox({
  isAiAssessed,
  studentName,
  aiUnderstandingLevel,
  aiConfidence,
}) {
  // TO DO: Create color constants in the css file
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

  return (
    <div className={boxColor()}>
      <div>
        <Heading6>{studentAchievment()}</Heading6>
        <div>
          <EmText>{i18n.aiConfidence({aiConfidence: aiConfidence})}</EmText>
          <span data-tip data-for="info-tip">
            <FontAwesome icon="info-circle" className={style.infoTipIcon} />
          </span>
          <ReactTooltip id="info-tip" effect="solid">
            {i18n.aiAssessmentExplanation}
          </ReactTooltip>
        </div>
      </div>
    </div>
  );
}

AiAssessmentBox.propTypes = {
  isAiAssessed: PropTypes.bool.isRequired,
  studentName: PropTypes.string,
  aiUnderstandingLevel: PropTypes.number,
  aiConfidence: PropTypes.number,
};
