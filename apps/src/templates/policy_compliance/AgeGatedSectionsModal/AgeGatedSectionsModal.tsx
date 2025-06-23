import Link from '@code-dot-org/component-library/link';
import Typography from '@code-dot-org/component-library/typography';
import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {AgeGatedSectionsTable} from '@cdo/apps/templates/policy_compliance/AgeGatedSectionsModal/AgeGatedSectionsTable';
import {RootState} from '@cdo/apps/types/redux';
import {CapLinks} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import BaseDialog from '../../BaseDialog';
import {Section} from '../../teacherDashboard/types/teacherSectionTypes';

import styles from '@cdo/apps/templates/policy_compliance/AgeGatedSectionsModal/age-gated-sections-modal.module.scss';

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

  const helpDocsUrl = CapLinks.PARENTAL_CONSENT_GUIDE_URL;

  const userId = currentUser.userId;
  const usState = ageGatedSections[0]?.atRiskAgeGatedUsState;
  const modalDocumentationClicked = () => {
    reportEvent(EVENTS.CAP_STUDENT_WARNING_LINK_CLICKED, {
      user_id: userId,
      us_state: usState,
    });
  };

  const modalClosed = () => {
    reportEvent(EVENTS.CAP_AGE_GATED_SECTIONS_MODAL_CLOSED, {
      user_id: userId,
      us_state: usState,
    });
    onClose();
  };

  useEffect(() => {
    reportEvent(EVENTS.CAP_AGE_GATED_SECTIONS_MODAL_SHOWN, {
      user_id: userId,
      us_state: usState,
    });
  }, [userId, usState]);

  const startDate = ageGatedSections.find(
    section => section.atRiskAgeGatedDate
  )?.atRiskAgeGatedDate;

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
        data-testid="age-gated-sections-modal"
        id="uitest-age-gated-sections-modal"
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
              startDate: startDateText,
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
