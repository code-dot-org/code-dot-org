import React from 'react';
import PropTypes from 'prop-types';
import {ITEM_TYPE, ITEM_TYPE_SHAPE} from './ItemType';
import styles from './progress-table-legend.module.scss';
import FontAwesome from '../FontAwesome';
import ProgressBox from '../sectionProgress/ProgressBox';
import classNames from 'classnames';
import {REGULAR_PROGRESS_BOX_SIZE} from '../sectionProgress/ProgressBox';

export const PROGRESS_ICON_TITLE_PREFIX = 'progressicon-';
const LARGE_BOX_SIZE = 28;

export default function ProgressIcon({itemType, iconSizeClass}) {
  const applyLargeStyles = iconSizeClass == 'large';

  const needsFeedbackTriangle = () => (
    <div
      className={
        applyLargeStyles
          ? classNames(styles.largeNeedsFeedback, styles.largeCornerBox)
          : classNames(styles.needsFeedback, styles.cornerBox)
      }
      data-testid="needs-feedback-triangle"
    />
  );

  const feedbackGivenTriangle = () => (
    <div
      className={
        applyLargeStyles
          ? classNames(styles.largeFeedbackGiven, styles.largeCornerBox)
          : classNames(styles.feedbackGiven, styles.cornerBox)
      }
      data-testid="feedback-given-triangle"
    />
  );

  const notStartedBox = () => (
    <ProgressBox
      started={false}
      incomplete={20}
      imperfect={0}
      perfect={0}
      lessonIsAllAssessment={false}
      progressBoxSize={
        applyLargeStyles ? LARGE_BOX_SIZE : REGULAR_PROGRESS_BOX_SIZE
      }
    />
  );

  const viewedBox = () => (
    <ProgressBox
      started={false}
      incomplete={20}
      imperfect={0}
      perfect={0}
      lessonIsAllAssessment={false}
      viewed={true}
      progressBoxSize={
        applyLargeStyles ? LARGE_BOX_SIZE : REGULAR_PROGRESS_BOX_SIZE
      }
    />
  );

  return (
    <div data-testid="progress-icon">
      {itemType?.length && (
        <FontAwesome
          id={'uitest-' + itemType[0]}
          icon={itemType[0]}
          style={{color: itemType[1]}}
          className={
            applyLargeStyles
              ? classNames(styles.largeFontAwesomeIcon)
              : classNames(styles.fontAwesomeIcon)
          }
          aria-label={PROGRESS_ICON_TITLE_PREFIX + itemType[0]}
        />
      )}
      {itemType === ITEM_TYPE.NOT_STARTED && notStartedBox()}
      {itemType === ITEM_TYPE.VIEWED && viewedBox()}
      {itemType === ITEM_TYPE.NEEDS_FEEDBACK && needsFeedbackTriangle()}
      {itemType === ITEM_TYPE.FEEDBACK_GIVEN && feedbackGivenTriangle()}
    </div>
  );
}

ProgressIcon.propTypes = {
  itemType: ITEM_TYPE_SHAPE,
  iconSizeClass: PropTypes.string,
};
