import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import CodebridgeRegistry from '@codebridge/CodebridgeRegistry';
import {
  DEFAULT_FOLDER_ID,
  MAZE_FILE_NAME,
  MiniApps,
} from '@codebridge/constants';
import {findFile} from '@codebridge/utils';
import {throttle} from 'lodash';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';

import {setIsRunning} from '@cdo/apps/lab2/redux/systemRedux';
import {MazeCell} from '@cdo/apps/lab2/types';
import skins from '@cdo/apps/maze/skins';
import Neighborhood from '@cdo/apps/miniApps/neighborhood/Neighborhood';
import NeighborhoodVisualization from '@cdo/apps/miniApps/neighborhood/NeighborhoodVisualization';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {DEFAULT_MINI_APP_SIZE} from '../Workspace/constants';
import {scaleMiniApp} from '../Workspace/outputHelpers';

import moduleStyles from './mini-app-preview.module.scss';

interface NeighborhoodPreviewProps {
  handleScaling?: boolean;
}

// Preview panel for the neighborhood mini app.
const NeighborhoodPreview: React.FunctionComponent<
  NeighborhoodPreviewProps
> = ({handleScaling}) => {
  const levelProperties = useAppSelector(state => state.lab.levelProperties);
  const {source, config} = useCodebridgeContext();
  const serializedMaze = findFile(
    source,
    MAZE_FILE_NAME,
    DEFAULT_FOLDER_ID
  )?.contents;
  const dispatch = useAppDispatch();
  const isVertical = config.activeLayout === 'vertical';
  const containerRef = useRef<HTMLDivElement>(null);

  const scaleNeighborhood = useCallback(() => {
    const width = containerRef.current?.clientWidth || DEFAULT_MINI_APP_SIZE;
    const height = containerRef.current?.clientHeight || DEFAULT_MINI_APP_SIZE;
    scaleMiniApp(height, width);
  }, []);

  const throttledScaleNeighborhood = useMemo(
    () => throttle(scaleNeighborhood, 30),
    [scaleNeighborhood]
  );

  // If handleScaling is true, scale neighborhood on load, and on resize.
  useEffect(() => {
    if (handleScaling) {
      throttledScaleNeighborhood();
      window.addEventListener('resize', throttledScaleNeighborhood);
      return () =>
        window.removeEventListener('resize', throttledScaleNeighborhood);
    }
  }, [throttledScaleNeighborhood, handleScaling]);

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

    const mazeContents = serializedMaze
      ? (JSON.parse(serializedMaze) as MazeCell[][])
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
  }, [
    dispatch,
    levelProperties,
    isVertical,
    neighborhoodSkin,
    serializedMaze,
    neighborhood,
  ]);

  return (
    <div ref={containerRef} className={moduleStyles.miniAppContainer}>
      <NeighborhoodVisualization isDarkMode={true} useProtectedDiv={false} />
    </div>
  );
};

export default NeighborhoodPreview;
