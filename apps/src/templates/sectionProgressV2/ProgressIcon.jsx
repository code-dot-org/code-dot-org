import classNames from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

import FontAwesome from '../../legacySharedComponents/FontAwesome';

import {ITEM_TYPE, ITEM_TYPE_SHAPE} from './ItemType';

import styles from './progress-table-legend.module.scss';

export const PROGRESS_ICON_TITLE_PREFIX = 'progressicon-';

export default function ProgressIcon({itemType, completedPercent = null}) {
  const needsFeedbackTriangle = () => (
    <div
      className={classNames(styles.needsFeedback, styles.cornerBox)}
      aria-label={itemType['title']}
      // eslint-disable-next-line react/forbid-dom-props
      data-testid="needs-feedback-triangle"
    />
  );

  const feedbackGivenTriangle = () => (
    <div
      className={classNames(styles.feedbackGiven, styles.cornerBox)}
      aria-label={itemType['title']}
      // eslint-disable-next-line react/forbid-dom-props
      data-testid="feedback-given-triangle"
    />
  );

  return (
    // eslint-disable-next-line react/forbid-dom-props
    <div data-testid="progress-icon">
      {completedPercent === null && itemType['icon'] !== undefined && (
        <FontAwesome
          id={'uitest-' + itemType['icon']}
          icon={itemType['icon']}
          className={classNames(
            styles.fontAwesomeIcon,
            styles[`icon-${itemType['color']}`]
          )}
          aria-label={itemType['title']}
        />
      )}
      {completedPercent !== null && itemType === ITEM_TYPE.IN_PROGRESS && (
        <div
          className={styles.completedPercent}
          aria-label={`${itemType['title']} ${completedPercent}%`}
        >
          {_.round(completedPercent)}%
        </div>
      )}
      {itemType === ITEM_TYPE.NEEDS_FEEDBACK && needsFeedbackTriangle()}
      {itemType === ITEM_TYPE.FEEDBACK_GIVEN && feedbackGivenTriangle()}
      {itemType === ITEM_TYPE.NO_PROGRESS && (
        <div aria-label={itemType['title']} className={styles.emptyBox} />
      )}
    </div>
  );
}

ProgressIcon.propTypes = {
  itemType: ITEM_TYPE_SHAPE.isRequired,
  completedPercent: PropTypes.number,
};
