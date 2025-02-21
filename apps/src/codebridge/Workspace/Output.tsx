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

import moduleStyles from './output.module.scss';

const DEFAULT_MINI_APP_SIZE = 400;
const MIN_MINI_APP_SIZE = 200;
const MIN_CONSOLE_SIZE = 200;
const MAX_MINI_APP_SIZE = 800;

interface OutputProps {
  className?: string;
  height?: number;
  width?: number;
}

const Output: React.FunctionComponent<OutputProps> = ({
  className,
  height,
  width,
}) => {
  const {config, labConfig} = useCodebridgeContext();
  const isVertical = config.activeLayout === 'vertical';
  const miniApp = labConfig?.miniApp?.name;
  const style = {
    height,
    width,
  };
  const resizeContainerRef = useRef<HTMLDivElement>(null);
  // In vertical mode, consoleSize is the height of the console.
  // In horizontal mode, consoleSize is the width of the console.
  const [consoleSize, setConsoleSize] = useState<number | undefined>(undefined);
  const appName = useAppSelector(state => state.lab.levelProperties?.appName);

  const {
    position: miniAppSize,
    separatorProps: miniAppSeparatorProps,
    isDragging: miniAppDragging,
  } = useResizable({
    axis: isVertical ? 'y' : 'x',
    initial: DEFAULT_MINI_APP_SIZE,
    min: MIN_MINI_APP_SIZE,
    max: MAX_MINI_APP_SIZE,
    containerRef: resizeContainerRef,
    onResizeStart: () =>
      logOnResize(appName, {
        layout: config.activeLayout || '',
        resizeBar: 'neighborhood',
      }),
  });

  const [adjustedMiniAppSize, setAdjustedMiniAppSize] =
    useState<number>(miniAppSize);

  // When the width or height of the output is changed, re-fit the console to the
  // available space and resize the visualization if necessary.
  const handleResize = useCallback(
    (
      desiredHeight: number | undefined,
      desiredWidth: number | undefined,
      miniAppName: string | undefined,
      miniAppSize: number,
      isVertical: boolean
    ) => {
      // Fit the console to the new container.
      CodebridgeRegistry.getInstance()
        .getConsoleManager()
        ?.getTerminalFitAddon()
        ?.fit();

      // If this is a neighborhood level, also resize the visualization.
      if (
        miniAppName === MiniApps.Neighborhood &&
        (desiredHeight !== undefined ||
          desiredWidth !== undefined ||
          miniAppSize)
      ) {
        const outputSize = isVertical
          ? desiredHeight || resizeContainerRef.current?.clientHeight
          : desiredWidth || resizeContainerRef.current?.clientWidth;
        const newConsoleSize = Math.max(
          MIN_CONSOLE_SIZE,
          (outputSize || 0) - miniAppSize
        );
        setConsoleSize(newConsoleSize);
        let newMiniAppSize = miniAppSize;
        if (outputSize) {
          newMiniAppSize = Math.max(
            Math.min(miniAppSize, outputSize - newConsoleSize),
            MIN_MINI_APP_SIZE
          );
        }
        setAdjustedMiniAppSize(newMiniAppSize);

        // In vertical mode, miniAppSize is the height of the mini app.
        // In horizontal mode, miniAppSize is the width of the mini app.
        const newHeight = isVertical
          ? newMiniAppSize
          : desiredHeight !== undefined
          ? desiredHeight
          : DEFAULT_MINI_APP_SIZE;
        const newWidth = !isVertical
          ? newMiniAppSize
          : desiredWidth !== undefined
          ? desiredWidth
          : DEFAULT_MINI_APP_SIZE;
        const sliderHeight = 37;
        // The original visualization is rendered at 800x800.
        const originalVisualizationWidth = 800;
        const headerSize = 40;
        const availableHeight = newHeight - headerSize - sliderHeight;
        const newVisualizationWidth = Math.min(availableHeight, newWidth);
        // Scale the visualization.
        let scale = newVisualizationWidth / originalVisualizationWidth;
        if (scale < 0) {
          // Avoid inverting.
          scale = 0;
        }
        const scaleCss = `scale(${scale})`;
        $('#svgMaze').css({
          transform: scaleCss,
          'transform-origin': '0 0',
          position: 'absolute',
        });

        // Scale the visualization div
        $('#visualization').css({
          height: newVisualizationWidth,
          width: newVisualizationWidth,
          'margin-left': (newWidth - newVisualizationWidth) / 2,
        });
      }
    },
    []
  );

  const throttledResize = useMemo(
    () => throttle(handleResize, 30),
    [handleResize]
  );

  useEffect(() => {
    if (
      height !== undefined ||
      width !== undefined ||
      miniAppSize !== undefined
    ) {
      throttledResize(height, width, miniApp, miniAppSize, isVertical);
    }
  }, [height, width, miniApp, throttledResize, miniAppSize, isVertical]);

  useEffect(() => {
    // Fit the console to the new container.
    CodebridgeRegistry.getInstance()
      .getConsoleManager()
      ?.getTerminalFitAddon()
      ?.fit();
  }, [consoleSize]);

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

  const miniAppStyle = isVertical
    ? {height: adjustedMiniAppSize}
    : {width: adjustedMiniAppSize};

  const consoleStyle = isVertical
    ? {height: consoleSize}
    : {width: consoleSize};

  return (
    <div
      className={classNames(
        moduleStyles.outputContainer,
        isVertical ? moduleStyles.vertical : moduleStyles.horizontal,
        className
      )}
      style={style}
      ref={resizeContainerRef}
    >
      <div style={miniAppStyle} className={moduleStyles.flexShrink0}>
        <MiniAppPreview />
      </div>
      <ResizeBar
        isVertical={!isVertical}
        separatorProps={miniAppSeparatorProps}
        isDragging={miniAppDragging}
      />
      <div style={consoleStyle} className={moduleStyles.flexShrink0}>
        <Console />
      </div>
    </div>
  );
};

export default Output;
