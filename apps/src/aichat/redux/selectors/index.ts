import {createSelector} from '@reduxjs/toolkit';

import {queryParams} from '@cdo/apps/code-studio/utils';
import type {RootState} from '@cdo/apps/types/redux';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

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

export const selectAllVisibleMessages = (state: RootState) => {
  const {chatEventsPast, chatEventsCurrent, chatMessagePending} = state.aichat;
  const messages = [...chatEventsPast, ...chatEventsCurrent];
  if (chatMessagePending) {
    messages.push(chatMessagePending);
  }
  return messages;
};

export const selectHavePropertiesChanged = (state: RootState) =>
  findChangedProperties(
    state.aichat.savedAiCustomizations,
    state.aichat.currentAiCustomizations
  ).length > 0;

export const selectMultimodalEnabled = (state: RootState) => {
  const isChatGpt =
    state.aichat.currentAiCustomizations.selectedModelId ===
    AiChatModelIds.CHATGPT;
  return isChatGpt && queryParams('multimodal') === 'true';
};
