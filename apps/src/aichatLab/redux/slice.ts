import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {registerReducers} from '@cdo/apps/redux';

import {
  AiCustomizations,
  LevelAichatSettings,
  ModalTypes,
  ModelCardInfo,
  SaveError,
  SaveType,
  ViewMode,
  Visibility,
} from '../types';
import {validateModelId} from '../utils';
import {
  DEFAULT_VISIBILITIES,
  EMPTY_AI_CUSTOMIZATIONS,
} from '../views/modelCustomization/constants';

import {AichatLabState} from './state';

const initialState: AichatLabState = {
  showModalType: undefined,
  initialAiCustomizations: EMPTY_AI_CUSTOMIZATIONS,
  currentAiCustomizations: EMPTY_AI_CUSTOMIZATIONS,
  savedAiCustomizations: EMPTY_AI_CUSTOMIZATIONS,
  fieldVisibilities: DEFAULT_VISIBILITIES,
  viewMode: ViewMode.EDIT,
  saveInProgress: false,
  currentSaveType: undefined,
  hasSentMessage: false,
  hasUpdatedCustomizations: false,
  saveError: undefined,
  showResetMessage: false,
  showUnsupportedModelMessage: false,
  hasSetInitialCustomizations: false,
};

const aichatLabSlice = createSlice({
  name: 'aichatLab',
  initialState,
  reducers: {
    setChatMessageSent: (state, action: PayloadAction<boolean>) => {
      state.hasSentMessage = action.payload;
    },
    setShowModalType: (
      state,
      action: PayloadAction<ModalTypes | undefined>
    ) => {
      state.showModalType = action.payload;
    },
    setViewMode: (state, action: PayloadAction<ViewMode>) => {
      state.viewMode = action.payload;
    },
    setInitialConfiguration: (
      state,
      action: PayloadAction<{
        customizations: AiCustomizations;
        visibilities: {[key in keyof AiCustomizations]: Visibility};
        showUnsupportedModelMessage: boolean;
      }>
    ) => {
      const {customizations, visibilities, showUnsupportedModelMessage} =
        action.payload;
      state.initialAiCustomizations = customizations;
      state.savedAiCustomizations = customizations;
      state.currentAiCustomizations = customizations;
      state.fieldVisibilities = visibilities;

      // Reset sent message and updated customizations flags
      state.hasSentMessage = false;
      state.hasUpdatedCustomizations = false;
      state.hasSetInitialCustomizations = true;
      state.showUnsupportedModelMessage = showUnsupportedModelMessage;
    },
    clearHasSetInitialCustomizations: state => {
      state.hasSetInitialCustomizations = false;
    },
    resetToDefaultAiCustomizations: (
      state,
      action: PayloadAction<LevelAichatSettings | undefined>
    ) => {
      const levelAichatSettings = action.payload;

      let defaultAiCustomizations: AiCustomizations =
        levelAichatSettings?.initialCustomizations || EMPTY_AI_CUSTOMIZATIONS;

      // Make sure model ID is valid
      defaultAiCustomizations = {
        ...defaultAiCustomizations,
        selectedModelId: validateModelId(
          defaultAiCustomizations.selectedModelId,
          levelAichatSettings?.availableModelIds
        ).modelId,
      };

      state.currentAiCustomizations = defaultAiCustomizations;
      state.fieldVisibilities =
        levelAichatSettings?.visibilities || DEFAULT_VISIBILITIES;
      state.showResetMessage = true;
    },
    setSavedAiCustomizations: (
      state,
      action: PayloadAction<AiCustomizations>
    ) => {
      state.savedAiCustomizations = action.payload;
      state.hasUpdatedCustomizations = true;
    },
    setAiCustomizationProperty: <T extends keyof AiCustomizations>(
      state: AichatLabState,
      action: PayloadAction<{
        property: T;
        value: AiCustomizations[T];
      }>
    ) => {
      const {property, value} = action.payload;
      const updatedAiCustomizations = {
        ...state.currentAiCustomizations,
        [property]: value,
      };
      state.currentAiCustomizations = updatedAiCustomizations;
      // Clear save error and reset message, if any.
      state.saveError = undefined;
      state.showResetMessage = false;
      state.showUnsupportedModelMessage = false;
    },
    setModelCardProperty: <T extends keyof ModelCardInfo>(
      state: AichatLabState,
      action: PayloadAction<{
        property: T;
        value: ModelCardInfo[T];
      }>
    ) => {
      const {property, value} = action.payload;
      const updatedModelCardInfo: ModelCardInfo = {
        ...state.currentAiCustomizations.modelCardInfo,
        [property]: value,
      };
      state.currentAiCustomizations.modelCardInfo = updatedModelCardInfo;
      state.showResetMessage = false;
      state.showUnsupportedModelMessage = false;
    },
    startSave(state, action: PayloadAction<SaveType>) {
      state.saveInProgress = true;
      state.currentSaveType = action.payload;
      // Clear save error, if any.
      state.saveError = undefined;
      state.showUnsupportedModelMessage = false;
    },
    endSave(state) {
      state.saveInProgress = false;
      state.currentSaveType = undefined;
    },
    setSaveError(state, action: PayloadAction<SaveError | undefined>) {
      state.saveError = action.payload;
    },
  },
});
registerReducers({aichat: aichatLabSlice.reducer});

export const aichatReducer = aichatLabSlice.reducer;

export const {
  startSave,
  setChatMessageSent,
  setSavedAiCustomizations,
  endSave,
  resetToDefaultAiCustomizations,
  setAiCustomizationProperty,
  setModelCardProperty,
  setShowModalType,
  setInitialConfiguration,
  setViewMode,
  setSaveError,
  clearHasSetInitialCustomizations,
} = aichatLabSlice.actions;
