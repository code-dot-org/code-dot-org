import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import CodebridgeRegistry from '@codebridge/CodebridgeRegistry';
import {MiniApps} from '@codebridge/constants';
import {throttle} from 'lodash';
import React, {useRef, useState, useCallback, useMemo, useEffect} from 'react';
import {useResizable} from 'react-resizable-layout';

import {logOnResize} from '@cdo/apps/lab2/utils/logOnResize';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import BaseOutput from './BaseOutput';
import {
  DEFAULT_MINI_APP_SIZE,
  MIN_MINI_APP_SIZE,
  MAX_MINI_APP_SIZE,
  MIN_CONSOLE_SIZE,
} from './constants';
import {scaleMiniApp} from './outputHelpers';

interface HorizontalOutputProps {
  height: number;
  width?: number;
  setOutputHeight: (height: number) => void;
  className?: string;
}

// Output component when the display is in horizontal mode. If you make an update here,
// you likely also should update VerticalOutput.tsx. The components are split for readability.
const HorizontalOutput: React.FunctionComponent<HorizontalOutputProps> = ({
  height,
  width,
  setOutputHeight,
  className,
}) => {
  const {levelProperties} = useCodebridgeContext();

  const miniApp = useAppSelector(
    state => state.lab2Project.projectSources?.labConfig?.miniApp?.name
  );
  const style = {
    height,
  };
  const resizeContainerRef = useRef<HTMLDivElement>(null);
  const [consoleWidth, setConsoleWidth] = useState<number | undefined>(
    undefined
  );
  const appName = levelProperties.appName;
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [miniAppMinimizeWidth, setMiniAppMinimizeWidth] = useState(
    DEFAULT_MINI_APP_SIZE
  );
  const [outputMinimizeHeight, setOutputMinimizeHeight] = useState<number>(
    height || DEFAULT_MINI_APP_SIZE
  );
  const [waitingForResize, setWaitingForResize] = useState<boolean>(false);

  const {
    position: miniAppWidth,
    separatorProps: miniAppSeparatorProps,
    isDragging: miniAppDragging,
    setPosition: setMiniAppWidth,
  } = useResizable({
    axis: 'x',
    initial: DEFAULT_MINI_APP_SIZE,
    min: MIN_MINI_APP_SIZE,
    max: MAX_MINI_APP_SIZE,
    containerRef: resizeContainerRef,
    onResizeStart: () =>
      logOnResize(appName, {
        layout: 'horizontal',
        resizeBar: 'neighborhood',
      }),
  });

  const [adjustedMiniAppWidth, setAdjustedMiniAppWidth] =
    useState<number>(miniAppWidth);

  // When the width or height of the output is changed, re-fit the console to the
  // available space and resize the visualization if necessary.
  const handleResize = useCallback(
    (
      desiredHeight: number | undefined,
      desiredWidth: number | undefined,
      miniAppName: string | undefined,
      miniAppWidth: number
    ) => {
      // Fit the console to the new container.
      CodebridgeRegistry.getInstance()
        .getConsoleManager()
        ?.getTerminalFitAddon()
        ?.fit();

      // If this is a neighborhood level, also resize the visualization.
      if (
        miniAppName === MiniApps.Neighborhood &&
        (desiredHeight !== undefined || miniAppWidth)
      ) {
        const outputWidth =
          desiredWidth || resizeContainerRef.current?.clientWidth;
        const newConsoleWidth = Math.max(
          MIN_CONSOLE_SIZE,
          (outputWidth || 0) - miniAppWidth
        );
        setConsoleWidth(newConsoleWidth);
        let newMiniAppWidth = miniAppWidth;
        if (outputWidth) {
          newMiniAppWidth = Math.max(
            Math.min(miniAppWidth, outputWidth - newConsoleWidth),
            MIN_MINI_APP_SIZE
          );
        }
        setAdjustedMiniAppWidth(newMiniAppWidth);

        const newHeight = desiredHeight || DEFAULT_MINI_APP_SIZE;
        const newWidth = newMiniAppWidth;

        const scale = scaleMiniApp(newHeight, newWidth);
        CodebridgeRegistry.getInstance().setNeighborhoodThumbnailScale(scale);

        setWaitingForResize(false);
      }
    },
    []
  );

  const throttledResize = useMemo(
    () => throttle(handleResize, 20, {leading: false}),
    [handleResize]
  );

  const maximizeMiniApp = () => {
    setWaitingForResize(true);
    setMiniAppMinimizeWidth(adjustedMiniAppWidth);
    setOutputMinimizeHeight(height || DEFAULT_MINI_APP_SIZE);
    setOutputHeight(MAX_MINI_APP_SIZE);
    setMiniAppWidth(MAX_MINI_APP_SIZE);
    setIsMaximized(true);
    throttledResize(height, width, miniApp, miniAppWidth);
  };

  const minimizeMiniApp = () => {
    setWaitingForResize(true);
    setMiniAppWidth(miniAppMinimizeWidth);
    setOutputHeight(outputMinimizeHeight);
    setIsMaximized(false);
    throttledResize(height, width, miniApp, miniAppWidth);
  };

  useEffect(() => {
    if (
      height !== undefined ||
      width !== undefined ||
      miniAppWidth !== undefined
    ) {
      throttledResize(height, width, miniApp, miniAppWidth);
    }
  }, [height, width, miniApp, throttledResize, miniAppWidth]);

  return (
    <BaseOutput
      style={style}
      consoleSize={consoleWidth}
      waitingForResize={waitingForResize}
      adjustedMiniAppSize={adjustedMiniAppWidth}
      isVertical={false}
      maximizeMiniApp={maximizeMiniApp}
      minimizeMiniApp={minimizeMiniApp}
      miniAppSeparatorProps={miniAppSeparatorProps}
      resizeContainerRef={resizeContainerRef}
      isMaximized={isMaximized}
      miniAppDragging={miniAppDragging}
      className={className}
      miniApp={miniApp}
    />
  );
};

export default HorizontalOutput;
