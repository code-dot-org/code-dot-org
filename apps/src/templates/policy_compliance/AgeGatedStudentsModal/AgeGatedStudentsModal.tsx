import React, {useEffect} from 'react';
import {connect, useSelector} from 'react-redux';

import Link from '@cdo/apps/componentLibrary/link';
import Typography from '@cdo/apps/componentLibrary/typography';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import Spinner from '@cdo/apps/sharedComponents/Spinner';
import {
  convertStudentDataToArray,
  selectAtRiskAgeGatedDate,
} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';
import {RootState} from '@cdo/apps/types/redux';
import {CapLinks} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import BaseDialog from '../../BaseDialog';

import AgeGatedStudentsTable from './AgeGatedStudentsTable';

import styles from '@cdo/apps/templates/policy_compliance/AgeGatedStudentsModal/age-gated-students-modal.module.scss';

interface ReduxState {
  manageStudents: {
    isLoadingStudents?: boolean;
    studentData?: object;
  };
}
interface Props {
  onClose: () => void;
  isOpen: boolean;
  isLoadingStudents: boolean;
  atRiskAgeGatedDate?: Date;
  ageGatedStudentsCount?: number;
  ageGatedStudentsUsState?: string;
}

const AgeGatedStudentsModal: React.FC<Props> = ({
  isLoadingStudents,
  isOpen,
  onClose,
  atRiskAgeGatedDate,
  ageGatedStudentsCount = 0,
  ageGatedStudentsUsState,
}) => {
  const currentUser = useSelector((state: RootState) => state.currentUser);
  const reportEvent = (eventName: string, payload: object = {}) => {
    analyticsReporter.sendEvent(eventName, payload);
  };

  const helpDocsUrl = CapLinks.PARENTAL_CONSENT_GUIDE_URL;

  const modalDocumentationClicked = () => {
    reportEvent(EVENTS.CAP_STUDENT_WARNING_LINK_CLICKED, {
      user_id: currentUser.userId,
      number_of_gateable_students: ageGatedStudentsCount,
      us_state: ageGatedStudentsUsState,
    });
  };

  const modalClosed = () => {
    reportEvent(EVENTS.CAP_AGE_GATED_MODAL_CLOSED, {
      user_id: currentUser.userId,
      number_of_gateable_students: ageGatedStudentsCount,
      us_state: ageGatedStudentsUsState,
    });
    onClose();
  };

  useEffect(() => {
    reportEvent(EVENTS.CAP_AGE_GATED_MODAL_SHOWN, {
      user_id: currentUser.userId,
      number_of_gateable_students: ageGatedStudentsCount,
      us_state: ageGatedStudentsUsState,
    });
  }, [currentUser.userId, ageGatedStudentsCount, ageGatedStudentsUsState]);

  const startDate = atRiskAgeGatedDate;
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };
  const startDateText =
    startDate?.toLocaleDateString('en-US', dateOptions) || '???';

  return (
    <BaseDialog
      isOpen={isOpen}
      handleClose={modalClosed}
      useUpdatedStyles={true}
      fixedWidth={800}
    >
      <div
        className={styles.modalContainer}
        // eslint-disable-next-line react/forbid-dom-props
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
            {i18n.childAccountPolicy_studentParentalConsentNotice({
              startDate: startDateText,
            })}
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
  atRiskAgeGatedDate: selectAtRiskAgeGatedDate(
    convertStudentDataToArray(state.manageStudents.studentData)
  ),
}))(AgeGatedStudentsModal);
