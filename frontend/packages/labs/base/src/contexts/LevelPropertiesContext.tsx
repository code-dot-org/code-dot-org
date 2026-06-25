import type {PropsWithChildren} from 'react';
import {createContext, useContext, useMemo} from 'react';

import type {LevelPropertiesMap} from '../types';

interface LevelPropertiesContent {
  levelProperties?: Record<string, unknown>;
  levelPropertiesMap?: LevelPropertiesMap;
}

const LevelPropertiesContext = createContext<LevelPropertiesContent>({});

export function useLevelProperties() {
  return useContext(LevelPropertiesContext).levelProperties;
}

export function useMaybeLevelProperties() {
  return useContext(LevelPropertiesContext).levelProperties;
}

interface LevelPropertiesProviderProps extends PropsWithChildren {
  levelId: number;
  levelPropertiesMap: LevelPropertiesMap;
}

export function LevelPropertiesProvider({
  levelId,
  levelPropertiesMap,
  children,
}: LevelPropertiesProviderProps) {
  const levelProperties = useMemo(
    () => levelPropertiesMap[String(levelId)],
    [levelId, levelPropertiesMap],
  );

  const value = useMemo(
    () => ({levelProperties, levelPropertiesMap}),
    [levelProperties, levelPropertiesMap],
  );

  return (
    <LevelPropertiesContext.Provider value={value}>
      {children}
    </LevelPropertiesContext.Provider>
  );
}

export default LevelPropertiesContext;
