import PropTypes from 'prop-types';
import React from 'react';

import {
  Heading3,
  Heading6,
  StrongText,
  BodyThreeText,
} from '@cdo/apps/componentLibrary/typography';
import AccessibleDialog from '@cdo/apps/templates/AccessibleDialog';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import i18n from '@cdo/locale';

import {ITEM_TYPE} from './ItemType';
import ProgressIcon from './ProgressIcon';

import styles from './progress-table-legend.module.scss';

export default function MoreDetailsDialog({onClose}) {
  const regionRef = React.useRef(null);
  React.useEffect(() => {
    regionRef.current.focus();
  }, [regionRef]);

  const renderItem = (itemType, itemTitle, itemDetails) => (
    <div className={styles.item}>
      <ProgressIcon itemType={itemType} />
      <BodyThreeText>
        <StrongText>{itemTitle + ': '}</StrongText>
        {itemDetails}
      </BodyThreeText>
    </div>
  );

  return (
    <AccessibleDialog
      onClose={onClose}
      closeOnClickBackdrop={true}
      initialFocus={false}
    >
      <Heading3>{i18n.progressTrackingIconKey()}</Heading3>
      <hr />
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
      <div role="region" className={styles.dialog} tabIndex={0} ref={regionRef}>
        <Heading6>{i18n.assignmentCompletionStates()}</Heading6>
        {renderItem(
          ITEM_TYPE.IN_PROGRESS,
          i18n.inProgress(),
          i18n.progressLegendDetailsInProgress()
        )}
        <div className={styles.item}>
          <ProgressIcon itemType={ITEM_TYPE.SUBMITTED} />
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
        {renderItem(
          ITEM_TYPE.VALIDATED,
          i18n.validated(),
          i18n.progressLegendDetailsValidated()
        )}
        {renderItem(
          ITEM_TYPE.NO_ONLINE_WORK,
          i18n.noOnlineWork(),
          i18n.progressLegendDetailsNoOnlineWork()
        )}
        <Heading6>{i18n.teacherActions()}</Heading6>
        {renderItem(
          ITEM_TYPE.NEEDS_FEEDBACK,
          i18n.needsFeedback(),
          i18n.progressLegendDetailsNeedsFeedback()
        )}
        {renderItem(
          ITEM_TYPE.FEEDBACK_GIVEN,
          i18n.feedbackGiven(),
          i18n.progressLegendDetailsFeedbackGiven()
        )}
        {renderItem(
          ITEM_TYPE.KEEP_WORKING,
          i18n.markedAsKeepWorking(),
          i18n.progressLegendDetailsKeepGoing()
        )}
        <Heading6>{i18n.levelTypes()}</Heading6>
        {renderItem(
          ITEM_TYPE.ASSESSMENT_LEVEL,
          i18n.assessmentLevel(),
          i18n.progressLegendDetailsAssessmentLevels()
        )}
        {renderItem(
          ITEM_TYPE.CHOICE_LEVEL,
          i18n.choiceLevel(),
          i18n.progressLegendDetailsChoiceLevels()
        )}
      </div>
    </AccessibleDialog>
  );
}

MoreDetailsDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
};
