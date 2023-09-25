import React, {useState} from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import classnames from 'classnames';
import style from './rubrics.module.scss';
import {learningGoalShape, reportingDataShape} from './rubricShapes';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {
  BodyThreeText,
  BodyFourText,
  ExtraStrongText,
  Heading6,
} from '@cdo/apps/componentLibrary/typography';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import EvidenceLevels from './EvidenceLevels';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import AiAssessment from './AiAssessment';

export default function LearningGoal({
  learningGoal,
  teacherHasEnabledAi,
  canProvideFeedback,
  reportingData,
  studentName,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const aiEnabled = learningGoal.aiEnabled && teacherHasEnabledAi;

  const handleClick = () => {
    const eventName = isOpen
      ? EVENTS.RUBRIC_LEARNING_GOAL_COLLAPSED_EVENT
      : EVENTS.RUBRIC_LEARNING_GOAL_EXPANDED_EVENT;
    analyticsReporter.sendEvent(eventName, {
      ...(reportingData || {}),
      learningGoalKey: learningGoal.key,
      learningGoal: learningGoal.learningGoal,
    });
    setIsOpen(!isOpen);
  };

  return (
    <details className={style.learningGoalRow}>
      <summary className={style.learningGoalHeader} onClick={handleClick}>
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
        {/*TODO: Pass through data to child component*/}
        {aiEnabled && (
          <AiAssessment
            isAiAssessed={learningGoal.aiEnabled}
            studentName={studentName}
            aiConfidence={50}
            aiUnderstandingLevel={3}
          />
        )}
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
  reportingData: reportingDataShape,
  studentName: PropTypes.string,
};

const AiToken = () => {
  return (
    <div>
      {' '}
      <BodyFourText className={classnames(style.aiToken, style.aiTokenText)}>
        <ExtraStrongText>
          {i18n.artificialIntelligenceAbbreviation()}
        </ExtraStrongText>

        <FontAwesome icon="check" title={i18n.aiAssessmentEnabled()} />
      </BodyFourText>
    </div>
  );
};
