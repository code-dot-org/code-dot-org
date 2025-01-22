import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import CodebridgeRegistry from '@codebridge/CodebridgeRegistry';
import {
  DEFAULT_FOLDER_ID,
  MAZE_FILE_NAME,
  MiniApps,
} from '@codebridge/constants';
import {findFile} from '@codebridge/utils';
import React, {useEffect, useMemo} from 'react';

import {setIsRunning} from '@cdo/apps/lab2/redux/systemRedux';
import {MazeCell} from '@cdo/apps/lab2/types';
import skins from '@cdo/apps/maze/skins';
import Neighborhood from '@cdo/apps/miniApps/neighborhood/Neighborhood';
import NeighborhoodVisualization from '@cdo/apps/miniApps/neighborhood/NeighborhoodVisualization';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

// Preview panel for the neighborhood mini app.
const NeighborhoodPreview: React.FunctionComponent = () => {
  const levelProperties = useAppSelector(state => state.lab.levelProperties);
  const {source, config} = useCodebridgeContext();
  const serializedMaze = findFile(source, MAZE_FILE_NAME, DEFAULT_FOLDER_ID);
  const dispatch = useAppDispatch();
  const isVertical = config.activeGridLayout === 'vertical';

  const neighborhood = useMemo(() => {
    const neighborhoodRef = new Neighborhood(
      message =>
        CodebridgeRegistry.getInstance()
          .getConsoleManager()
          ?.writeConsoleMessage(message),
      () =>
        CodebridgeRegistry.getInstance()
          .getConsoleManager()
          ?.writeConsoleMessage(''),
      isRunning => dispatch(setIsRunning(isRunning)),
      '[PYTHON LAB]'
    );
    CodebridgeRegistry.getInstance().setNeighborhood(neighborhoodRef);
    return neighborhoodRef;
  }, [dispatch]);

  const neighborhoodSkin = useMemo(() => {
    if (!levelProperties) {
      return null;
    }
    return skins.load(
      (path: string) => levelProperties.baseAssetUrl + path,
      MiniApps.Neighborhood
    );
  }, [levelProperties]);

  useEffect(() => {
    if (!levelProperties || !neighborhoodSkin || !serializedMaze) {
      return;
    }

    const mazeContents = serializedMaze?.contents
      ? (JSON.parse(serializedMaze.contents) as MazeCell[][])
      : undefined;

    // Combine the serialized maze from the project with the level properties.
    const parsedLevelProperties = mazeContents
      ? {...levelProperties, serializedMaze: mazeContents}
      : levelProperties;

    neighborhood.afterInject(
      parsedLevelProperties,
      neighborhoodSkin,
      {
        skinId: MiniApps.Neighborhood,
        level: parsedLevelProperties,
        skin: neighborhoodSkin,
      },
      () => {},
      () => {},
      () => {},
      () => {}
    );

    // The vertical version of the mini app is a static size for now,
    // so we can hard-code the css. The horizontal version is resizable,
    // and the css is handled by WorkspaceAndOutput.
    if (isVertical) {
      $('#visualization').css({
        height: '400px',
        width: '400px',
      });

      $('#svgMaze').css({
        transform: 'scale(0.5)',
        'transform-origin': '0 0',
        position: 'absolute',
      });
    }
  }, [
    dispatch,
    levelProperties,
    isVertical,
    neighborhoodSkin,
    serializedMaze,
    neighborhood,
  ]);

  return (
    <NeighborhoodVisualization isDarkMode={true} useProtectedDiv={false} />
  );
};

export default NeighborhoodPreview;
