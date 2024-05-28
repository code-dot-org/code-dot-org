import React, {useEffect} from 'react';
import {connect, useSelector} from 'react-redux';

import Spinner from '@cdo/apps/code-studio/pd/components/spinner';
import {EVENTS, PLATFORMS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {RootState} from '@cdo/apps/types/redux';
import i18n from '@cdo/locale';

import BaseDialog from '../BaseDialog';
import SafeMarkdown from '../SafeMarkdown';

import AgeGatedStudentsTable from './AgeGatedStudentsTable';

import styles from '@cdo/apps/templates/teacherDashboard/age-gated-students-modal.module.scss';

interface ReduxState {
  manageStudents: {
    isLoadingStudents?: boolean;
  };
}
interface Props {
  onClose: () => void;
  isOpen: boolean;
  isLoadingStudents: boolean;
}

const AgeGatedStudentsModal: React.FC<Props> = ({
  isLoadingStudents,
  isOpen,
  onClose,
}) => {
  const currentUser = useSelector((state: RootState) => state.currentUser);
  const reportEvent = (eventName: string, payload: object = {}) => {
    analyticsReporter.sendEvent(eventName, payload, PLATFORMS.AMPLITUDE);
  };

  useEffect(() => {
    reportEvent(EVENTS.CAP_AGE_GATED_MODAL_SHOWN, {
      user_id: currentUser.userId,
    });
  }, [currentUser.userId]);
  return (
    <BaseDialog
      isOpen={isOpen}
      handleClose={onClose}
      useUpdatedStyles={true}
      fixedWidth={800}
    >
      <div
        className={styles.modalContainer}
        data-testid="age-gated-students-modal"
      >
        <div>
          <h2 className={styles.modalHeader}>
            {i18n.childAccountPolicy_studentParentalConsentStatus()}
          </h2>
          <hr />
          <p>{i18n.childAccountPolicy_studentParentalConsentNotice()}</p>
          <br />
          <SafeMarkdown
            markdown={i18n.childAccountPolicy_consentProcessReadMore({
              url: '/',
            })}
          />
          {isLoadingStudents && <Spinner />}
          {!isLoadingStudents && <AgeGatedStudentsTable />}
          <hr />
          <div className={styles.modalButton}>
            <button type="button" onClick={onClose}>
              {i18n.closeDialog()}
            </button>
          </div>
        </div>
      </div>
    </BaseDialog>
  );
};
export const UnconnectedAgeGatedStudentsModal = AgeGatedStudentsModal;

export default connect((state: ReduxState) => ({
  isLoadingStudents: state.manageStudents.isLoadingStudents || false,
}))(AgeGatedStudentsModal);
