import React from 'react';
import {ITEM_TYPE, ITEM_TYPE_SHAPE} from './ItemType';
import styles from './progress-table-legend.module.scss';
import FontAwesome from '../FontAwesome';
import ProgressBox from '../sectionProgress/ProgressBox';
import classNames from 'classnames';

export const PROGRESS_ICON_TITLE_PREFIX = 'progressicon-';

export default function ProgressIcon({itemType, colorOverride}) {
  const needsFeedbackTriangle = () => (
    <div
      className={classNames(styles.needsFeedback, styles.cornerBox)}
      data-testid="needs-feedback-triangle"
    />
  );

  const feedbackGivenTriangle = () => (
    <div
      className={classNames(styles.feedbackGiven, styles.cornerBox)}
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
    />
  );

  /*   Note that we decided not to have a viewedBox icon in this iteration
  of the icon key.  However, this may be part of a future iteration
  of the IconKey. If so, this is the approach we took to rendering it
  const viewedBox = () => (
    <ProgressBox
      started={false}
      incomplete={20}
      imperfect={0}
      perfect={0}
      lessonIsAllAssessment={false}
      viewed={true}
    />
  ); */

  return (
    <div data-testid="progress-icon">
      {itemType?.length && (
        <FontAwesome
          id={'uitest-' + itemType[0]}
          icon={itemType[0]}
          style={{color: colorOverride ? colorOverride : itemType[1]}}
          className={styles.fontAwesomeIcon}
          aria-label={PROGRESS_ICON_TITLE_PREFIX + itemType[0]}
        />
      )}
      {itemType === ITEM_TYPE.NOT_STARTED && notStartedBox()}
      {itemType === ITEM_TYPE.NEEDS_FEEDBACK && needsFeedbackTriangle()}
      {itemType === ITEM_TYPE.FEEDBACK_GIVEN && feedbackGivenTriangle()}
    </div>
  );
}

ProgressIcon.propTypes = {
  itemType: ITEM_TYPE_SHAPE,
};
