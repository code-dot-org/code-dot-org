import {createSelector} from '@reduxjs/toolkit';

import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import type {RootState} from '@cdo/apps/types/redux';
import {AiInteractionStatus} from '@cdo/generated-scripts/sharedConstants';

import {isChatMessage} from '../../types';
import {
  allFieldsHidden,
  anyFieldsChanged,
  findChangedProperties,
  hasFilledOutModelCard,
} from '../utils';

export const selectHasFilledOutModelCard = createSelector(
  (state: RootState) => state.aichat.currentAiCustomizations.modelCardInfo,
  hasFilledOutModelCard
);

export const selectAllFieldsHidden = createSelector(
  (state: RootState) => state.aichat.fieldVisibilities,
  allFieldsHidden
);

export const selectCurrentCustomizationsMatchInitial = createSelector(
  (state: RootState) => state.aichat.initialAiCustomizations,
  (state: RootState) => state.aichat.currentAiCustomizations,
  anyFieldsChanged
);

export const selectSavedCustomizationsMatchInitial = createSelector(
  (state: RootState) => state.aichat.initialAiCustomizations,
  (state: RootState) => state.aichat.savedAiCustomizations,
  anyFieldsChanged
);

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

export const selectAllVisibleMessages = (state: RootState) => {
  const {chatEventsPast, chatEventsCurrent} = state.aichat;
  const messages = [...chatEventsPast, ...chatEventsCurrent];
  return messages;
};

export const selectHavePropertiesChanged = (state: RootState) =>
  findChangedProperties(
    state.aichat.savedAiCustomizations,
    state.aichat.currentAiCustomizations
  ).length > 0;
