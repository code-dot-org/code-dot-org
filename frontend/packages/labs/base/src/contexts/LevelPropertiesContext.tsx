import type {PropsWithChildren} from 'react';
import {createContext, useContext, useMemo} from 'react';

import type {LevelPropertiesBase, LevelPropertiesMap} from '../types';

interface LevelPropertiesContent {
  levelProperties?: LevelPropertiesBase;
  levelPropertiesMap?: LevelPropertiesMap;
}

const LevelPropertiesContext = createContext<LevelPropertiesContent>({});

/**
 * The level properties, narrowed to a lab's own shape.
 *
 * The type argument is the whole point: a lab knows what its own
 * `levelProperties` are (Music Lab's carry a `levelData` with a guide mode,
 * Web Lab's carry `startSources`) and the context cannot. It is filled by the
 * host from a map keyed by level id, long before any lab is chosen.
 *
 * NON-OPTIONAL by assertion, because a lab that has mounted has properties —
 * the host resolves them before rendering one. {@link useMaybeLevelProperties}
 * is for the callers that render before that is true.
 */
export function useLevelProperties<
  T extends LevelPropertiesBase = LevelPropertiesBase,
>() {
  return useContext(LevelPropertiesContext).levelProperties as T;
}

/**
 * The same, for callers that render before the properties arrive.
 *
 * Named for the `undefined` because that is the case callers forget. A lab
 * mounted by the host always has properties; a component that can render
 * outside one — a panel shared with the editor chrome, a hook called during
 * load — may not, and a type that hid that would move the crash from the type
 * checker to the browser.
 */
export const useMaybeLevelProperties = <
  T extends LevelPropertiesBase = LevelPropertiesBase,
>() => useContext(LevelPropertiesContext).levelProperties as T | undefined;

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
