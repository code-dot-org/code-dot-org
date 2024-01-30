import React from 'react';
import PropTypes from 'prop-types';
import styles from './progress-table-legend.module.scss';
import {BodyThreeText} from '@cdo/apps/componentLibrary/typography';
import color from '@cdo/apps/util/color';
import FontAwesome from '../FontAwesome';
import ProgressBox from '../sectionProgress/ProgressBox';
import classNames from 'classnames';

export const ITEM_TYPE = Object.freeze({
  NOT_STARTED: 1,
  VIEWED: 2,
  NEEDS_FEEDBACK: 3,
  FEEDBACK_GIVEN: 4,
  ASSESSMENT_LEVEL: ['star', color.neutral_dark],
  CHOICE_LEVEL: ['split', color.neutral_dark],
  KEEP_WORKING: ['rotate-left', color.neutral_dark],
  NO_ONLINE_WORK: ['dash', color.neutral_dark],
  IN_PROGRESS: ['circle-o', color.neutral_dark],
  SUBMITTED: ['circle', color.product_affirmative_default],
  VALIDATED: ['circle-check', color.product_affirmative_default],
});

export default function LegendItem({itemType, labelText}) {
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
    <div className={styles.legendItem}>
      {itemType?.length && (
        <FontAwesome
          id={'uitest-' + itemType[0]}
          icon={itemType[0]}
          style={{color: itemType[1]}}
          className={styles.fontAwesomeIcon}
        />
      )}
      {itemType === ITEM_TYPE.NOT_STARTED && notStartedBox()}
      {itemType === ITEM_TYPE.VIEWED && viewedBox()}
      {itemType === ITEM_TYPE.NEEDS_FEEDBACK && needsFeedbackTriangle()}
      {itemType === ITEM_TYPE.FEEDBACK_GIVEN && feedbackGivenTriangle()}
      <BodyThreeText className={styles.labelText}>{labelText}</BodyThreeText>
    </div>
  );
}

LegendItem.propTypes = {
  labelText: PropTypes.string,
  itemType: PropTypes.oneOf(Object.values(ITEM_TYPE)),
};
