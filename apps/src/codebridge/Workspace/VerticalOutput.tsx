import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import CodebridgeRegistry from '@codebridge/CodebridgeRegistry';
import {MiniApps} from '@codebridge/constants';
import {throttle} from 'lodash';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useResizable} from 'react-resizable-layout';

import {logOnResize} from '@cdo/apps/lab2/utils/resizeUtils';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import BaseOutput from './BaseOutput';
import {
  DEFAULT_MINI_APP_SIZE,
  MIN_MINI_APP_SIZE,
  MAX_MINI_APP_SIZE,
  MIN_CONSOLE_SIZE,
} from './constants';
import {scaleMiniApp} from './outputHelpers';

interface VerticalOutputProps {
  className?: string;
  width: number;
  setOutputWidth: (size: number) => void;
}

// Output component when the display is in horizontal mode. If you make an update here,
// you likely also should update HorizontalOutput.tsx. The components are split for readability.
const VerticalOutput: React.FunctionComponent<VerticalOutputProps> = ({
  className,
  width,
  setOutputWidth,
}) => {
  const {levelProperties} = useCodebridgeContext();
  const miniApp = useAppSelector(
    state => state.lab2Project.projectSources?.labConfig?.miniApp?.name
  );
  const style = {
    width,
  };
  const resizeContainerRef = useRef<HTMLDivElement>(null);
  const [consoleHeight, setConsoleHeight] = useState<number | undefined>(
    undefined
  );
  const appName = levelProperties.appName;
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [miniAppMinimizeHeight, setMiniAppMinimizeHeight] = useState(
    DEFAULT_MINI_APP_SIZE
  );
  const [outputMinimizeWidth, setOutputMinimizeWidth] = useState<number>(width);
  const [waitingForResize, setWaitingForResize] = useState<boolean>(false);

  const {
    position: miniAppHeight,
    separatorProps: miniAppSeparatorProps,
    isDragging: miniAppDragging,
    setPosition: setMiniAppHeight,
  } = useResizable({
    axis: 'y',
    initial: DEFAULT_MINI_APP_SIZE,
    min: MIN_MINI_APP_SIZE,
    max: MAX_MINI_APP_SIZE,
    containerRef: resizeContainerRef,
    onResizeStart: () =>
      logOnResize(appName, {
        layout: 'vertical',
        resizeBar: 'neighborhood',
      }),
  });

  const [adjustedMiniAppHeight, setAdjustedMiniAppHeight] =
    useState<number>(miniAppHeight);

  // When the width of the output is changed, re-fit the console to the
  // available space and resize the visualization if necessary.
  const handleResize = useCallback(
    (
      desiredWidth: number,
      miniAppName: string | undefined,
      miniAppSize: number
    ) => {
      // Fit the console to the new container.
      CodebridgeRegistry.getInstance()
        .getConsoleManager()
        ?.getTerminalFitAddon()
        ?.fit();

      // If this is a neighborhood level, also resize the visualization.
      if (
        miniAppName === MiniApps.Neighborhood &&
        (desiredWidth !== undefined || miniAppHeight)
      ) {
        const outputHeight = resizeContainerRef.current?.clientHeight;
        const newConsoleHeight = Math.max(
          MIN_CONSOLE_SIZE,
          (outputHeight || 0) - miniAppHeight
        );
        setConsoleHeight(newConsoleHeight);
        let newMiniAppHeight = miniAppSize;
        if (outputHeight) {
          newMiniAppHeight = Math.max(
            Math.min(miniAppSize, outputHeight - newConsoleHeight),
            MIN_MINI_APP_SIZE
          );
        }
        setAdjustedMiniAppHeight(newMiniAppHeight);

        const newHeight = newMiniAppHeight;
        const newWidth = desiredWidth;

        const scale = scaleMiniApp(newHeight, newWidth);
        CodebridgeRegistry.getInstance().setNeighborhoodThumbnailScale(scale);

        setWaitingForResize(false);
      }
    },
    [miniAppHeight]
  );

  const throttledResize = useMemo(
    () => throttle(handleResize, 20, {leading: false}),
    [handleResize]
  );

  useEffect(() => {
    if (width !== undefined || miniAppHeight !== undefined) {
      throttledResize(width, miniApp, miniAppHeight);
    }
  }, [width, miniApp, throttledResize, miniAppHeight]);

  const maximizeMiniApp = () => {
    setWaitingForResize(true);
    setMiniAppMinimizeHeight(adjustedMiniAppHeight);
    setOutputMinimizeWidth(width);
    setOutputWidth(MAX_MINI_APP_SIZE);
    setMiniAppHeight(MAX_MINI_APP_SIZE);
    setIsMaximized(true);
    throttledResize(width, miniApp, miniAppHeight);
  };

  const minimizeMiniApp = () => {
    setWaitingForResize(true);
    setMiniAppHeight(miniAppMinimizeHeight);
    setOutputWidth(outputMinimizeWidth);
    setIsMaximized(false);
    throttledResize(width, miniApp, miniAppHeight);
  };

  return (
    <BaseOutput
      style={style}
      consoleSize={consoleHeight}
      waitingForResize={waitingForResize}
      adjustedMiniAppSize={adjustedMiniAppHeight}
      isVertical={true}
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

export default VerticalOutput;
