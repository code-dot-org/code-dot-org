import React from 'react';
import PropTypes from 'prop-types';
import LegendItem from './LegendItem';
import './section-progress-refresh.scss';
import {StrongText} from '@cdo/apps/componentLibrary/typography';

export default function AssignmentCompletionStatesBox({
  isViewingLevelProgress,
  hasValidatedLevels,
}) {
  const legendIcons = () => {
    return (
      <div className="icons-2">
        <div className="legend-column-2">
          <div className="legend-item-2">
            <LegendItem progressBoxColor="white" labelText="Not started" />
          </div>
          <div className="legend-item-2">
            <LegendItem iconId="dash" labelText="No online work" />
          </div>
        </div>
        <div className="legend-column-2">
          <div className="legend-item-2">
            <LegendItem iconId="circle-o" labelText="In progress" />
          </div>
          <div className="legend-item-2">
            <LegendItem
              iconId="circle"
              iconColor="green"
              labelText="Submitted"
            />
          </div>
        </div>
        {isViewingLevelProgress && hasValidatedLevels && (
          <div className="legend-column-2">
            <div className="legend-item-2">
              <LegendItem
                iconId="circle-check"
                labelText="Validated"
                iconColor="green"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="legend">
      <div className="headerContainer">
        <StrongText>Assignment Completion States</StrongText>
      </div>
      <div>{legendIcons()}</div>
    </div>
  );
}

AssignmentCompletionStatesBox.propTypes = {
  isViewingLevelProgress: PropTypes.bool,
  hasValidatedLevels: PropTypes.bool,
};
