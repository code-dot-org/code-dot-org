import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React from 'react';

import {ITEM_TYPE, ITEM_TYPE_SHAPE} from './ItemType';

import styles from './progress-table-legend.module.scss';

export const PROGRESS_ICON_TITLE_PREFIX = 'progressicon-';

export default function ProgressIcon({itemType}) {
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
      {itemType['icon'] !== undefined && (
        <FontAwesomeV6Icon
          id={'uitest-' + itemType['icon']}
          iconName={itemType['icon']}
          iconStyle={itemType['iconStyle'] || 'solid'}
          className={classNames(
            styles.fontAwesomeIcon,
            styles[`icon-${itemType['color']}`]
          )}
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
