import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import LegendItem from './LegendItem';
import './section-progress-refresh.scss';
import {StrongText} from '@cdo/apps/componentLibrary/typography';
import {NOT_STARTED} from './IconKey';
import color from '@cdo/apps/util/color';

export default function AssignmentCompletionStatesBox({
  isViewingLevelProgress,
  hasValidatedLevels,
}) {
  // TO-DO (TEACH-800): Fix spacing on validated levels once width on page is set
  const legendIcons = () => {
    return (
      <div className="icons-2">
        <div className="legend-column-2">
          <div className="legend-item-2">
            <LegendItem
              stateDescription={NOT_STARTED}
              labelText={i18n.notStarted()}
            />
          </div>
          <div className="legend-item-2">
            <LegendItem fontAwesomeId="dash" labelText={i18n.noOnlineWork()} />
          </div>
        </div>
        <div className="legend-column-2">
          <div className="legend-item-2">
            <LegendItem
              fontAwesomeId="circle-o"
              labelText={i18n.inProgress()}
            />
          </div>
          <div className="legend-item-2">
            <LegendItem
              fontAwesomeId="circle"
              fontAwesomeColor={color.product_affirmative_default}
              labelText={i18n.submitted()}
            />
          </div>
        </div>
        {isViewingLevelProgress && hasValidatedLevels && (
          <div className="legend-column-2">
            <div className="legend-item-2">
              <LegendItem
                labelText={i18n.validated()}
                fontAwesomeId="circle-check"
                fontAwesomeColor={color.product_affirmative_default}
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
        <StrongText>{i18n.assignmentCompletionStates()}</StrongText>
      </div>
      <div>{legendIcons()}</div>
    </div>
  );
}

AssignmentCompletionStatesBox.propTypes = {
  isViewingLevelProgress: PropTypes.bool,
  hasValidatedLevels: PropTypes.bool,
};
