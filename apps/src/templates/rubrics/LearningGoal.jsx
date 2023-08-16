import React, {useState} from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import style from './rubrics.module.scss';
import {learningGoalShape, reportingDataShape} from './rubricShapes';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {
  BodyThreeText,
  BodyFourText,
} from '@cdo/apps/componentLibrary/typography';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';

export default function LearningGoal({
  learningGoal,
  teacherHasEnabledAi,
  canProvideFeedback,
  reportingData,
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
    <details className={style.learningGoalRow} onClick={handleClick}>
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
        Learning Goal Evidence Levels will be here.
      </div>
    </details>
  );
}

LearningGoal.propTypes = {
  learningGoal: learningGoalShape.isRequired,
  teacherHasEnabledAi: PropTypes.bool,
  canProvideFeedback: PropTypes.bool,
  reportingData: reportingDataShape,
};

const AiToken = () => {
  return (
    <BodyFourText className={style.aiToken}>
      {i18n.artificialIntelligenceAbbreviation()}
      <FontAwesome icon="check" title={i18n.aiAssessmentEnabled()} />
    </BodyFourText>
  );
};
