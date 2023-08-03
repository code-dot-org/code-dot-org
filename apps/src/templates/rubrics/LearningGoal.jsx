import React, {useState} from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import style from './rubrics.module.scss';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {BodyThreeText} from '@cdo/apps/componentLibrary/typography';

export default function LearningGoal({learningGoal, canProvideFeedback}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <details
      className={style.learningGoalRow}
      onClick={() => setIsOpen(!isOpen)}
    >
      <summary className={style.learningGoalHeader}>
        <div className={style.learningGoalHeaderLeftSide}>
          {isOpen && (
            <FontAwesome icon="angle-up" onClick={() => setIsOpen(false)} />
          )}
          {!isOpen && (
            <FontAwesome icon="angle-down" onClick={() => setIsOpen(true)} />
          )}
          {learningGoal.learningGoal}
        </div>
        <div className={style.learningGoalHeaderRightSide}>
          {learningGoal.aiEnabled && <AiToken />}
          {/*TODO: Display status of feedback*/}
          {canProvideFeedback && <BodyThreeText>Needs approval</BodyThreeText>}
        </div>
      </summary>
      Learning Goal Details
    </details>
  );
}

LearningGoal.propTypes = {
  learningGoal: PropTypes.object,
  canProvideFeedback: PropTypes.bool,
};

const AiToken = () => {
  return (
    <BodyThreeText className={style.aiToken}>
      {i18n.artificialIntelligenceAbbreviation()}
      <FontAwesome icon="check" />
    </BodyThreeText>
  );
};
