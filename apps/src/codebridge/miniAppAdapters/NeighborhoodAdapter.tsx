import type {LevelProperties} from '@code-dot-org/core/api';
import type {MiniApp} from '@code-dot-org/mini-app-base';
import {
  NEIGHBORHOOD_NAME,
  NeighborhoodInputsContext,
  type NeighborhoodInputs,
  type NeighborhoodMiniApp,
} from '@code-dot-org/neighborhood-mini-app';
import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {DEFAULT_FOLDER_ID, MAZE_FILE_NAME} from '@codebridge/constants';
import {findFile} from '@codebridge/utils';
import React, {useMemo, type ReactNode} from 'react';

import {MultiFileSource} from '@cdo/apps/lab2/types';
import skins from '@cdo/apps/maze/skins';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

interface NeighborhoodAdapterProps {
  miniApp: MiniApp;
  children: ReactNode;
}

/**
 * Codebridge-side wiring for the Neighborhood mini-app. Reads
 * everything Neighborhood needs from apps' side of the boundary —
 * level properties, the serialized maze from redux, the maze skin
 * loader — and provides them through the package's
 * `NeighborhoodInputsContext`. The package's `NeighborhoodPreview`
 * (rendered inside `children`) consumes the context to boot
 * MazeController.
 *
 * Adapters are registered per mini-app in `miniAppRegistry`. Mini-apps
 * that don't need apps-side inputs (e.g. `demo`) register no adapter
 * and `MiniAppPreview` renders their `PreviewComponent` directly.
 */
const NeighborhoodAdapter = ({miniApp, children}: NeighborhoodAdapterProps) => {
  const {levelProperties} = useCodebridgeContext();
  const serializedMaze = useAppSelector(state => {
    const source = state.lab2Project.projectSources?.source as MultiFileSource;
    return findFile(source, MAZE_FILE_NAME, DEFAULT_FOLDER_ID)?.contents;
  });

  const skin = useMemo(() => {
    if (!levelProperties) return null;
    return skins.load(
      (path: string) => levelProperties.baseAssetUrl + path,
      NEIGHBORHOOD_NAME
    );
  }, [levelProperties]);

  const inputs = useMemo<NeighborhoodInputs>(
    () => ({
      miniApp: miniApp as NeighborhoodMiniApp,
      // apps still uses its legacy `LevelProperties` (apps/src/lab2/types.ts)
      // while the package consumes the canonical type from
      // @code-dot-org/core/api. The two shapes describe the same backend
      // response but have divergent `appName` enums; the cast bridges
      // them until apps migrates onto the core/api types.
      levelProperties: levelProperties as unknown as LevelProperties,
      skin,
      serializedMaze,
    }),
    [miniApp, levelProperties, skin, serializedMaze]
  );

  return (
    <NeighborhoodInputsContext.Provider value={inputs}>
      {children}
    </NeighborhoodInputsContext.Provider>
  );
};

export default NeighborhoodAdapter;
