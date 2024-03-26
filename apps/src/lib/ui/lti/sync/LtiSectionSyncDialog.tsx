import React, {CSSProperties, useState} from 'react';
import i18n from '@cdo/locale';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import Button from '@cdo/apps/templates/Button';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {LmsLinks} from '@cdo/apps/util/sharedConstants';
import Spinner from '@cdo/apps/code-studio/pd/components/spinner';
import {
  LtiSectionSyncDialogProps,
  LtiSectionSyncResult,
  SubView,
} from './types';
import PropTypes from 'prop-types';
import $ from 'jquery';
import {getRosterSyncErrorMessage} from './LtiSectionSyncDialogHelpers';

// This dialog is shown to the teacher whenever they have requested Code.org to
// import/sync the teacher's sections and students managed by their LMS.
export default function LtiSectionSyncDialog({
  syncResult,
  onClose,
  disableRosterSyncButtonEnabled,
}: LtiSectionSyncDialogProps) {
  const initialView = syncResult.error ? SubView.ERROR : SubView.SYNC_RESULT;
  const [currentView, setCurrentView] = useState<SubView>(initialView);

  const handleClose = () => {
    setCurrentView(SubView.SPINNER);
    if (onClose) {
      onClose();
    }
  };

  /**
   * Displays a spinner while the dialog is waiting for an action to complete.
   */
  const spinnerView = () => {
    return (
      <div style={styles.spinnerContainer}>
        <p>
          <Spinner size={'large'} />
        </p>
        <p>{i18n.loading()}</p>
      </div>
    );
  };

  const errorView = (error: string | undefined) => {
    return (
      <div>
        <h2 style={styles.dialogHeader}>{i18n.errorOccurredTitle()}</h2>
        {error && <SafeMarkdown markdown={getRosterSyncErrorMessage(error)} />}
      </div>
    );
  };

  const disableRosterSyncView = () => {
    return (
      <div data-testid={'disable-roster-sync'}>
        <div>
          <h2 style={styles.dialogHeader}>
            {i18n.ltiSectionSyncDisableRosterSyncHeading()}
          </h2>
          <p>{i18n.ltiSectionSyncDisableRosterSyncDescription()}</p>
        </div>
        <DialogFooter>
          <Button
            color={Button.ButtonColor.brandSecondaryDefault}
            text={i18n.dialogCancel()}
            onClick={() => setCurrentView(SubView.SYNC_RESULT)}
          />
          <Button text={i18n.continue()} onClick={handleDisableRosterSync} />
        </DialogFooter>
      </div>
    );
  };

  const handleDisableRosterSync = () => {
    return $.post({
      url: `/api/v1/users/disable_lti_roster_sync`,
      success: () => {
        handleClose();
      },
    });
  };

  /**
   * Displays a summary of the changes after a successful sync with the LMS
   * @param syncResult
   */
  const syncResultView = (syncResult: LtiSectionSyncResult) => {
    const aboutSectionsUrl =
      'https://support.code.org/hc/en-us/articles/115000488132-Creating-a-Classroom-Section';
    const aboutSyncingUrl = LmsLinks.ROSTER_SYNC_INSTRUCTIONS_URL;
    const dialogTitle = i18n.ltiSectionSyncDialogTitle();
    const dialogDescription = i18n.ltiSectionSyncDialogDescription({
      aboutSectionsUrl,
      aboutSyncingUrl,
    });
    let sectionListItems;
    if (syncResult && syncResult.all) {
      sectionListItems = Object.entries(syncResult.all).map(
        ([section_id, section]) => {
          const studentCount = i18n.ltiSectionSyncDialogStudentCount({
            numberOfStudents: section.size,
          });
          return (
            <li key={section_id}>
              <b>{section.name}</b> &mdash; {studentCount}
            </li>
          );
        }
      );
    }
    return (
      <div>
        <div>
          <h2 style={styles.dialogHeader} id={'roster-sync-status'}>
            {dialogTitle}
          </h2>
          <SafeMarkdown markdown={dialogDescription} />
          <ul aria-labelledby={'roster-sync-status'}> {sectionListItems} </ul>
        </div>
        <DialogFooter rightAlign={!disableRosterSyncButtonEnabled}>
          {disableRosterSyncButtonEnabled && (
            <Button
              color={Button.ButtonColor.brandSecondaryDefault}
              text={i18n.ltiSectionSyncDisableRosterSyncButtonLabel()}
              onClick={() => setCurrentView(SubView.DISABLE_ROSTER_SYNC)}
            />
          )}
          <Button text={i18n.continue()} onClick={handleClose} />
        </DialogFooter>
      </div>
    );
  };

  const currentViewContent = () => {
    switch (currentView) {
      case SubView.SYNC_RESULT:
        return syncResultView(syncResult);
      case SubView.SPINNER:
        return spinnerView();
      case SubView.ERROR:
        return errorView(syncResult.error);
      case SubView.DISABLE_ROSTER_SYNC:
        return disableRosterSyncView();
      default:
        return <div />;
    }
  };

  const hideCloseButton = currentView === SubView.SPINNER;

  return (
    <BaseDialog
      useUpdatedStyles
      isOpen={true}
      style={styles.dialog}
      handleClose={handleClose}
      hideCloseButton={hideCloseButton}
    >
      {currentViewContent()}
    </BaseDialog>
  );
}

const styles: {[key: string]: CSSProperties} = {
  dialog: {
    padding: 20,
  },
  dialogHeader: {
    marginTop: 0,
  },
  spinnerContainer: {
    textAlign: 'center',
  },
  spinner: {
    fontSize: '32px',
  },
};

const LtiSectionShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
});
export const LtiSectionSyncResultShape = PropTypes.shape({
  all: PropTypes.objectOf(LtiSectionShape),
  updated: PropTypes.objectOf(LtiSectionShape),
  error: PropTypes.string,
});

LtiSectionSyncDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  syncResult: LtiSectionSyncResultShape.isRequired,
  onClose: PropTypes.func,
};
