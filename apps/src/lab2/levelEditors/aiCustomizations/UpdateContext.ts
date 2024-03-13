/* eslint-disable import/order */
import {
  AiCustomizations,
  LevelAiCustomizations,
  ModelCardInfo,
  Visibility,
} from '@cdo/apps/aichat/types';
import {createContext} from 'react';

export const UpdateContext = createContext({
  aiCustomizations: {} as LevelAiCustomizations,
  setPropertyValue: (
    property: keyof AiCustomizations,
    value: string | number
  ) => {},
  setPropertyVisibility: (
    property: keyof AiCustomizations,
    visibility: Visibility
  ) => {},
  setModelCardPropertyValue: (
    property: keyof ModelCardInfo,
    value: string | string[]
  ) => {},
});
