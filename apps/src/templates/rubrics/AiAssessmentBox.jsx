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
import {UNDERSTANDING_LEVEL_STRINGS} from './rubricHelpers';

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
    const assessment = getStudentAssessmentString();
    return i18n.aiStudentAssessment({
      studentName: studentName,
      understandingLevel: assessment,
    });
  };

  // use the computed value showExactMatch to decide whether to return text
  // containing a single evidence level (exact match) or a range of two
  // evidence levels (pass fail).
  const getStudentAssessmentString = () => {
    if (aiEvalInfo.showExactMatch) {
      return UNDERSTANDING_LEVEL_STRINGS[aiUnderstandingLevel];
    }
    return aiUnderstandingLevel >= RubricUnderstandingLevels.CONVINCING
      ? i18n.aiAssessmentDoesMeet()
      : i18n.aiAssessmentDoesNotMeet();
  };

  const {aiFeedback, setAiFeedback} = useContext(AiAssessmentFeedbackContext);

  return (
    <div className={style.aiAssessmentInfoBlock}>
      {isAiAssessed && (
        <div className={style.aiAssessmentInfoRow}>
          <BodyFourText className={style.aiAssessmentScoreText}>
            {/* Score: */}
            <StrongText>{i18n.aiAssessmentScore()}</StrongText>
            <span>{studentAchievement()}</span>
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
        <div id="tour-ai-evidence">
          <BodyFourText className={style.aiAssessmentEvidenceBlock}>
            {/* Evidence: */}
            <StrongText>{i18n.aiAssessmentEvidence()}</StrongText>
          </BodyFourText>
          <ul>
            {
              /* When the message is the same as the whole observations, this
               * was evidence that did not have a dedicated message. In this
               * case, this is where we fall back to just showing a list of
               * observations instead of the evidence. This won't have line
               * numbers and is certainly worse but better than nothing. */
              (
                aiEvidence
                  .filter(info => info && info.observations === info.message)
                  .map(info => info.observations)[0] || ''
              )
                .split('. ')
                .map(
                  (line, i) =>
                    line.trim() && (
                      <li key={i}>
                        {/* Just the observation as a whole */}
                        {line.endsWith('.') ? line : line + '.'}
                      </li>
                    )
                )
            }
            {aiEvidence
              .filter(info => info && info.observations !== info.message)
              .map(
                (info, i) =>
                  info &&
                  info.firstLine && (
                    <li key={i}>
                      {/* Lines [firstLine]-[lastLine]: [message] */}
                      {info.firstLine === info.lastLine &&
                        i18n.aiAssessmentEvidenceLine({
                          lineNumber: info.firstLine,
                          feedbackForLine: info.message,
                        })}
                      {info.firstLine !== info.lastLine &&
                        i18n.aiAssessmentEvidenceLines({
                          firstLineNumber: info.firstLine,
                          lastLineNumber: info.lastLine,
                          feedbackForLines: info.message,
                        })}
                    </li>
                  )
              )}
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
