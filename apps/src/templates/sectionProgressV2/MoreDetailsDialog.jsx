import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import AccessibleDialog from '@cdo/apps/templates/AccessibleDialog';
import {
  Heading3,
  Heading6,
  StrongText,
  BodyThreeText,
} from '@cdo/apps/componentLibrary/typography';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {ITEM_TYPE} from './ItemType';
import ProgressIcon from './ProgressIcon';
import styles from './progress-key-popup.module.scss';
import classNames from 'classnames';

export default function MoreDetailsDialog({hasValidation, onClose}) {
  const renderBoxedItem = (itemType, size) => (
    <div className={styles.boxedItem}>
      <ProgressIcon itemType={itemType} iconSizeClass={size} />
    </div>
  );

  const renderItem = (itemType, itemTitle, itemDetails, hasBox, size) => (
    <div
      className={classNames(styles.item, {
        [styles.alignTop]:
          itemType === ITEM_TYPE.NEEDS_FEEDBACK ||
          itemType === ITEM_TYPE.CHOICE_LEVEL ||
          itemType === ITEM_TYPE.ASSESSMENT_LEVEL ||
          itemType === ITEM_TYPE.KEEP_WORKING ||
          itemType === ITEM_TYPE.SUBMITTED,
      })}
    >
      {hasBox ? (
        renderBoxedItem(itemType)
      ) : (
        <ProgressIcon itemType={itemType} iconSizeClass={size} />
      )}
      <BodyThreeText>
        <StrongText>{itemTitle + ': '}</StrongText>
        {itemDetails}
      </BodyThreeText>
    </div>
  );

  return (
    <AccessibleDialog onClose={onClose}>
      <Heading3>{i18n.progressTrackingIconKey()}</Heading3>
      <button type="button" onClick={onClose} className={styles.xCloseButton}>
        <i id="x-close" className="fa-solid fa-xmark" />
      </button>
      <hr />
      <div role="region" className={styles.dialog}>
        <Heading6>{i18n.assignmentCompletionStates()}</Heading6>
        {renderItem(
          ITEM_TYPE.NOT_STARTED,
          i18n.notStarted(),
          i18n.progressLegendDetailsNotStarted(),
          false,
          'large'
        )}
        {renderItem(
          ITEM_TYPE.NO_ONLINE_WORK,
          i18n.noOnlineWork(),
          i18n.progressLegendDetailsNoOnlineWork(),
          true
        )}
        {renderItem(
          ITEM_TYPE.IN_PROGRESS,
          i18n.inProgress(),
          i18n.progressLegendDetailsInProgress(),
          true
        )}
        <div className={styles.item}>
          {renderBoxedItem(ITEM_TYPE.SUBMITTED)}
          <div>
            <BodyThreeText>
              <StrongText>{i18n.submitted() + ': '}</StrongText>
            </BodyThreeText>
            <SafeMarkdown
              className={styles.firstMarkdown}
              markdown={i18n.progressLegendDetailsSubmittedForLessons()}
            />
            <SafeMarkdown
              markdown={i18n.progressLegendDetailsSubmittedForLevels()}
            />
          </div>
        </div>
        {hasValidation &&
          renderItem(
            ITEM_TYPE.VALIDATED,
            i18n.validated(),
            i18n.progressLegendDetailsValidated(),
            true
          )}
        <Heading6>{i18n.teacherActions()}</Heading6>
        {renderItem(
          ITEM_TYPE.NEEDS_FEEDBACK,
          i18n.needsFeedback(),
          i18n.progressLegendDetailsNeedsFeedback(),
          false,
          'large'
        )}
        {renderItem(
          ITEM_TYPE.FEEDBACK_GIVEN,
          i18n.feedbackGiven(),
          i18n.progressLegendDetailsFeedbackGiven(),
          false,
          'large'
        )}
        {renderItem(
          ITEM_TYPE.KEEP_WORKING,
          i18n.markedAsKeepWorking(),
          i18n.progressLegendDetailsKeepGoing(),
          true
        )}
        <Heading6>{i18n.levelTypes()}</Heading6>
        {renderItem(
          ITEM_TYPE.ASSESSMENT_LEVEL,
          i18n.assessmentLevel(),
          i18n.progressLegendDetailsAssessmentLevels(),
          false,
          'large'
        )}
        {renderItem(
          ITEM_TYPE.CHOICE_LEVEL,
          i18n.choiceLevel(),
          i18n.progressLegendDetailsChoiceLevels(),
          false,
          'large'
        )}
      </div>
    </AccessibleDialog>
  );
}

MoreDetailsDialog.propTypes = {
  hasValidation: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
};
