import {createSelector} from '@reduxjs/toolkit';

import {findChangedProperties} from '@cdo/apps/aichat/redux/utils';
import type {RootState} from '@cdo/apps/types/redux';

import {
  allFieldsHidden,
  anyFieldsChanged,
  hasFilledOutModelCard,
} from '../utils';

export const selectHasFilledOutModelCard = createSelector(
  (state: RootState) => state.aichatLab.currentAiCustomizations.modelCardInfo,
  hasFilledOutModelCard
);

export const selectAllFieldsHidden = createSelector(
  (state: RootState) => state.aichatLab.fieldVisibilities,
  allFieldsHidden
);

export const selectCurrentCustomizationsMatchInitial = createSelector(
  (state: RootState) => state.aichatLab.initialAiCustomizations,
  (state: RootState) => state.aichatLab.currentAiCustomizations,
  anyFieldsChanged
);

export const selectSavedCustomizationsMatchInitial = createSelector(
  (state: RootState) => state.aichatLab.initialAiCustomizations,
  (state: RootState) => state.aichatLab.savedAiCustomizations,
  anyFieldsChanged
);

export const selectHavePropertiesChanged = (state: RootState) =>
  findChangedProperties(
    state.aichatLab.savedAiCustomizations,
    state.aichatLab.currentAiCustomizations
  ).length > 0;
