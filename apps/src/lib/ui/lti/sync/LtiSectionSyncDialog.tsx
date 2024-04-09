import React, {CSSProperties, useState} from 'react';
import i18n from '@cdo/locale';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import Button from '@cdo/apps/templates/Button';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {LmsLinks} from '@cdo/apps/util/sharedConstants';
import Spinner from '@cdo/apps/code-studio/pd/components/spinner';
import {
  LtiSection,
  LtiSectionMap,
  LtiSectionSyncDialogProps,
  LtiSectionSyncResult,
  SubView,
} from './types';
import PropTypes from 'prop-types';
import $ from 'jquery';
import {getRosterSyncErrorMessage} from './LtiSectionSyncDialogHelpers';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {PLATFORMS} from '@cdo/apps/lib/util/AnalyticsConstants';

// This dialog is shown to the teacher whenever they have requested Code.org to
// import/sync the teacher's sections and students managed by their LMS.
export default function LtiSectionSyncDialog({
  syncResult,
  onClose,
  disableRosterSyncButtonEnabled,
  lmsName,
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

  const errorView = (syncResult: LtiSectionSyncResult) => {
    const errorMessages = getRosterSyncErrorMessage(syncResult).split('\n');

    return (
      <div>
        <h2 style={styles.dialogHeader}>{i18n.errorOccurredTitle()}</h2>
        {errorMessages.map((errorMessage: string, index: React.Key) => (
          <SafeMarkdown key={index} markdown={errorMessage} />
        ))}
      </div>
    );
  };

  const disableRosterSyncView = () => {
    const eventPayload = {
      lms_name: lmsName,
    };
    analyticsReporter.sendEvent(
      'lti_opt_out_click',
      eventPayload,
      PLATFORMS.STATSIG
    );
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
        const eventPayload = {
          lms_name: lmsName,
        };
        analyticsReporter.sendEvent(
          'lti_opt_out_confirm',
          eventPayload,
          PLATFORMS.STATSIG
        );
        handleClose();
      },
    });
  };

  const handleDocsClick = () => {
    const eventPayload = {
      lms_name: lmsName,
    };
    analyticsReporter.sendEvent(
      'lti_opt_out_documentation',
      eventPayload,
      PLATFORMS.STATSIG
    );
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
    let dialogDescription, sectionsTable;
    if (syncResult?.changed && Object.keys(syncResult.changed).length > 0) {
      dialogDescription = i18n.ltiSectionSyncDialogDescription({
        aboutSectionsUrl,
        aboutSyncingUrl,
      });
      sectionsTable = SyncSummaryTable(syncResult.changed);
    } else {
      dialogDescription = i18n.ltiSectionSyncDialogDescriptionNoChange({
        aboutSyncingUrl,
      });
    }

    return (
      <div>
        <div>
          <h2 style={styles.dialogHeader} id={'roster-sync-status'}>
            {dialogTitle}
          </h2>
          <div onClick={handleDocsClick}>
            <SafeMarkdown markdown={dialogDescription} />
          </div>
          <div
            style={styles.summaryContainer}
            aria-labelledby={'roster-sync-status'}
          >
            {syncResult.course_name && (
              <p style={styles.courseNameText}>
                <span style={styles.courseNameLabel}>
                  {i18n.ltiSectionSyncDialogCourseLabel()}:
                </span>
                {syncResult.course_name}
              </p>
            )}
            {sectionsTable}
          </div>
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
        return errorView(syncResult);
      case SubView.DISABLE_ROSTER_SYNC:
        return disableRosterSyncView();
      default:
        return <div />;
    }
  };

  const hideCloseButton = currentView === SubView.SPINNER;

  const SectionRow = (id: string, section: LtiSection) => {
    const sectionOwnerName = section.instructors.find(
      instructor => instructor.isOwner
    )?.name;
    return (
      <tr key={id} role={'gridcell'}>
        <td style={styles.tableCellText}>{section.short_name}</td>
        <td style={styles.tableCellText}>{sectionOwnerName}</td>
        <td style={styles.tableCellNumber}>{section.size}</td>
        <td style={styles.tableCellNumber}>{section.instructors.length}</td>
      </tr>
    );
  };

  const SyncSummaryTable = (sections: LtiSectionMap) => {
    return (
      <table style={styles.summaryTable} role={'grid'}>
        <thead>
          <tr>
            <th style={styles.tableHeaderLeft}>
              {i18n.ltiSectionSyncDialogHeaderSectionName()}
            </th>
            <th style={styles.tableHeaderLeft}>
              {i18n.ltiSectionSyncDialogHeaderPrimaryInstructor()}
            </th>
            <th style={styles.tableHeaderCenter}>
              {i18n.ltiSectionSyncDialogHeaderStudents()}
            </th>
            <th style={styles.tableHeaderCenter}>
              {i18n.ltiSectionSyncDialogHeaderInstructors()}
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(sections).map(([id, section]) =>
            SectionRow(id, section)
          )}
        </tbody>
      </table>
    );
  };

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
  summaryContainer: {
    marginTop: 30,
  },
  summaryTable: {
    width: '100%',
  },
  tableHeaderCenter: {
    textAlign: 'center',
    backgroundColor: 'transparent',
    color: '#0093a4',
    fontSize: '13px',
    fontWeight: 500,
    paddingLeft: 0,
  },
  tableHeaderLeft: {
    textAlign: 'left',
    backgroundColor: 'transparent',
    color: '#0093a4',
    fontSize: '13px',
    fontWeight: 500,
    paddingLeft: 0,
  },
  tableCellNumber: {
    textAlign: 'center',
    fontWeight: 500,
  },
  tableCellText: {
    textAlign: 'left',
    fontWeight: 500,
  },
  courseNameLabel: {
    fontWeight: 500,
    color: '#0093a4',
    marginRight: '10px',
  },
  courseNameText: {
    fontWeight: 500,
  },
};

const LtiSectionShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
});
export const LtiSectionSyncResultShape = PropTypes.shape({
  all: PropTypes.objectOf(LtiSectionShape),
  changed: PropTypes.objectOf(LtiSectionShape),
  error: PropTypes.string,
});

LtiSectionSyncDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  syncResult: LtiSectionSyncResultShape.isRequired,
  onClose: PropTypes.func,
  lmsName: PropTypes.string.isRequired,
};
