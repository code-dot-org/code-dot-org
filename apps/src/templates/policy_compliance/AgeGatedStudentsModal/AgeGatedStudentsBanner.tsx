import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';

import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/utils/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/utils/AnalyticsReporter';
import {RootState} from '@cdo/apps/types/redux';
import i18n from '@cdo/locale';

import Notification, {
  NotificationType,
} from '../../../sharedComponents/Notification';

import AgeGatedStudentsModal from './AgeGatedStudentsModal';

interface Props {
  toggleModal: () => void;
  modalOpen: boolean;
  ageGatedStudentsCount?: number;
}

export const AgeGatedStudentsBanner: React.FC<Props> = ({
  toggleModal,
  modalOpen,
  ageGatedStudentsCount = 0,
}) => {
  const currentUser = useSelector((state: RootState) => state.currentUser);
  const reportEvent = (eventName: string, payload: object = {}) => {
    analyticsReporter.sendEvent(eventName, payload, PLATFORMS.AMPLITUDE);
  };

  useEffect(() => {
    reportEvent(EVENTS.CAP_AGE_GATED_BANNER_SHOWN, {
      user_id: currentUser.userId,
      number_of_gateable_students: ageGatedStudentsCount,
    });
  }, [currentUser.userId, ageGatedStudentsCount]);

  return (
    <div id="uitest-age-gated-banner">
      <Notification
        type={NotificationType.warning}
        notice={i18n.headsUp()}
        details={i18n.childAccountPolicy_ageGatedStudentsWarning()}
        buttonText={i18n.learnMore()}
        buttonLink={'#'}
        onButtonClick={toggleModal}
        dismissible={false}
      />
      {modalOpen && (
        <AgeGatedStudentsModal
          isOpen={modalOpen}
          onClose={toggleModal}
          ageGatedStudentsCount={ageGatedStudentsCount}
        />
      )}
    </div>
  );
};
