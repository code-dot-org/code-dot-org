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
  const lastChatMessage =
    state.aichat.chatEventsCurrent[state.aichat.chatEventsCurrent.length - 1];
  if (!lastChatMessage) return false;

  return (
    isChatMessage(lastChatMessage) &&
    lastChatMessage.role === Role.USER &&
    lastChatMessage.status === AiInteractionStatus.UNKNOWN
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
