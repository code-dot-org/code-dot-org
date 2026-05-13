import {createSelector} from '@reduxjs/toolkit';

import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import type {RootState} from '@cdo/apps/types/redux';
import {AiInteractionStatus} from '@cdo/generated-scripts/sharedConstants';

import {isChatMessage} from '../../types';

export const selectIsWaitingForChatResponse = (state: RootState) => {
  let lastChatEvent;
  for (let i = state.aichat.chatEventsCurrent.length - 1; i >= 0; i--) {
    const event = state.aichat.chatEventsCurrent[i];
    if (isChatMessage(event)) {
      lastChatEvent = event;
      break;
    }
  }

  return (
    !!lastChatEvent &&
    lastChatEvent.role === Role.USER &&
    lastChatEvent.status === AiInteractionStatus.UNKNOWN
  );
};

export const selectAllVisibleMessages = createSelector(
  (state: RootState) => state.aichat.chatEventsPast,
  (state: RootState) => state.aichat.chatEventsCurrent,
  (chatEventsPast, chatEventsCurrent) => [
    ...chatEventsPast,
    ...chatEventsCurrent,
  ]
);
