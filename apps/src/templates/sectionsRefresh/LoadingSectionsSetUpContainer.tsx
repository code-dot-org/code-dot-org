import React from 'react';

import SectionsSetUpContainer from './SectionsSetUpContainer';

interface LoadingSectionsSetUpContainerProps {
  defaultRedirectUrl: string;
}

const LoadingSectionsSetUpContainer: React.FC<
  LoadingSectionsSetUpContainerProps
> = ({defaultRedirectUrl}) => {
  const defaultSection = {
    id: -1,
    name: '',
    code: '',
    grade: [],
    hidden: false,
    loginType: 'email',
    participantType: 'student',
    pairingAllowed: true,
    restrictSection: false,
    ttsAutoplayEnabled: false,
    lessonExtras: true,
    aiTutorEnabled: false,
    sharing_disabled: false,
    sharingDisabled: false,
    primaryInstructor: {
      id: -1,
      email: '',
      userId: -1,
      isCurrentUser: true,
      ltiRosterSyncEnabled: false,
    },
    sectionInstructors: [],
    course: {
      textToSpeechEnabled: false,
      lessonExtrasAvailable: false,
    },
  };

  return (
    <SectionsSetUpContainer
      isUsersFirstSection={false}
      sectionToBeEdited={defaultSection}
      canEnableAITutor={false}
      defaultRedirectUrl={defaultRedirectUrl}
      setIsEditInProgress={() => {}}
      isLoading={true}
    />
  );
};

export default LoadingSectionsSetUpContainer;
