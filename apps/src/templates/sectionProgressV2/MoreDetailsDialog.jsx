import {Typography} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import AccessibleDialog from '@cdo/apps/sharedComponents/AccessibleDialog';
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
      <Typography variant="body3" gutterBottom>
        <Typography variant="strong">{itemTitle + ': '}</Typography>
        {itemDetails}
      </Typography>
    </div>
  );

  return (
    <AccessibleDialog
      onClose={onClose}
      closeOnClickBackdrop={true}
      initialFocus={false}
    >
      <Typography variant="h3" gutterBottom>
        {i18n.progressTrackingIconKey()}
      </Typography>
      <hr />
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
      <div role="region" className={styles.dialog} tabIndex={0} ref={regionRef}>
        <Typography variant="h6" gutterBottom>
          {i18n.assignmentCompletionStates()}
        </Typography>
        {renderItem(
          ITEM_TYPE.IN_PROGRESS,
          i18n.inProgress(),
          i18n.progressLegendDetailsInProgress()
        )}
        <div className={styles.item}>
          <ProgressIcon itemType={ITEM_TYPE.SUBMITTED} />
          <div>
            <Typography variant="body3" gutterBottom>
              <Typography variant="strong">
                {i18n.submitted() + ': '}
              </Typography>
            </Typography>
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
        <Typography variant="h6" gutterBottom>
          {i18n.teacherActions()}
        </Typography>
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
        <Typography variant="h6" gutterBottom>
          {i18n.levelTypes()}
        </Typography>
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
