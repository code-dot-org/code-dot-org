import React, {useContext} from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import style from './rubrics.module.scss';
import {
  EmText,
  StrongText,
  BodyFourText,
} from '@cdo/apps/componentLibrary/typography';
import {RubricUnderstandingLevels} from '@cdo/apps/util/sharedConstants';
import {aiEvaluationShape, aiEvidenceShape} from './rubricShapes';
import AiConfidenceBox from './AiConfidenceBox';
import AiAssessmentFeedbackContext from './AiAssessmentFeedbackContext';
import AiAssessmentFeedbackRadio from './AiAssessmentFeedbackRadio';
import AiAssessmentFeedback from './AiAssessmentFeedback';

export default function AiAssessmentBox({
  isAiAssessed,
  studentName,
  aiUnderstandingLevel,
  aiConfidence,
  aiEvalInfo,
  aiEvidence,
}) {
  const thumbsdownval = 0;

  const studentAchievement = () => {
    const assessment =
      aiUnderstandingLevel >= RubricUnderstandingLevels.CONVINCING
        ? i18n.aiAssessmentDoesMeet()
        : i18n.aiAssessmentDoesNotMeet();
    return i18n.aiStudentAssessment({
      studentName: studentName,
      understandingLevel: assessment,
    });
  };

  const {aiFeedback, setAiFeedback} = useContext(AiAssessmentFeedbackContext);

  return (
    <div className={style.aiAssessmentInfoBlock}>
      {isAiAssessed && (
        <div className={style.aiAssessmentInfoRow}>
          <BodyFourText>
            <StrongText>Score:</StrongText> {studentAchievement()}
          </BodyFourText>
          {aiConfidence && <AiConfidenceBox aiConfidence={aiConfidence} />}
          <AiAssessmentFeedbackRadio
            onChosen={val => setAiFeedback(val)}
            aiEvalId={aiEvalInfo.id}
          />
        </div>
      )}
      {isAiAssessed && aiFeedback === thumbsdownval && (
        <AiAssessmentFeedback aiEvalInfo={aiEvalInfo} />
      )}
      {isAiAssessed && aiEvidence && aiEvidence.length > 0 && (
        <div>
          <BodyFourText className={style.aiAssessmentEvidenceBlock}>
            <StrongText>Evidence:</StrongText>
          </BodyFourText>
          <ul>
            {aiEvidence.map((info, i) => (
              <li key={i}>
                Lines {info.firstLine}-{info.lastLine}: {info.message}
              </li>
            ))}
          </ul>
        </div>
      )}
      {!isAiAssessed && <EmText>{i18n.aiCannotAssess()}</EmText>}
    </div>
  );
}

AiAssessmentBox.propTypes = {
  isAiAssessed: PropTypes.bool.isRequired,
  studentName: PropTypes.string,
  aiUnderstandingLevel: PropTypes.number,
  aiConfidence: PropTypes.number,
  aiEvalInfo: aiEvaluationShape,
  aiEvidence: PropTypes.arrayOf(aiEvidenceShape),
};
