import {AiChatModelIds} from '@code-dot-org/shared-constants';
import {createContext} from 'react';

import {
  AiCustomizations,
  LevelAichatSettings,
  ModelCardInfo,
  Visibility,
} from '@cdo/apps/aichatLab/types';
import {ValueOf} from '@cdo/apps/types/utils';

export const UpdateContext = createContext({
  aichatSettings: {} as LevelAichatSettings,
  setPropertyValue: <T extends keyof AiCustomizations>(
    property: T,
    value: AiCustomizations[T]
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
    additionalModelIds: ValueOf<typeof AiChatModelIds>[],
    selectedModelId: ValueOf<typeof AiChatModelIds>
  ) => {},
  setMultimodalEnabled: (value: boolean) => {},
});
