import type {PropsWithChildren} from 'react';
import {createContext, useContext, useMemo} from 'react';

import {useLoadLevelProperties} from '../hooks/useLoadLevelProperties';
import {useAppSelector} from '../redux/store';
import type {LevelProperties, LevelPropertiesMap} from '../types';

/**
 * Describes the state of the level properties metadata across the lesson.
 */
export interface LevelPropertiesContent<
  T extends LevelProperties = LevelProperties,
> {
  levelProperties?: T;
  levelPropertiesMap?: LevelPropertiesMap;
}

/**
 * The current level metadata.
 */
const LevelPropertiesContext = createContext<LevelPropertiesContent>(
  {} as unknown as LevelPropertiesContent,
);

/**
 * This hook returns the level properties state.
 */
export const useLevelProperties = <
  T extends LevelProperties = LevelProperties,
>() => {
  return useContext(LevelPropertiesContext).levelProperties as unknown as T;
};

/**
 * This hook returns the level properties state when it might be empty.
 */
export const useMaybeLevelProperties = <
  T extends LevelProperties = LevelProperties,
>() => {
  return useContext(LevelPropertiesContext).levelProperties as unknown as
    | T
    | undefined;
};

/**
 * Holds the level metadata for the current level and a map of cached metadata
 * for other levels adjacent to the current one in the current lesson.
 */
export const LevelPropertiesProvider = ({children}: PropsWithChildren) => {
  const levelPropertiesMap = useLoadLevelProperties();

  const currentLevelId = useAppSelector(state => state.progress.currentLevelId);

  const levelProperties = useMemo(() => {
    return currentLevelId ? levelPropertiesMap?.[currentLevelId] : undefined;
  }, [currentLevelId, levelPropertiesMap]);

  return (
    <LevelPropertiesContext.Provider
      value={{
        levelProperties,
        levelPropertiesMap,
      }}
    >
      {children}
    </LevelPropertiesContext.Provider>
  );
};

export default LevelPropertiesContext;
