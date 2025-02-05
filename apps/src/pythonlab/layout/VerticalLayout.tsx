import ResizeBar, {RESIZE_BAR_SIZE_PX} from '@codebridge/components/ResizeBar';
import {InfoPanel} from '@codebridge/InfoPanel';
import Workspace from '@codebridge/Workspace';
import Output from '@codebridge/Workspace/Output';
import React, {useEffect} from 'react';
import {useResizable} from 'react-resizable-layout';

import moduleStyles from './layout.module.scss';

const MIN_INFO_PANEL_WIDTH = 200;
const MIN_OUTPUT_WIDTH = 200;
const MIN_EDITOR_WIDTH = 400;
const TWO_RESIZE_BARS = RESIZE_BAR_SIZE_PX * 2;
const INITIAL_INFO_PANEL_WIDTH = 300;
const INITIAL_OUTPUT_WIDTH = 400;

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
    initial: INITIAL_INFO_PANEL_WIDTH,
    min: MIN_INFO_PANEL_WIDTH,
    containerRef: layoutContainerRef,
  });

  const {
    position: rawOutputWidth,
    separatorProps: outputSeparatorProps,
    isDragging: outputDragging,
  } = useResizable({
    axis: 'x',
    initial: INITIAL_OUTPUT_WIDTH,
    min: MIN_OUTPUT_WIDTH,
    reverse: true,
    containerRef: outputContainerRef,
  });

  useEffect(() => {
    // Editor takes priority in terms of available space.
    const adjustedEditorWidth = Math.max(
      window.innerWidth - rawInfoPanelWidth - rawOutputWidth - TWO_RESIZE_BARS,
      MIN_EDITOR_WIDTH
    );
    setEditorWidth(adjustedEditorWidth);

    const spaceForOutput = Math.max(
      window.innerWidth -
        MIN_INFO_PANEL_WIDTH -
        TWO_RESIZE_BARS -
        adjustedEditorWidth,
      MIN_OUTPUT_WIDTH
    );
    const adjustedOutputWidth = Math.min(rawOutputWidth, spaceForOutput);
    setOutputWidth(adjustedOutputWidth);

    const spaceForInfoPanel = Math.max(
      window.innerWidth -
        MIN_OUTPUT_WIDTH -
        TWO_RESIZE_BARS -
        adjustedEditorWidth,
      MIN_INFO_PANEL_WIDTH
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
        <Workspace />
      </div>
      <ResizeBar
        isVertical={true}
        {...outputSeparatorProps}
        isDragging={outputDragging}
      />
      <div ref={outputContainerRef}>
        <Output width={outputWidth} />
      </div>
    </div>
  );
};

export default VerticalLayout;
