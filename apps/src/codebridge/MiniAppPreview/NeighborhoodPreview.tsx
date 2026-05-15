import {
  NEIGHBORHOOD_NAME,
  NeighborhoodMiniApp,
} from '@code-dot-org/neighborhood-mini-app';
import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import CodebridgeRegistry from '@codebridge/CodebridgeRegistry';
import {DEFAULT_FOLDER_ID, MAZE_FILE_NAME} from '@codebridge/constants';
import {findFile} from '@codebridge/utils';
import {throttle} from 'lodash';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';

import {setIsRunning} from '@cdo/apps/lab2/redux/systemRedux';
import {MazeCell, MultiFileSource} from '@cdo/apps/lab2/types';
import skins from '@cdo/apps/maze/skins';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {DEFAULT_MINI_APP_SIZE} from '../Workspace/constants';
import {scaleMiniApp} from '../Workspace/outputHelpers';

import moduleStyles from './mini-app-preview.module.scss';

interface NeighborhoodPreviewProps {
  handleScaling?: boolean;
  /**
   * The mini-app's `PreviewComponent` — i.e. the SVG visualization the
   * package owns. We host it inside the orchestration container so the
   * scaling ref / container styles still apply.
   */
  children?: React.ReactNode;
}

/**
 * Codebridge-side orchestrator for the Neighborhood mini-app. Owns the
 * apps-only wiring — codebridge context, redux, the maze skin loader,
 * and the scaling-container ref — and hosts the package's
 * visualization as `children`. The package owns the rendered DOM; this
 * component owns the surrounding effects.
 */
const NeighborhoodPreview: React.FunctionComponent<
  NeighborhoodPreviewProps
> = ({handleScaling, children}) => {
  const {config, levelProperties} = useCodebridgeContext();
  const serializedMaze = useAppSelector(state => {
    const source = state.lab2Project.projectSources?.source as MultiFileSource;
    return findFile(source, MAZE_FILE_NAME, DEFAULT_FOLDER_ID)?.contents;
  });
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

  const miniApp = useMemo(() => {
    // The console manager isn't stored in a local because it may not
    // exist at the time of mini-app creation; we resolve it lazily on
    // each callback invocation.
    const consoleManager = () =>
      CodebridgeRegistry.getInstance().getConsoleManager();

    const instance = new NeighborhoodMiniApp({
      onOutputMessage: msg => consoleManager()?.writeConsoleMessage(msg),
      onNewlineMessage: () => consoleManager()?.writeConsoleMessage(''),
      onPartialOutputMessage: msg => consoleManager()?.writePartialLine(msg),
      setIsRunning: running => dispatch(setIsRunning(running)),
    });
    CodebridgeRegistry.getInstance().setMiniApp(instance);
    return instance;
  }, [dispatch]);

  const neighborhoodSkin = useMemo(() => {
    if (!levelProperties) {
      return null;
    }
    return skins.load(
      (path: string) => levelProperties.baseAssetUrl + path,
      NEIGHBORHOOD_NAME
    );
  }, [levelProperties]);

  useEffect(() => {
    if (!levelProperties || !neighborhoodSkin || !serializedMaze) {
      return;
    }

    let mazeContents: MazeCell[][] | undefined;
    if (serializedMaze) {
      try {
        mazeContents = JSON.parse(serializedMaze) as MazeCell[][];
      } catch (error) {
        console.error('Failed to parse serialized maze:', error);
      }
    }

    // Combine the serialized maze from the project with the level properties.
    const parsedLevelProperties = mazeContents
      ? {...levelProperties, serializedMaze: mazeContents}
      : levelProperties;

    miniApp.getNeighborhood().afterInject(
      parsedLevelProperties,
      neighborhoodSkin,
      {
        skinId: NEIGHBORHOOD_NAME,
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
    miniApp,
  ]);

  return (
    <div ref={containerRef} className={moduleStyles.miniAppContainer}>
      {children}
    </div>
  );
};

export default NeighborhoodPreview;
