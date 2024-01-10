import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import LegendItem from './LegendItem';
import './section-progress-refresh.scss';
import {StrongText} from '@cdo/apps/componentLibrary/typography';
import {VIEWED, NEEDS_FEEDBACK, FEEDBACK_GIVEN} from './IconKey';

export default function TeacherActionsBox({isViewingLevelProgress}) {
  const legendIcons = () => {
    if (isViewingLevelProgress) {
      return (
        <div className="icons-2">
          <div className="legend-column-2">
            <div className="legend-item-2">
              <LegendItem
                stateDescription={NEEDS_FEEDBACK}
                labelText={i18n.needsFeedback()}
              />
            </div>
            <div className="legend-item-2">
              <LegendItem stateDescription={VIEWED} labelText={i18n.viewed()} />
            </div>
          </div>
          <div className="legend-column-2">
            <div className="legend-item-2">
              <LegendItem
                stateDescription={FEEDBACK_GIVEN}
                labelText={i18n.feedbackGiven()}
              />
            </div>
            <div className="legend-item-2">
              <LegendItem
                fontAwesomeId="rotate-left"
                labelText={i18n.markedAsKeepWorking()}
              />
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="icons">
          <div>
            <div>
              <LegendItem
                stateDescription={NEEDS_FEEDBACK}
                labelText={i18n.needsFeedback()}
              />
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="legend">
      <div className="headerContainer">
        <StrongText>{i18n.teacherActions()}</StrongText>
      </div>
      <div>{legendIcons()}</div>
    </div>
  );
}

TeacherActionsBox.propTypes = {
  isViewingLevelProgress: PropTypes.bool,
};
