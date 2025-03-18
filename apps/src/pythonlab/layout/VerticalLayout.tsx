import {InfoPanel} from '@codebridge/InfoPanel';
import Workspace from '@codebridge/Workspace';
import Output from '@codebridge/Workspace/Output';
import React, {useCallback, useEffect} from 'react';
import {useResizable} from 'react-resizable-layout';

import {logOnResize} from '@cdo/apps/lab2/utils/logOnResize';
import ResizeBar, {
  RESIZE_BAR_SIZE_PX,
} from '@cdo/apps/lab2/views/components/ResizeBar';

import moduleStyles from './layout.module.scss';

const MIN_INFO_PANEL_WIDTH = 150;
const MIN_OUTPUT_WIDTH = 200;
const MIN_EDITOR_WIDTH = 300;
const TWO_RESIZE_BARS = RESIZE_BAR_SIZE_PX * 2;
const INITIAL_INFO_PANEL_WIDTH = 300;
const INITIAL_OUTPUT_WIDTH = 400;

const VerticalLayout: React.FunctionComponent = () => {
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
    onResizeStart: () =>
      logOnResize('pythonlab', {layout: 'vertical', resizeBar: 'instructions'}),
  });
  const {
    position: rawOutputWidth,
    separatorProps: outputSeparatorProps,
    isDragging: outputDragging,
    setPosition: setOutputSize,
  } = useResizable({
    axis: 'x',
    initial: INITIAL_OUTPUT_WIDTH,
    min: MIN_OUTPUT_WIDTH,
    reverse: true,
    onResizeStart: () =>
      logOnResize('pythonlab', {layout: 'vertical', resizeBar: 'console'}),
  });

  const adjustWidths = useCallback(() => {
    // Editor takes priority in terms of available space.
    const adjustedEditorWidth = Math.max(
      window.innerWidth - rawInfoPanelWidth - rawOutputWidth - TWO_RESIZE_BARS,
      MIN_EDITOR_WIDTH
    );
    setEditorWidth(adjustedEditorWidth);

    // Second priority is output.
    const spaceForOutput = Math.max(
      window.innerWidth -
        MIN_INFO_PANEL_WIDTH -
        TWO_RESIZE_BARS -
        adjustedEditorWidth,
      MIN_OUTPUT_WIDTH
    );
    const adjustedOutputWidth = Math.min(rawOutputWidth, spaceForOutput);
    setOutputWidth(adjustedOutputWidth);

    // Info panel takes up remaining space, but won't go below the minimum width.
    const spaceForInfoPanel = Math.max(
      window.innerWidth -
        adjustedOutputWidth -
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

  useEffect(() => {
    adjustWidths();
  }, [adjustWidths]);

  useEffect(() => {
    // Flexbox can handle adjusting the widths of the panel to fit the screen, but the
    // output panel needs an accurate width in order to resize the visualization appropriately.
    window.addEventListener('resize', adjustWidths);
    return () => window.removeEventListener('resize', adjustWidths);
  }, [adjustWidths]);

  return (
    <div className={moduleStyles.layoutContainer}>
      <InfoPanel
        style={{width: infoPanelWidth}}
        className={moduleStyles.flexShrink0}
      />
      <ResizeBar
        isVertical={true}
        separatorProps={infoPanelSeparatorProps}
        isDragging={infoPanelDragging}
      />
      <Workspace
        style={{width: editorWidth}}
        className={moduleStyles.shrinkAndGrow}
      />
      <ResizeBar
        isVertical={true}
        separatorProps={outputSeparatorProps}
        isDragging={outputDragging}
      />
      <Output
        width={outputWidth}
        className={moduleStyles.shrinkAndGrow}
        setOutputSize={setOutputSize}
      />
    </div>
  );
};

export default VerticalLayout;
