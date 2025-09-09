import Link from '@code-dot-org/component-library/link';
import Typography from '@code-dot-org/component-library/typography';
import React, {useEffect} from 'react';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import Spinner from '@cdo/apps/sharedComponents/Spinner';
import {
  convertStudentDataToArray,
  selectAtRiskAgeGatedDate,
} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {CapLinks} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import BaseDialog from '../../BaseDialog';

import AgeGatedStudentsTable from './AgeGatedStudentsTable';

import styles from '@cdo/apps/templates/policy_compliance/AgeGatedStudentsModal/age-gated-students-modal.module.scss';

interface Props {
  onClose: () => void;
  isOpen: boolean;
  ageGatedStudentsCount?: number;
  ageGatedStudentsUsState?: string;
}

const AgeGatedStudentsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  ageGatedStudentsCount = 0,
  ageGatedStudentsUsState,
}) => {
  const currentUser = useAppSelector(state => state.currentUser);
  const reportEvent = (eventName: string, payload: object = {}) => {
    analyticsReporter.sendEvent(eventName, payload);
  };

  const isLoadingStudents = useAppSelector(
    state => state.manageStudents.isLoadingStudents
  );

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

  const atRiskAgeGatedDate = useAppSelector(state =>
    selectAtRiskAgeGatedDate(
      convertStudentDataToArray(state.manageStudents.studentData)
    )
  );
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

export default AgeGatedStudentsModal;
