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
}

const Output: React.FunctionComponent<OutputProps> = ({className, height}) => {
  const {config, labConfig} = useCodebridgeContext();
  const isVertical = config.activeGridLayout === 'vertical';
  const miniApp = labConfig?.miniApp?.name;

  const handleResize = useCallback(
    (desiredHeight: number, miniAppName: string | undefined) => {
      // Fit the console to the new container.
      CodebridgeRegistry.getInstance()
        .getConsoleManager()
        ?.getTerminalFitAddon()
        ?.fit();

      // If this is a neighborhood level, also resize the visualization.
      if (
        miniAppName === MiniApps.Neighborhood &&
        desiredHeight !== undefined
      ) {
        const sliderHeight = 60;
        // The original visualization is rendered at 800x800.
        const originalVisualizationWidth = 800;
        const headerSize = 40;
        const availableHeight = desiredHeight - headerSize - sliderHeight;
        // For now the width is always 400px.
        const availableWidth = 400;
        const newVisualizationWidth = Math.min(availableHeight, availableWidth);
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
          'margin-left': (availableWidth - newVisualizationWidth) / 2,
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
    if (height !== undefined) {
      throttledResize(height, miniApp);
    }
  }, [height, miniApp, throttledResize]);

  if (!miniApp) {
    return (
      <div
        className={classNames(moduleStyles.outputContainer, className)}
        style={{height: height}}
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
      style={{height: height}}
    >
      <MiniAppPreview />
      <Console />
    </div>
  );
};

export default Output;
