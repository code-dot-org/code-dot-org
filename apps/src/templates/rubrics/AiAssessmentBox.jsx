import React, {useContext} from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import style from './rubrics.module.scss';
import EditorAnnotator from '@cdo/apps/EditorAnnotator';
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

  // When a line number is clicked in the evidence listing
  const lineNumberClickHandler = (lineNumber, e) => {
    e.preventDefault();
    EditorAnnotator.scrollToLine(lineNumber);
  };

  const renderEvidenceItem = (evidence, i) => {
    let text = evidence.message;

    /* When the message is the same as the whole observations, this
     * was evidence that did not have a dedicated message. In this
     * case, this is where we fall back to just showing a list of
     * observations instead of the evidence. This won't have line
     * numbers and is certainly worse but better than nothing. */
    if (evidence.firstLine === undefined) {
      return <p key={i}>{text}</p>;
    } else if (evidence.firstLine === evidence.lastLine) {
      // Line [lineNumber]: [message]
      text = i18n.aiAssessmentEvidenceLine({
        lineNumber: '<><first-line><>',
        feedbackForLine: evidence.message,
      });
    } else {
      // Lines [firstLineNumber]-[lastLineNumber]: [message]
      text = i18n.aiAssessmentEvidenceLines({
        firstLineNumber: '<><first-line><>',
        lastLineNumber: '<><last-line><>',
        feedbackForLines: evidence.message,
      });
    }

    return (
      <p key={i}>
        {text.split('<>').map((subtext, k) => {
          if (subtext === '<first-line>') {
            return (
              <a
                key={`${i}-${k}`}
                href="#"
                onClick={lineNumberClickHandler.bind(this, evidence.firstLine)}
              >
                {evidence.firstLine}
              </a>
            );
          } else if (subtext === '<last-line>') {
            return (
              <a
                key={`${i}-${k}`}
                href="#"
                onClick={lineNumberClickHandler.bind(this, evidence.lastLine)}
              >
                {evidence.lastLine}
              </a>
            );
          } else {
            return <span key={`${i}-${k}`}>{subtext}</span>;
          }
        })}
      </p>
    );
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
        <div>
          <BodyFourText className={style.aiAssessmentEvidenceBlock}>
            {/* Evidence: */}
            <StrongText>{i18n.aiAssessmentEvidence()}</StrongText>
          </BodyFourText>
          <ul>
            {aiEvidence.map((info, i) => (
              <li key={i}>{renderEvidenceItem(info, i)}</li>
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
