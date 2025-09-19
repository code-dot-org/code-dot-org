import React, {createContext} from 'react';

import {AiTutorAddedContextType} from './useAddedContext';

export const AiTutorAddedContext = createContext<
  AiTutorAddedContextType | undefined
>(undefined);

type AiTutorAddedContextProviderProps = {
  children: React.ReactNode;
  value: AiTutorAddedContextType;
};

export const AiTutorAddedContextProvider = ({
  children,
  value,
}: AiTutorAddedContextProviderProps) => {
  return (
    <AiTutorAddedContext.Provider value={value}>
      {children}
    </AiTutorAddedContext.Provider>
  );
};
