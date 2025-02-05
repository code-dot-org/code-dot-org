import ResizeBar from '@codebridge/components/ResizerBar';
import {InfoPanel} from '@codebridge/InfoPanel';
import Workspace from '@codebridge/Workspace';
import Output from '@codebridge/Workspace/Output';
import React, {useEffect} from 'react';
import {useResizable} from 'react-resizable-layout';

import moduleStyles from './horizontal-layout.module.scss';

const MIN_INFO_PANEL_WIDTH = 100;
const MIN_CONSOLE_WIDTH = 200;
const MIN_EDITOR_WIDTH = 400;

const VerticalLayout: React.FunctionComponent = () => {
  const layoutContainerRef = React.useRef<HTMLDivElement>(null);
  const outputContainerRef = React.useRef<HTMLDivElement>(null);
  const [infoPanelWidth, setInfoPanelWidth] = React.useState<number>(300);
  const [editorWidth, setEditorWidth] = React.useState<number | undefined>(
    undefined
  );
  const [outputWidth, setOutputWidth] = React.useState<number>(400);
  const {
    position: rawInfoPanelWidth,
    separatorProps: infoPanelSeparatorProps,
    isDragging: infoPanelDragging,
  } = useResizable({
    axis: 'x',
    initial: 300,
    min: MIN_INFO_PANEL_WIDTH,
    containerRef: layoutContainerRef,
  });

  const {
    position: rawOutputWidth,
    separatorProps: outputSeparatorProps,
    isDragging: outputDragging,
  } = useResizable({
    axis: 'x',
    initial: 400,
    min: MIN_CONSOLE_WIDTH,
    reverse: true,
    containerRef: outputContainerRef,
  });

  useEffect(() => {
    const adjustedEditorWidth = Math.max(
      window.innerWidth - rawInfoPanelWidth - rawOutputWidth - 26,
      MIN_EDITOR_WIDTH
    );
    setEditorWidth(adjustedEditorWidth);
    const spaceForOutput = Math.max(
      window.innerWidth - rawInfoPanelWidth - 26 - adjustedEditorWidth,
      MIN_CONSOLE_WIDTH
    );
    const adjustedOutputWidth = Math.min(rawOutputWidth, spaceForOutput);
    setOutputWidth(adjustedOutputWidth);
    const spaceForInfoPanel = Math.max(
      window.innerWidth - adjustedOutputWidth - 26 - adjustedEditorWidth,
      MIN_EDITOR_WIDTH
    );
    const adjustedInfoPanelWidth = Math.min(
      rawInfoPanelWidth,
      spaceForInfoPanel
    );
    setInfoPanelWidth(adjustedInfoPanelWidth);
  }, [rawInfoPanelWidth, rawOutputWidth]);

  return (
    <div className={moduleStyles.layoutContainer} ref={layoutContainerRef}>
      <InfoPanel style={{width: infoPanelWidth}} />
      <ResizeBar
        isVertical={true}
        {...infoPanelSeparatorProps}
        isDragging={infoPanelDragging}
      />
      <div style={{width: editorWidth}}>
        <Workspace className={moduleStyles.workspace} />
      </div>
      <ResizeBar
        isVertical={true}
        {...outputSeparatorProps}
        isDragging={outputDragging}
      />
      <div ref={outputContainerRef}>
        <Output className={moduleStyles.output} width={outputWidth} />
      </div>
    </div>
  );
};

export default VerticalLayout;
