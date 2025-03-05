import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import MiniAppPreview from '@codebridge/MiniAppPreview/MiniAppPreview';
import classNames from 'classnames';
import {throttle} from 'lodash';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useResizable} from 'react-resizable-layout';

import Console from '@cdo/apps/codebridge/Console/Console';
import {logOnResize} from '@cdo/apps/lab2/utils/logOnResize';
import ResizeBar from '@cdo/apps/lab2/views/components/ResizeBar';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import CodebridgeRegistry from '../CodebridgeRegistry';
import {MiniApps} from '../constants';

import {scaleMiniApp} from './outputHelpers';

import moduleStyles from './output.module.scss';

const DEFAULT_MINI_APP_SIZE = 400;
const MIN_MINI_APP_SIZE = 200;
const MIN_CONSOLE_SIZE = 200;
const MAX_MINI_APP_SIZE = 800;

interface VerticalOutputProps {
  className?: string;
  width: number;
  setOutputWidth: (size: number) => void;
}

const VerticalOutput: React.FunctionComponent<VerticalOutputProps> = ({
  className,
  width,
  setOutputWidth,
}) => {
  const {labConfig} = useCodebridgeContext();
  const miniApp = labConfig?.miniApp?.name;
  const style = {
    width,
  };
  const resizeContainerRef = useRef<HTMLDivElement>(null);
  // In vertical mode, consoleSize is the height of the console.
  // In horizontal mode, consoleSize is the width of the console.
  const [consoleHeight, setConsoleHeight] = useState<number | undefined>(
    undefined
  );
  const appName = useAppSelector(state => state.lab.levelProperties?.appName);
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
        scaleMiniApp(newHeight, newWidth);

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

  useEffect(() => {
    // Fit the console to the new container.
    CodebridgeRegistry.getInstance()
      .getConsoleManager()
      ?.getTerminalFitAddon()
      ?.fit();
  }, [consoleHeight]);

  if (!miniApp) {
    return (
      <div
        className={classNames(moduleStyles.outputContainer, className)}
        style={style}
      >
        <Console />
      </div>
    );
  }

  // We set the opacity to 0 when we initiate a maximize or minimize action
  // so the use doesn't see a flash of the incorrectly-sized preview
  // while maximizing/minimizing.
  const previewOpacity = waitingForResize ? 0 : 1;

  const miniAppStyle = {height: adjustedMiniAppHeight};

  const consoleStyle = {height: consoleHeight};

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
    <div
      className={classNames(
        moduleStyles.outputContainer,
        moduleStyles.vertical,
        className
      )}
      style={style}
      ref={resizeContainerRef}
    >
      <div style={miniAppStyle} className={moduleStyles.flexShrink0}>
        <MiniAppPreview
          maximizeMiniApp={maximizeMiniApp}
          minimizeMiniApp={minimizeMiniApp}
          isMaximized={isMaximized}
          style={{opacity: previewOpacity}}
        />
      </div>
      <ResizeBar
        isVertical={false}
        separatorProps={miniAppSeparatorProps}
        isDragging={miniAppDragging}
      />
      <div style={consoleStyle} className={moduleStyles.flexShrink0}>
        <Console />
      </div>
    </div>
  );
};

export default VerticalOutput;
