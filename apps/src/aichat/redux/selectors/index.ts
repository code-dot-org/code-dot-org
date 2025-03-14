import {createSelector} from '@reduxjs/toolkit';

import type {RootState} from '@cdo/apps/types/redux';

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
