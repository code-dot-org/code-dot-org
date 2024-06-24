import React, {useEffect, useState} from 'react';

import ChatWarningModal from '@cdo/apps/aiComponentLibrary/warningModal/ChatWarningModal';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {tryGetSessionStorage, trySetSessionStorage} from '@cdo/apps/utils';

const AITutorWarningModal = () => {
  const sessionStorageKey = 'AITutorWarningModalSeenKey';
  const isChatOpen = useAppSelector(state => state.aiTutor.isChatOpen);

  const [hasSeenWarningModal, setHasSeenWarningModal] = useState(() => {
    // Check session storage to see if modal has been shown
    return JSON.parse(tryGetSessionStorage(sessionStorageKey, false)) || false;
  });

  useEffect(() => {
    if (!hasSeenWarningModal) {
      // As soon as the modal is considered to be shown, mark it as seen in session storage
      trySetSessionStorage(sessionStorageKey, 'true');
    }
  }, [hasSeenWarningModal]);

  const onClose = () => {
    setHasSeenWarningModal(true);
  };

  // If the user has already seen the warning modal or chat is not open, don't show it
  if (!isChatOpen || hasSeenWarningModal) {
    return null;
  }

  return <ChatWarningModal onClose={onClose} />;
};

export default AITutorWarningModal;
