import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import LegendItem from './LegendItem';
import styles from './section-progress-refresh.module.scss';
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
      <div className={styles.icons}>
        <div className={styles.legendColumn}>
          <div className={styles.legendItemContainer}>
            <LegendItem
              stateDescription={NOT_STARTED}
              labelText={i18n.notStarted()}
            />
          </div>
          <div className={styles.legendItemContainer}>
            <LegendItem fontAwesomeId="dash" labelText={i18n.noOnlineWork()} />
          </div>
        </div>
        <div className={styles.legendColumn}>
          <div className={styles.legendItemContainer}>
            <LegendItem
              fontAwesomeId="circle-o"
              labelText={i18n.inProgress()}
            />
          </div>
          <div className={styles.legendItemContainer}>
            <LegendItem
              fontAwesomeId="circle"
              fontAwesomeColor={color.product_affirmative_default}
              labelText={i18n.submitted()}
            />
          </div>
        </div>
        {isViewingLevelProgress && hasValidatedLevels && (
          <div className={styles.legendColumn}>
            <div className={styles.legendItemContainer}>
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
    <div className={styles.legend}>
      <div className={styles.headerContainer}>
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
