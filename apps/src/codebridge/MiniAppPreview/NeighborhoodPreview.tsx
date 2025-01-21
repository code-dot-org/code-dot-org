import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {
  DEFAULT_FOLDER_ID,
  MAZE_FILE_NAME,
  MiniApps,
} from '@codebridge/constants';
import React, {useEffect, useMemo, useState} from 'react';

import {setIsRunning} from '@cdo/apps/lab2/redux/systemRedux';
import {MazeCell} from '@cdo/apps/lab2/types';
import skins from '@cdo/apps/maze/skins';
import Neighborhood from '@cdo/apps/miniApps/neighborhood/Neighborhood';
import NeighborhoodVisualization from '@cdo/apps/miniApps/neighborhood/NeighborhoodVisualization';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import CodebridgeRegistry from '../CodebridgeRegistry';
import {findFile} from '../utils';

// Preview panel for the neighborhood mini app.
const NeighborhoodPreview: React.FunctionComponent = () => {
  const levelProperties = useAppSelector(state => state.lab.levelProperties);
  const {source} = useCodebridgeContext();
  const serializedMaze = findFile(source, MAZE_FILE_NAME, DEFAULT_FOLDER_ID);
  const dispatch = useAppDispatch();
  const {config} = useCodebridgeContext();
  const isVertical = config.activeGridLayout === 'vertical';
  const [waitingToLoad, setWaitingToLoad] = useState(true);

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
    setWaitingToLoad(true);
    const mazeContents = serializedMaze?.contents
      ? (JSON.parse(serializedMaze.contents) as MazeCell[][])
      : undefined;
    console.log({mazeContents});
    const parsedLevelProperties = mazeContents
      ? {...levelProperties, serializedMaze: mazeContents}
      : levelProperties;

    setWaitingToLoad(false);
    const neighborhood = new Neighborhood(
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
    CodebridgeRegistry.getInstance().setNeighborhood(neighborhood);

    setTimeout(() => {
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
    }, 100);
  }, [dispatch, levelProperties, isVertical, neighborhoodSkin, serializedMaze]);

  return waitingToLoad ? null : (
    <NeighborhoodVisualization isDarkMode={true} useProtectedDiv={false} />
  );
};

export default NeighborhoodPreview;
