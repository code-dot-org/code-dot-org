import MiniAppPreview from '@codebridge/MiniAppPreview/MiniAppPreview';
import classNames from 'classnames';
import React, {useEffect} from 'react';
import {SeparatorProps} from 'react-resizable-layout';

import Console from '@cdo/apps/codebridge/Console/Console';
import ResizeBar from '@cdo/apps/lab2/views/components/layout/ResizeBar';

import CodebridgeRegistry from '../CodebridgeRegistry';

import moduleStyles from './output.module.scss';

interface OutputProps {
  consoleSize: number | undefined;
  style: React.CSSProperties;
  className?: string;
  miniApp?: string;
  waitingForResize: boolean;
  adjustedMiniAppSize: number;
  isVertical: boolean;
  maximizeMiniApp: () => void;
  minimizeMiniApp: () => void;
  miniAppSeparatorProps: SeparatorProps;
  resizeContainerRef: React.RefObject<HTMLDivElement>;
  isMaximized: boolean;
  miniAppDragging: boolean;
}

// Component for program output (console and mini app preview, if it exists).
// This component is used by HorizontalOutput and VerticalOutput, which wrap it with additional layout logic.
const BaseOutput: React.FunctionComponent<OutputProps> = ({
  style,
  className,
  consoleSize,
  miniApp,
  waitingForResize,
  adjustedMiniAppSize,
  isVertical,
  maximizeMiniApp,
  minimizeMiniApp,
  miniAppSeparatorProps,
  resizeContainerRef,
  isMaximized,
  miniAppDragging,
}) => {
  useEffect(() => {
    // Fit the console to the new container when the console size changes.
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

  // We set the opacity to 0 when we initiate a maximize or minimize action
  // so the use doesn't see a flash of the incorrectly-sized preview
  // while maximizing/minimizing.
  const previewOpacity = waitingForResize ? 0 : 1;

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
        <MiniAppPreview
          maximizeMiniApp={maximizeMiniApp}
          minimizeMiniApp={minimizeMiniApp}
          isMaximized={isMaximized}
          style={{opacity: previewOpacity}}
        />
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

export default BaseOutput;
