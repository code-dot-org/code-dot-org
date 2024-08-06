import {createContext} from 'react';

import {
  AiCustomizations,
  LevelAichatSettings,
  ModelCardInfo,
  Visibility,
} from '@cdo/apps/aichat/types';

export const UpdateContext = createContext({
  aichatSettings: {} as LevelAichatSettings,
  setPropertyValue: (
    property: keyof AiCustomizations,
    value: AiCustomizations[keyof AiCustomizations]
  ) => {},
  setPropertyVisibility: (
    property: keyof AiCustomizations,
    visibility: Visibility
  ) => {},
  setModelCardPropertyValue: (
    property: keyof ModelCardInfo,
    value: ModelCardInfo[keyof ModelCardInfo]
  ) => {},
  setModelSelectionValues: (
    additionalModelIds: string[],
    selectedModelId: string
  ) => {},
});
