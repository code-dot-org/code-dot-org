import PropTypes from 'prop-types';
import React, {useState} from 'react';
import i18n from '@cdo/locale';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import Button from '@cdo/apps/templates/Button';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import Spinner from '@cdo/apps/code-studio/pd/components/spinner';

// This dialog is shown to the teacher whenever they have requested Code.org to
// import/sync the teacher's sections and students managed by their LMS.
export default function LtiSectionSyncDialog(props) {
  const SYNC_RESULT_VIEW = 'syncResult';
  const SPINNER_VIEW = 'spinner';
  const ERROR_VIEW = 'error';
  const {syncResult, onClose} = props;
  const initialView = syncResult.error ? ERROR_VIEW : SYNC_RESULT_VIEW;
  const [currentView, setCurrentView] = useState(initialView);

  const handleClose = () => {
    setCurrentView(SPINNER_VIEW);
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

  const errorView = error => {
    return (
      <div>
        <h2 style={styles.dialogHeader}>{i18n.errorOccurredTitle()}</h2>
        <p>{i18n.ltiSectionSyncDialogError()}</p>
        <p>{error}</p>
      </div>
    );
  };

  /**
   * Displays a summary of the changes after a successful sync with the LMS
   * @param syncResult
   */
  const syncResultView = syncResult => {
    const aboutSectionsUrl = '/sections';
    const aboutSyncingUrl = '/syncing';
    const dialogTitle = i18n.ltiSectionSyncDialogTitle();
    const dialogDescription = i18n.ltiSectionSyncDialogDescription({
      aboutSectionsUrl: aboutSectionsUrl,
      aboutSyncingUrl: aboutSyncingUrl,
    });
    let sectionListItems;
    if (syncResult) {
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
          <h2 style={styles.dialogHeader}>{dialogTitle}</h2>
          <SafeMarkdown markdown={dialogDescription} />
          <ul> {sectionListItems} </ul>
        </div>
        <DialogFooter rightAlign>
          <Button
            text={'Continue'}
            onClick={handleClose}
            color={Button.ButtonColor.brandPrimaryDefault}
          />
        </DialogFooter>
      </div>
    );
  };

  let currentViewContent;
  switch (currentView) {
    case SYNC_RESULT_VIEW:
      currentViewContent = syncResultView(syncResult);
      break;
    case SPINNER_VIEW:
      currentViewContent = spinnerView();
      break;
    case ERROR_VIEW:
      currentViewContent = errorView(syncResult.error);
      break;
    default:
      currentViewContent = <div />;
  }
  const hideCloseButton = currentView === SPINNER_VIEW;

  return (
    <BaseDialog
      useUpdatedStyles
      isOpen={true}
      style={styles.dialog}
      handleClose={handleClose}
      hideCloseButton={hideCloseButton}
    >
      {currentViewContent}
    </BaseDialog>
  );
}

const styles = {
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
