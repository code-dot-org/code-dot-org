import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';

import {EVENTS, PLATFORMS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {RootState} from '@cdo/apps/types/redux';
import i18n from '@cdo/locale';

import Notification, {NotificationType} from '../../Notification';

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

  const bannerLearnMoreClicked = () => {
    reportEvent(EVENTS.CAP_PARENT_EMAIL_BANNER_CLICKED, {
      user_id: currentUser.userId,
      number_of_gateable_students: ageGatedStudentsCount,
    });
    toggleModal();
  };
  return (
    <div>
      <Notification
        type={NotificationType.warning}
        notice={i18n.headsUp()}
        details={i18n.childAccountPolicy_ageGatedStudentsWarning()}
        buttonText={i18n.learnMore()}
        buttonLink={'#'}
        onButtonClick={bannerLearnMoreClicked}
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
