import React from 'react';
import {connect} from 'react-redux';

import Spinner from '@cdo/apps/code-studio/pd/components/spinner';
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
interface AgeGatedStudentsProps {
  onClose: () => void;
  isOpen: boolean;
}

type Props = ReduxState & AgeGatedStudentsProps;

const AgeGatedStudentsModal: React.FC<Props> = ({
  manageStudents: isLoadingStudents,
  isOpen,
  onClose,
}) => {
  return (
    <BaseDialog
      isOpen={isOpen}
      handleClose={onClose}
      useUpdatedStyles={true}
      fixedWidth={800}
    >
      <div className={styles.modalContainer} id="modal">
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
              Close
            </button>
          </div>
        </div>
      </div>
    </BaseDialog>
  );
};
export const UnconnectedAgeGatedStudentsModal = AgeGatedStudentsModal;

export default connect(
  (state: ReduxState) => ({
    isLoadingStudents: state.manageStudents.isLoadingStudents,
  }),
  {}
)(AgeGatedStudentsModal);
