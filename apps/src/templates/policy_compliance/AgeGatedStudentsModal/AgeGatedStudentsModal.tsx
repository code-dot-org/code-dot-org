import React, {useEffect} from 'react';
import {connect, useSelector} from 'react-redux';

import Link from '@cdo/apps/componentLibrary/link';
import Typography from '@cdo/apps/componentLibrary/typography';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import Spinner from '@cdo/apps/sharedComponents/Spinner';
import {RootState} from '@cdo/apps/types/redux';
import i18n from '@cdo/locale';

import BaseDialog from '../../BaseDialog';

import AgeGatedStudentsTable from './AgeGatedStudentsTable';

import styles from '@cdo/apps/templates/policy_compliance/AgeGatedStudentsModal/age-gated-students-modal.module.scss';

interface ReduxState {
  manageStudents: {
    isLoadingStudents?: boolean;
  };
}
interface Props {
  onClose: () => void;
  isOpen: boolean;
  isLoadingStudents: boolean;
  ageGatedStudentsCount?: number;
}

const AgeGatedStudentsModal: React.FC<Props> = ({
  isLoadingStudents,
  isOpen,
  onClose,
  ageGatedStudentsCount = 0,
}) => {
  const currentUser = useSelector((state: RootState) => state.currentUser);
  const reportEvent = (eventName: string, payload: object = {}) => {
    analyticsReporter.sendEvent(eventName, payload);
  };

  const helpDocsUrl =
    'https://support.code.org/hc/en-us/articles/15465423491085-How-do-I-obtain-parent-or-guardian-permission-for-student-accounts';

  const modalDocumentationClicked = () => {
    reportEvent(EVENTS.CAP_STUDENT_WARNING_LINK_CLICKED, {
      user_id: currentUser.userId,
      number_of_gateable_students: ageGatedStudentsCount,
    });
  };

  const modalClosed = () => {
    reportEvent(EVENTS.CAP_AGE_GATED_MODAL_CLOSED, {
      user_id: currentUser.userId,
      number_of_gateable_students: ageGatedStudentsCount,
    });
    onClose();
  };

  useEffect(() => {
    reportEvent(EVENTS.CAP_AGE_GATED_MODAL_SHOWN, {
      user_id: currentUser.userId,
      number_of_gateable_students: ageGatedStudentsCount,
    });
  }, [currentUser.userId, ageGatedStudentsCount]);
  return (
    <BaseDialog
      isOpen={isOpen}
      handleClose={modalClosed}
      useUpdatedStyles={true}
      fixedWidth={800}
    >
      <div
        className={styles.modalContainer}
        data-testid="age-gated-students-modal"
        id="uitest-age-gated-students-modal"
      >
        <div>
          <Typography
            semanticTag="h2"
            visualAppearance="heading-md"
            className={styles.modalHeader}
          >
            {i18n.childAccountPolicy_studentParentalConsentStatus()}
          </Typography>
          <hr />
          <Typography semanticTag="p" visualAppearance="body-two">
            {i18n.childAccountPolicy_studentParentalConsentNotice()}
          </Typography>
          <Typography semanticTag="p" visualAppearance="body-two">
            <Link
              href={helpDocsUrl}
              onClick={modalDocumentationClicked}
              openInNewTab={true}
            >
              {i18n.childAccountPolicy_consentProcessReadMore()}
            </Link>
          </Typography>
          {isLoadingStudents && <Spinner />}
          {!isLoadingStudents && <AgeGatedStudentsTable />}
          <hr />
          <div className={styles.modalButton}>
            <button type="button" onClick={modalClosed}>
              {i18n.closeDialog()}
            </button>
          </div>
        </div>
      </div>
    </BaseDialog>
  );
};

export default connect((state: ReduxState) => ({
  isLoadingStudents: state.manageStudents.isLoadingStudents || false,
}))(AgeGatedStudentsModal);
