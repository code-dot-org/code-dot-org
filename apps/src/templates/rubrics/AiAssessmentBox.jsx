import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import style from './rubrics.module.scss';
import {EmText, Heading6} from '@cdo/apps/componentLibrary/typography';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import ReactTooltip from 'react-tooltip';
// import classNames from 'classnames';

export default function AiAssessmentBox({
  isAiAssessed,
  studentName,
  aiUnderstandingLevel,
  aiConfidence,
}) {
  // TO DO: Create color constants in the css file
  // TO DO: Get conditional formatting to work
  //   const boxColor = () => {
  //     console.log('inside boxColor');
  //     if (isAiAssessed) {
  //       return aiUnderstandingLevel >= 2
  //         ? style.greenAiAssessment
  //         : style.redAiAssessment;
  //     } else {
  //       return style.noAiAssessment;
  //     }
  //   };
  //   const className = classNames({
  //     [style.greenAiAssessment]: isAiAssessed && aiUnderstandingLevel >= 2,
  //     [style.redAiAssessment]: isAiAssessed && aiUnderstandingLevel < 2,
  //     [style.noAiAssessment]: !isAiAssessed,
  //   });

  // should this be a const instead?
  const studentAchievment = () => {
    const assessment =
      aiUnderstandingLevel >= 2
        ? i18n.aiAssessmentDoesMeet()
        : i18n.aiAssessmentDoesNotMeet();
    return i18n.aiStudentAssessment({
      studentName: studentName,
      understandingLevel: assessment,
    });
  };

  return (
    <div className={style.greenAiAssessment}>
      <div className="text">
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
