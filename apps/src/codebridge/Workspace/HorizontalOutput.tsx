import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import MiniAppPreview from '@codebridge/MiniAppPreview/MiniAppPreview';
import classNames from 'classnames';
import {throttle} from 'lodash';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useResizable} from 'react-resizable-layout';

import Console from '@cdo/apps/codebridge/Console/Console';
import ResizeBar from '@cdo/apps/lab2/views/components/ResizeBar';

import CodebridgeRegistry from '../CodebridgeRegistry';
import {MiniApps} from '../constants';

import moduleStyles from './output.module.scss';

const DEFAULT_MINI_APP_WIDTH = 400;
const MIN_MINI_APP_WIDTH = 200;
const MIN_CONSOLE_WIDTH = 200;
const MAX_MINI_APP_WIDTH = 800;

interface HorizontalOutputProps {
  className?: string;
  height?: number;
  width?: number;
}

const HorizontalOutput: React.FunctionComponent<HorizontalOutputProps> = ({
  className,
  height,
  width,
}) => {
  const {labConfig} = useCodebridgeContext();
  const isVertical = false;
  const miniApp = labConfig?.miniApp?.name;
  const style = {
    height,
    width,
  };
  const resizeContainerRef = useRef<HTMLDivElement>(null);
  const [consoleWidth, setConsoleWidth] = useState<number | undefined>(
    undefined
  );

  const {
    position: miniAppWidth,
    separatorProps: miniAppSeparatorProps,
    isDragging: miniAppDragging,
  } = useResizable({
    axis: 'x',
    initial: DEFAULT_MINI_APP_WIDTH,
    min: MIN_MINI_APP_WIDTH,
    max: MAX_MINI_APP_WIDTH,
    containerRef: resizeContainerRef,
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
        (desiredWidth !== undefined || miniAppWidth)
      ) {
        const outputWidth =
          desiredWidth || resizeContainerRef.current?.clientWidth;
        const newConsoleWidth = Math.max(
          MIN_CONSOLE_WIDTH,
          (outputWidth || 0) - miniAppWidth
        );
        setConsoleWidth(newConsoleWidth);
        let newMiniAppWidth = miniAppWidth;
        if (outputWidth) {
          newMiniAppWidth = Math.max(
            Math.min(miniAppWidth, outputWidth - newConsoleWidth),
            MIN_MINI_APP_WIDTH
          );
        }
        setAdjustedMiniAppWidth(newMiniAppWidth);
        const newHeight =
          desiredHeight !== undefined ? desiredHeight : DEFAULT_MINI_APP_WIDTH;
        const newWidth = newMiniAppWidth;

        const sliderHeight = 60;
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
      miniAppWidth !== undefined
    ) {
      throttledResize(height, width, miniApp, miniAppWidth);
    }
  }, [height, width, miniApp, throttledResize, miniAppWidth]);

  useEffect(() => {
    // Fit the console to the new container.
    CodebridgeRegistry.getInstance()
      .getConsoleManager()
      ?.getTerminalFitAddon()
      ?.fit();
  }, [consoleWidth]);

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

  const miniAppStyle = {width: adjustedMiniAppWidth};

  const consoleStyle = {width: consoleWidth};

  return (
    <div
      className={classNames(
        moduleStyles.outputContainer,
        moduleStyles.horizontal,
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

export default HorizontalOutput;
