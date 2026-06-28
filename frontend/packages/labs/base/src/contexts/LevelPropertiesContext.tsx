import type {PropsWithChildren} from 'react';
import {createContext, useContext, useMemo} from 'react';

import {useLoadLevelProperties} from '../hooks/useLoadLevelProperties';
import {useAppSelector} from '../redux/store';
import type {LevelProperties, LevelPropertiesMap} from '@code-dot-org/core/api';

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
 *
 * This provider is pure: the host supplies the resolved `levelPropertiesMap`.
 * It performs no fetching and reads nothing from `state.progress` other than
 * the host-set `currentLevelId` used to select the current level from the map.
 * Hosts that want the package to fetch the map for them can wrap with
 * {@link FetchedLevelPropertiesProvider} instead.
 */
export const LevelPropertiesProvider = ({
  levelPropertiesMap,
  children,
}: PropsWithChildren<{levelPropertiesMap?: LevelPropertiesMap}>) => {
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

/**
 * Transitional fetching wrapper: resolves the level-properties map inside the
 * package (keyed off `state.progress`) and feeds it to the pure provider. Used
 * when the host has not yet taken ownership of level-properties loading. Once
 * the studio host resolves and supplies the map to `<Lab>`, this and
 * {@link useLoadLevelProperties} can be removed.
 */
export const FetchedLevelPropertiesProvider = ({
  children,
}: PropsWithChildren) => {
  const levelPropertiesMap = useLoadLevelProperties();
  return (
    <LevelPropertiesProvider levelPropertiesMap={levelPropertiesMap}>
      {children}
    </LevelPropertiesProvider>
  );
};

export default LevelPropertiesContext;
