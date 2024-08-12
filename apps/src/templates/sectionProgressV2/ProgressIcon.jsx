import classNames from 'classnames';
import React from 'react';

import FontAwesome from '../../legacySharedComponents/FontAwesome';

import {ITEM_TYPE, ITEM_TYPE_SHAPE} from './ItemType';

import styles from './progress-table-legend.module.scss';

export const PROGRESS_ICON_TITLE_PREFIX = 'progressicon-';

export default function ProgressIcon({itemType}) {
  const needsFeedbackTriangle = () => (
    <div
      className={classNames(styles.needsFeedback, styles.cornerBox)}
      aria-label={itemType['title']}
      data-testid="needs-feedback-triangle"
    />
  );

  const feedbackGivenTriangle = () => (
    <div
      className={classNames(styles.feedbackGiven, styles.cornerBox)}
      aria-label={itemType['title']}
      data-testid="feedback-given-triangle"
    />
  );

  return (
    <div data-testid="progress-icon">
      {itemType['icon'] !== undefined && (
        <FontAwesome
          id={'uitest-' + itemType['icon']}
          icon={itemType['icon']}
          style={{color: itemType['color']}}
          className={styles.fontAwesomeIcon}
          aria-label={itemType['title']}
        />
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
};
