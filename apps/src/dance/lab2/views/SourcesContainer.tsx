import {isEqual} from 'lodash';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {LabProps, ProjectSources} from '@cdo/apps/lab2/types';

import getInitialSources from '../utils/getInitialSources';

interface SourcesContextType<T extends ProjectSources = ProjectSources> {
  currentSources: T;
  updateSources: (newSources: T, forceSave?: boolean) => void;
}

const SourcesContext = createContext<SourcesContextType | null>(null);

export function useSources<T extends ProjectSources = ProjectSources>() {
  const context = useContext(SourcesContext);
  if (context === null) {
    throw new Error('useSources must be used within a SourcesProvider');
  }
  // The SourcesContext object has to be created without a specific type,
  // so TS complains about casting context to a parameterized type.
  // Cast to unknown to get the correctly typed object.
  return context as unknown as SourcesContextType<T>;
}

/**
 * Manages sources for a Lab. Currently used by Dance Lab2, but is intentionally
 * designed to be lab-agnostic so that it can be used by other labs in the future.
 */
const SourcesContainer: React.FC<
  LabProps & {children: ReactNode; defaultSources: ProjectSources}
> = ({levelProperties, initialSources, defaultSources, children}) => {
  const [currentSources, setCurrentSources] = useState<ProjectSources>(
    () => getInitialSources(levelProperties, initialSources) || defaultSources
  );

  useEffect(() => {
    setCurrentSources(
      getInitialSources(levelProperties, initialSources) || defaultSources
    );
  }, [levelProperties, initialSources, defaultSources]);

  const updateSources = useCallback(
    (newSources: ProjectSources, forceSave = false) => {
      setCurrentSources(prev => {
        // Perform a deep equality check to prevent unnecessary re-renders
        if (isEqual(prev, newSources)) {
          return prev;
        }
        return newSources;
      });
      Lab2Registry.getInstance()
        .getProjectManager()
        ?.save(newSources, forceSave);
    },
    [setCurrentSources]
  );

  return (
    <SourcesContext.Provider value={{currentSources, updateSources}}>
      {children}
    </SourcesContext.Provider>
  );
};

export default SourcesContainer;
