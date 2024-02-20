import React, {createContext, useContext} from 'react';

import {
  ProjectType,
  ConfigType,
  SetProjectFunction,
  SetConfigFunction,
} from './types';

type CDOIDEContextType = {
  project: ProjectType;
  config: ConfigType;
  setProject: SetProjectFunction;
  setConfig: SetConfigFunction;
};

export const CDOIDEContext = createContext<CDOIDEContextType | null>(null);

// TODO: useAnalysisFactsContext
export const useCDOIDEContext = () => {
  const context = useContext(CDOIDEContext);
  if (context === null) {
    throw new Error('CDO IDE Context has not been provided!');
  }
  return context;
};

type CDOIDEContextProviderType = {
  children: React.ReactNode;
  value: CDOIDEContextType;
};

export const CDOIDEContextProvider = ({
  children,
  value,
}: CDOIDEContextProviderType) => (
  <CDOIDEContext.Provider value={value}>{children}</CDOIDEContext.Provider>
);
