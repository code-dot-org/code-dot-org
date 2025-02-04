import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import MiniAppPreview from '@codebridge/MiniAppPreview/MiniAppPreview';
import classNames from 'classnames';
import React, {useEffect} from 'react';

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

  useEffect(() => {
    const normalizeMiniAppSize = () => {
      // If this is a neighborhood level, also resize the visualization.
      if (miniApp === MiniApps.Neighborhood && height !== undefined) {
        const sliderHeight = 60;
        // The original visualization is rendered at 800x800.
        const originalVisualizationWidth = 800;
        const headerSize = 40;
        const availableHeight = height - headerSize - sliderHeight;
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
    };
    if (height !== undefined) {
      normalizeMiniAppSize();
      console.log('fitting?');
      console.log(
        CodebridgeRegistry.getInstance()
          .getConsoleManager()
          ?.getTerminalFitAddon()
      );
      CodebridgeRegistry.getInstance()
        .getConsoleManager()
        ?.getTerminalFitAddon()
        ?.fit();
    }
  }, [height, miniApp]);

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
