import type {FunctionComponent, PropsWithChildren} from 'react';
import {useState, createContext, useContext} from 'react';

import type {ProjectSources, ProjectManager} from '@code-dot-org/projects';

import type {LabProps, LevelProperties} from '@lab-base/types';

/**
 * Describes the current lab application we are viewing.
 */
export interface AppContent<
  T extends LevelProperties = LevelProperties,
  U extends ProjectSources = ProjectSources,
> {
  lab?: LabProps<T, U>;
  setLab: (value?: LabProps<T, U>) => void;
  projectManager?: ProjectManager;
  setProjectManager: (value?: ProjectManager) => void;
}

/**
 * The current lab application metadata.
 */
const AppContext = createContext<AppContent>({
  setLab: _ => {},
  setProjectManager: _ => {},
});

/**
 * This hook returns the lab application metadata.
 */
export const useApp = <
  T extends LevelProperties = LevelProperties,
  U extends ProjectSources = ProjectSources,
>() => useContext(AppContext) as unknown as AppContent<T, U>;

/**
 * Holds the lab application state.
 */
export const AppProvider: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const [lab, setLab] = useState<LabProps | undefined>(undefined);
  const [projectManager, setProjectManager] = useState<
    ProjectManager | undefined
  >(undefined);

  return (
    <AppContext.Provider
      value={{
        lab,
        setLab,
        projectManager,
        setProjectManager,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
