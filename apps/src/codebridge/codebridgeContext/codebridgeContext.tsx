import React, {createContext, useContext} from 'react';

import {LabConfig, ProjectSources} from '@cdo/apps/lab2/types';

import {
  ConfigType,
  SetConfigFunction,
  OnRunFunction,
  OnStopFunction,
  SendConsoleInputFunction,
  CodebridgeLevelProperties,
  ProjectPickerSettings,
} from '../types';

export type CodebridgeContextType = {
  config: ConfigType;
  setConfig: SetConfigFunction;
  onRun?: OnRunFunction;
  onStop?: OnStopFunction;
  startSources: ProjectSources;
  labConfig?: LabConfig;
  sendConsoleInput?: SendConsoleInputFunction;
  levelProperties: CodebridgeLevelProperties;
  projectPickerSettings?: ProjectPickerSettings;
  aiTutor2Context?: string;
  AiTutor2ResponseView?: React.ReactNode;
};

export const CodebridgeContext = createContext<CodebridgeContextType | null>(
  null
);

export const useCodebridgeContext = () => {
  const context = useContext(CodebridgeContext);
  if (context === null) {
    throw new Error('CDO IDE Context has not been provided!');
  }
  return context;
};

type CodebridgeContextProviderType = {
  children: React.ReactNode;
  value: CodebridgeContextType;
};

export const CodebridgeContextProvider = ({
  children,
  value,
}: CodebridgeContextProviderType) => (
  <CodebridgeContext.Provider value={value}>
    {children}
  </CodebridgeContext.Provider>
);
