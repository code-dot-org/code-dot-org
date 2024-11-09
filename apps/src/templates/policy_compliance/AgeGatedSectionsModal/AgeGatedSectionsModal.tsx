import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';

import Link from '@cdo/apps/componentLibrary/link';
import Typography from '@cdo/apps/componentLibrary/typography';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {AgeGatedSectionsTable} from '@cdo/apps/templates/policy_compliance/AgeGatedSectionsModal/AgeGatedSectionsTable';
import {RootState} from '@cdo/apps/types/redux';
import i18n from '@cdo/locale';

import BaseDialog from '../../BaseDialog';
import {Section} from '../../teacherDashboard/types/teacherSectionTypes';

import styles from '@cdo/apps/templates/policy_compliance/AgeGatedStudentsModal/age-gated-students-modal.module.scss';

interface Props {
  onClose: () => void;
  isOpen: boolean;
  ageGatedSections: Section[];
}

export const AgeGatedSectionsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  ageGatedSections,
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
    });
  };

  const modalClosed = () => {
    reportEvent(EVENTS.CAP_AGE_GATED_MODAL_CLOSED, {
      user_id: currentUser.userId,
    });
    onClose();
  };

  useEffect(() => {
    reportEvent(EVENTS.CAP_AGE_GATED_MODAL_SHOWN, {
      user_id: currentUser.userId,
    });
  }, [currentUser.userId]);
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
            {i18n.childAccountPolicy_ageGatedSectionsModal_header()}
          </Typography>
          <hr />
          <Typography semanticTag="p" visualAppearance="body-two">
            {i18n.childAccountPolicy_ageGatedSectionsModal_notice({
              startDate: 'DAYNE',
            })}
          </Typography>
          <Typography semanticTag="p" visualAppearance="body-two">
            <strong>
              {i18n.childAccountPolicy_ageGatedSectionsModal_action()}
            </strong>
          </Typography>
          <Typography semanticTag="p" visualAppearance="body-two">
            <Link
              href={helpDocsUrl}
              onClick={modalDocumentationClicked}
              openInNewTab={true}
            >
              {i18n.childAccountPolicy_ageGatedSectionsModal_readMore()}
            </Link>
          </Typography>
          <AgeGatedSectionsTable ageGatedSections={ageGatedSections} />
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
