import React, {useState} from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import style from './rubrics.module.scss';
import {learningGoalShape} from './rubricShapes';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {
  BodyThreeText,
  BodyFourText,
  Heading6,
} from '@cdo/apps/componentLibrary/typography';
import EvidenceLevels from './EvidenceLevels';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

export default function LearningGoal({
  learningGoal,
  teacherHasEnabledAi,
  canProvideFeedback,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const aiEnabled = learningGoal.aiEnabled && teacherHasEnabledAi;

  return (
    <details
      className={style.learningGoalRow}
      onClick={() => setIsOpen(!isOpen)}
    >
      <summary className={style.learningGoalHeader}>
        <div className={style.learningGoalHeaderLeftSide}>
          {isOpen && (
            <FontAwesome
              icon="angle-up"
              onClick={() => setIsOpen(false)}
              className={style.arrowIcon}
            />
          )}
          {!isOpen && (
            <FontAwesome
              icon="angle-down"
              onClick={() => setIsOpen(true)}
              className={style.arrowIcon}
            />
          )}
          {/*TODO: [DES-321] Label-two styles here*/}
          <span>{learningGoal.learningGoal}</span>
        </div>
        <div className={style.learningGoalHeaderRightSide}>
          {aiEnabled && <AiToken />}
          {/*TODO: Display status of feedback*/}
          {canProvideFeedback && <BodyThreeText>Needs approval</BodyThreeText>}
        </div>
      </summary>
      <div className={style.learningGoalExpanded}>
        <EvidenceLevels
          learningGoalKey={learningGoal.key}
          evidenceLevels={learningGoal.evidenceLevels}
          canProvideFeedback={canProvideFeedback}
        />
        {learningGoal.tips && (
          <div>
            <Heading6>{i18n.tipsForEvaluation()}</Heading6>
            <div className={style.learningGoalTips}>
              <SafeMarkdown markdown={learningGoal.tips} />
            </div>
          </div>
        )}
      </div>
    </details>
  );
}

LearningGoal.propTypes = {
  learningGoal: learningGoalShape.isRequired,
  teacherHasEnabledAi: PropTypes.bool,
  canProvideFeedback: PropTypes.bool,
};

const AiToken = () => {
  return (
    <BodyFourText className={style.aiToken}>
      {i18n.artificialIntelligenceAbbreviation()}
      <FontAwesome icon="check" title={i18n.aiAssessmentEnabled()} />
    </BodyFourText>
  );
};
