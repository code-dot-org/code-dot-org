import React, {PropsWithChildren, useState, createContext, useContext} from 'react';

import type {LabProps, LevelProperties, ProjectSources} from '@lab2-base/types';

/**
 * Describes the current lab application we are viewing.
 */
export interface AppContent<
  T extends LevelProperties = LevelProperties,
  U extends ProjectSources = ProjectSources
> {
  lab?: LabProps<T, U>;
  setLab: (value?: LabProps<T, U>) => void;
}

/**
 * The current lab application metadata.
 */
const AppContext = createContext<AppContent>({
  setLab: (_) => {},
});

/**
 * This hook returns the lab application metadata.
 */
export const useApp = <
  T extends LevelProperties = LevelProperties,
  U extends ProjectSources = ProjectSources
>() => () => useContext(AppContext) as unknown as AppContent<T, U>;

/**
 * Holds the lab application state.
 */
export const AppProvider: React.FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const [state, setState] = useState<LabProps | undefined>(undefined);

  return (
    <AppContext.Provider value={{
      lab: state,
      setLab: setState,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
