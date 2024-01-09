import React from 'react';
import PropTypes from 'prop-types';
import LegendItem from './LegendItem';
import './section-progress-refresh.scss';
import {StrongText} from '@cdo/apps/componentLibrary/typography';

export default function TeacherActionsBox({isViewingLevelProgress}) {
  const legendIcons = () => {
    if (isViewingLevelProgress) {
      return (
        <div className="icons-2">
          <div className="legend-column-2">
            <div className="legend-item-2">
              <LegendItem needsFeedback={true} labelText="Needs feedback" />
            </div>
            <div className="legend-item-2">
              <LegendItem progressBoxColor="gray" labelText="Viewed" />
            </div>
          </div>
          <div className="legend-column-2">
            <div className="legend-item-2">
              <LegendItem feedbackGiven={true} labelText="Feedback given" />
            </div>
            <div className="legend-item-2">
              <LegendItem
                iconId="rotate-left"
                labelText="Marked as 'keep working'"
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
              <LegendItem iconId="star" labelText="Needs feedback" />
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="legend">
      <div className="headerContainer">
        <StrongText>Teacher Actions</StrongText>
      </div>
      <div>{legendIcons()}</div>
    </div>
  );
}

TeacherActionsBox.propTypes = {
  isViewingLevelProgress: PropTypes.bool,
};
