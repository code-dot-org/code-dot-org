import React, {createContext, useContext} from 'react';

import {ChatButtonData} from '@cdo/apps/aichat/types';
import {AiTutorContextHelper} from '@cdo/apps/aiTutor/helpers/aiTutorContextHelper';
import {ProjectSources} from '@cdo/apps/lab2/types';

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
  sendConsoleInput?: SendConsoleInputFunction;
  levelProperties: CodebridgeLevelProperties;
  projectPickerSettings?: ProjectPickerSettings;
  hiddenContextCallback?: () => Promise<string>;
  AiTutor2ResponseView?: React.ReactNode;
  onImageFlagged?: (
    file: File,
    fileType: string,
    uploadFunction: () => Promise<void>
  ) => void;
  aiTutorMultimodalEnabled?: boolean;
  aiTutorChatButtonData?: ChatButtonData[];
  aiTutorContextHelper?: AiTutorContextHelper<object>;
  aiTutorSystemPromptName?: string;
};

export const CodebridgeContext = createContext<CodebridgeContextType | null>(
  null
);

export const useCodebridgeContext = () => {
  const context = useContext(CodebridgeContext);
  if (context === null) {
    throw new Error('Codebridge Context has not been provided!');
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
