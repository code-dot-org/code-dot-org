import React from 'react';
import {ITEM_TYPE, ITEM_TYPE_SHAPE} from './ItemType';
import styles from './progress-table-legend.module.scss';
import FontAwesome from '../FontAwesome';
import ProgressBox from '../sectionProgress/ProgressBox';
import classNames from 'classnames';

export const PROGRESS_ICON_TITLE_PREFIX = 'progressicon-';

export default function ProgressIcon({itemType}) {
  const needsFeedbackTriangle = () => (
    <div className={classNames(styles.needsFeedback, styles.cornerBox)} />
  );

  const feedbackGivenTriangle = () => (
    <div className={classNames(styles.feedbackGiven, styles.cornerBox)} />
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

  const viewedBox = () => (
    <ProgressBox
      started={false}
      incomplete={20}
      imperfect={0}
      perfect={0}
      lessonIsAllAssessment={false}
      viewed={true}
    />
  );

  return (
    <>
      {itemType?.length && (
        <FontAwesome
          id={'uitest-' + itemType[0]}
          icon={itemType[0]}
          style={{color: itemType[1]}}
          className={styles.fontAwesomeIcon}
          title={PROGRESS_ICON_TITLE_PREFIX + itemType[0]}
        />
      )}
      {itemType === ITEM_TYPE.NOT_STARTED && notStartedBox()}
      {itemType === ITEM_TYPE.VIEWED && viewedBox()}
      {itemType === ITEM_TYPE.NEEDS_FEEDBACK && needsFeedbackTriangle()}
      {itemType === ITEM_TYPE.FEEDBACK_GIVEN && feedbackGivenTriangle()}
    </>
  );
}

ProgressIcon.propTypes = {
  itemType: ITEM_TYPE_SHAPE,
};
