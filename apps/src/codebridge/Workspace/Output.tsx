import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import MiniAppPreview from '@codebridge/MiniAppPreview/MiniAppPreview';
import classNames from 'classnames';
import {throttle} from 'lodash';
import React, {useCallback, useEffect, useMemo} from 'react';

import Console from '@cdo/apps/codebridge/Console/Console';

import CodebridgeRegistry from '../CodebridgeRegistry';
import {MiniApps} from '../constants';

import moduleStyles from './output.module.scss';

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

  // When the width or height of the output is changed, re-fit the console to the
  // available space and resize the visualization if necessary.
  const handleResize = useCallback(
    (
      desiredHeight: number | undefined,
      desiredWidth: number | undefined,
      miniAppName: string | undefined
    ) => {
      // Fit the console to the new container.
      CodebridgeRegistry.getInstance()
        .getConsoleManager()
        ?.getTerminalFitAddon()
        ?.fit();

      // If this is a neighborhood level, also resize the visualization.
      if (
        miniAppName === MiniApps.Neighborhood &&
        (desiredHeight !== undefined || desiredWidth !== undefined)
      ) {
        const defaultSize = 400;
        const newHeight =
          desiredHeight !== undefined ? desiredHeight : defaultSize;
        const newWidth =
          desiredWidth !== undefined ? desiredWidth : defaultSize;
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
    if (height !== undefined || width !== undefined) {
      throttledResize(height, width, miniApp);
    }
  }, [height, width, miniApp, throttledResize]);

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

  return (
    <div
      className={classNames(
        moduleStyles.outputContainer,
        isVertical ? moduleStyles.vertical : moduleStyles.horizontal,
        className
      )}
      style={style}
    >
      <MiniAppPreview />
      <Console />
    </div>
  );
};

export default Output;
