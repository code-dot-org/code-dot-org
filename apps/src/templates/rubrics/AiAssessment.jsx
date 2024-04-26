import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import style from './rubrics.module.scss';
import {Heading6, StrongText} from '@cdo/apps/componentLibrary/typography';
import AiAssessmentBox from './AiAssessmentBox';
import {aiEvaluationShape, aiEvidenceShape} from './rubricShapes';
import aiBotImage from './images/AiBot_2x.png';

export default function AiAssessment({
  isAiAssessed,
  studentName,
  aiUnderstandingLevel,
  aiConfidence,
  aiEvidence,
  aiEvalInfo,
}) {
  return (
    <div id="tour-ai-assessment" className="uitest-ai-assessment">
      <Heading6 visualAppearance={'body-three'}>
        <StrongText>{i18n.aiAssessment()}</StrongText>
      </Heading6>
      <div className={style.aiAssessmentBlock}>
        <img alt={i18n.aiBot()} src={aiBotImage} className={style.aiBotImg} />
        <AiAssessmentBox
          isAiAssessed={isAiAssessed}
          aiEvidence={aiEvidence}
          aiUnderstandingLevel={aiUnderstandingLevel}
          studentName={studentName}
          aiEvalInfo={aiEvalInfo}
          aiConfidence={aiConfidence}
        />
      </div>
    </div>
  );
}

AiAssessment.propTypes = {
  isAiAssessed: PropTypes.bool.isRequired,
  studentName: PropTypes.string,
  aiUnderstandingLevel: PropTypes.number,
  aiConfidence: PropTypes.number,
  aiEvidence: PropTypes.arrayOf(aiEvidenceShape),
  aiEvalInfo: aiEvaluationShape,
};
