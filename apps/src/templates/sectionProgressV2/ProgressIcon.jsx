import classNames from 'classnames';
import React from 'react';

import FontAwesome from '../FontAwesome';

import {ITEM_TYPE, ITEM_TYPE_SHAPE} from './ItemType';

import styles from './progress-table-legend.module.scss';

export const PROGRESS_ICON_TITLE_PREFIX = 'progressicon-';

export default function ProgressIcon({itemType}) {
  const needsFeedbackTriangle = () => (
    <div
      className={classNames(styles.needsFeedback, styles.cornerBox)}
      aria-label={itemType[0]}
      data-testid="needs-feedback-triangle"
    />
  );

  const feedbackGivenTriangle = () => (
    <div
      className={classNames(styles.feedbackGiven, styles.cornerBox)}
      aria-label={itemType[0]}
      data-testid="feedback-given-triangle"
    />
  );

  return (
    <div data-testid="progress-icon">
      {itemType[2] !== undefined && (
        <FontAwesome
          id={'uitest-' + itemType[1]}
          icon={itemType[1]}
          style={{color: itemType[2]}}
          className={styles.fontAwesomeIcon}
          aria-label={itemType[0]}
        />
      )}
      {itemType === ITEM_TYPE.NEEDS_FEEDBACK && needsFeedbackTriangle()}
      {itemType === ITEM_TYPE.FEEDBACK_GIVEN && feedbackGivenTriangle()}
    </div>
  );
}

ProgressIcon.propTypes = {
  itemType: ITEM_TYPE_SHAPE,
};
