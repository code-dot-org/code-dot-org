import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';
import AccessibleDialog from '@cdo/apps/templates/AccessibleDialog';
import {
  Heading3,
  Heading6,
  StrongText,
} from '@cdo/apps/componentLibrary/typography';
import {ITEM_TYPE} from './ItemType';
import ProgressIcon from './ProgressIcon';
import styles from './progress-key-popup.module.scss';
import {BodyThreeText} from '@cdo/apps/componentLibrary/typography';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

export default function MoreDetailsDialog({hasValidation, onClose}) {
  const validatedLevelsContent = () => (
    <div className={styles.item}>
      <ProgressIcon itemType={ITEM_TYPE.VALIDATED} />
      <BodyThreeText>
        <StrongText>{i18n.validated() + ': '}</StrongText>
        {i18n.progressLegendDetailsValidated()}
      </BodyThreeText>
    </div>
  );
  return (
    <AccessibleDialog onClose={onClose}>
      <div role="region" className={styles.dialog}>
        <Heading3>{i18n.progressTrackingIconKey()}</Heading3>
        <button type="button" onClick={onClose} className={styles.xCloseButton}>
          <i id="x-close" className="fa-solid fa-xmark" />
        </button>
        <hr />
        <Heading6>{i18n.assignmentCompletionStates()}</Heading6>
        <div className={styles.iconDefinition}>
          <div className={styles.item}>
            <ProgressIcon itemType={ITEM_TYPE.NOT_STARTED} />
            <BodyThreeText>
              <StrongText>{i18n.notStarted() + ': '}</StrongText>
              {i18n.progressLegendDetailsNotStarted()}
            </BodyThreeText>
          </div>
          <div className={styles.item}>
            <ProgressIcon itemType={ITEM_TYPE.NO_ONLINE_WORK} />
            <BodyThreeText>
              <StrongText>{i18n.noOnlineWork() + ': '}</StrongText>
              {i18n.progressLegendDetailsNoOnlineWork()}
            </BodyThreeText>
          </div>
          <div className={styles.item}>
            <ProgressIcon itemType={ITEM_TYPE.IN_PROGRESS} />
            <BodyThreeText>
              <StrongText>{i18n.inProgress() + ': '}</StrongText>
              {i18n.progressLegendDetailsInProgress()}
            </BodyThreeText>
          </div>
          <div className={styles.item}>
            <ProgressIcon itemType={ITEM_TYPE.SUBMITTED} />
            <BodyThreeText>
              <StrongText>{i18n.submitted() + ': '}</StrongText>
              <SafeMarkdown
                markdown={i18n.progressLegendDetailsSubmittedForLessons()}
              />
              <SafeMarkdown
                markdown={i18n.progressLegendDetailsSubmittedForLevels()}
              />
            </BodyThreeText>
          </div>
          {hasValidation && validatedLevelsContent()}
          <div className={styles.item}>
            <ProgressIcon itemType={ITEM_TYPE.KEEP_WORKING} />
            <BodyThreeText>
              <StrongText>{i18n.markedAsKeepWorking() + ': '}</StrongText>
              {i18n.progressLegendDetailsKeepGoing()}
            </BodyThreeText>
          </div>
        </div>
        <Heading6>{i18n.teacherActions()}</Heading6>
        <div className={styles.iconDefinition}>
          <div className={styles.item}>
            <ProgressIcon itemType={ITEM_TYPE.NEEDS_FEEDBACK} />
            <BodyThreeText>
              <StrongText>{i18n.needsFeedback() + ': '}</StrongText>
              {i18n.progressLegendDetailsNeedsFeedback()}
            </BodyThreeText>
          </div>
          <div className={styles.item}>
            <ProgressIcon itemType={ITEM_TYPE.VIEWED} />
            <BodyThreeText>
              <StrongText>{i18n.viewed() + ': '}</StrongText>
              {i18n.progressLegendDetailsViewed()}
            </BodyThreeText>
          </div>
          <div className={styles.item}>
            <ProgressIcon itemType={ITEM_TYPE.FEEDBACK_GIVEN} />
            <BodyThreeText>
              <StrongText>{i18n.feedbackGiven() + ': '}</StrongText>
              {i18n.progressLegendDetailsFeedbackGiven()}
            </BodyThreeText>
          </div>
        </div>
        <Heading6>{i18n.levelTypes()}</Heading6>
        <div className={styles.iconDefinition}>
          <div className={styles.item}>
            <ProgressIcon itemType={ITEM_TYPE.ASSESSMENT_LEVEL} />
            <BodyThreeText>
              <StrongText>{i18n.assessmentLevel() + ': '}</StrongText>
              {i18n.progressLegendDetailsAssessmentLevels()}
            </BodyThreeText>
          </div>
          <div className={styles.item}>
            <ProgressIcon itemType={ITEM_TYPE.CHOICE_LEVEL} />
            <BodyThreeText>
              <StrongText>{i18n.choiceLevel() + ': '}</StrongText>
              {i18n.progressLegendDetailsChoiceLevels()}
            </BodyThreeText>
          </div>
        </div>
      </div>
    </AccessibleDialog>
  );
}

MoreDetailsDialog.propTypes = {
  hasValidation: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
};
