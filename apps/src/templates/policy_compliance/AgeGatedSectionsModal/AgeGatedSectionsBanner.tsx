import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {Section} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import {RootState} from '@cdo/apps/types/redux';
import i18n from '@cdo/locale';

import Notification, {
  NotificationType,
} from '../../../sharedComponents/Notification';

import {AgeGatedSectionsModal} from './AgeGatedSectionsModal';

interface Props {
  toggleModal: () => void;
  modalOpen: boolean;
  ageGatedSections: Section[];
}

export const AgeGatedSectionsBanner: React.FC<Props> = ({
  toggleModal,
  modalOpen,
  ageGatedSections,
}) => {
  const currentUser = useSelector((state: RootState) => state.currentUser);
  const reportEvent = (eventName: string, payload: object = {}) => {
    analyticsReporter.sendEvent(eventName, payload);
  };

  useEffect(() => {
    reportEvent(EVENTS.CAP_AGE_GATED_BANNER_SHOWN, {
      user_id: currentUser.userId,
      number_of_gateable_sections: ageGatedSections.length,
    });
  }, [currentUser.userId, ageGatedSections]);

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
    <div id="uitest-age-gated-sections-banner">
      <Notification
        type={NotificationType.warning}
        notice={i18n.headsUp()}
        details={i18n.childAccountPolicy_ageGatedSectionsWarning({
          startDate: startDateText,
        })}
        buttonText={i18n.childAccountPolicy_ageGatedSectionsWarning_button()}
        buttonLink={'#'}
        onButtonClick={toggleModal}
        dismissible={false}
      />
      {modalOpen && (
        <AgeGatedSectionsModal
          isOpen={modalOpen}
          onClose={toggleModal}
          ageGatedSections={ageGatedSections}
        />
      )}
    </div>
  );
};
