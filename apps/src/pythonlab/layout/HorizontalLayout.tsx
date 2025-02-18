import {InfoPanel} from '@codebridge/InfoPanel';
import Workspace from '@codebridge/Workspace';
import Output from '@codebridge/Workspace/Output';
import {throttle} from 'lodash';
import React, {useCallback, useEffect, useMemo} from 'react';
import {useResizable} from 'react-resizable-layout';

import {logOnResize} from '@cdo/apps/lab2/utils/logOnResize';
import ResizeBar, {
  RESIZE_BAR_SIZE_PX,
} from '@cdo/apps/lab2/views/components/ResizeBar';

import moduleStyles from './layout.module.scss';

const MIN_RIGHT_PANEL_WIDTH = 300;
const MIN_LEFT_PANEL_WIDTH = 150;
const MIN_OUTPUT_HEIGHT = 120;
const MIN_EDITOR_HEIGHT = 200;
const INITIAL_INFO_PANEL_WIDTH = 300;
const INITIAL_OUTPUT_HEIGHT = 300;
// The top Y coordinate of the panel. This is the height of the main page header.
const PANEL_TOP_COORDINATE = 50;

const HorizontalLayout: React.FunctionComponent = () => {
  const [rightPanelWidth, setRightPanelWidth] = React.useState<
    number | undefined
  >(undefined);
  const [workspaceHeight, setWorkspaceHeight] = React.useState<
    number | undefined
  >(undefined);
  const [infoPanelWidth, setInfoPanelWidth] = React.useState<number>(
    INITIAL_INFO_PANEL_WIDTH
  );
  const [outputHeight, setOutputHeight] = React.useState<number>(
    INITIAL_OUTPUT_HEIGHT
  );
  const {
    position: rawInfoPanelWidth,
    separatorProps: infoPanelSeparatorProps,
    isDragging: infoPanelDragging,
  } = useResizable({
    axis: 'x',
    initial: INITIAL_INFO_PANEL_WIDTH,
    min: MIN_LEFT_PANEL_WIDTH,
    onResizeStart: () =>
      logOnResize('pythonlab', {
        layout: 'horizontal',
        resizeBar: 'instructions',
      }),
  });
  const {
    position: rawOutputHeight,
    separatorProps: outputSeparatorProps,
    isDragging: outputDragging,
  } = useResizable({
    axis: 'y',
    initial: INITIAL_OUTPUT_HEIGHT,
    min: MIN_OUTPUT_HEIGHT,
    reverse: true,
    onResizeStart: () =>
      logOnResize('pythonlab', {layout: 'horizontal', resizeBar: 'console'}),
  });

  const adjustRightPanelWidth = useCallback(() => {
    const newRightPanelWidth = Math.max(
      window.innerWidth - rawInfoPanelWidth - RESIZE_BAR_SIZE_PX,
      MIN_RIGHT_PANEL_WIDTH
    );
    setRightPanelWidth(newRightPanelWidth);
    const newInfoPanelWidth = Math.max(
      Math.min(
        rawInfoPanelWidth,
        window.innerWidth - newRightPanelWidth - RESIZE_BAR_SIZE_PX
      ),
      MIN_LEFT_PANEL_WIDTH
    );
    setInfoPanelWidth(newInfoPanelWidth);
  }, [rawInfoPanelWidth]);

  const throttledAdjustRightPanelWidth = useMemo(
    () => throttle(adjustRightPanelWidth, 30),
    [adjustRightPanelWidth]
  );

  const adjustWorkspaceHeight = useCallback(() => {
    const newWorkspaceHeight = Math.max(
      window.innerHeight -
        rawOutputHeight -
        RESIZE_BAR_SIZE_PX -
        PANEL_TOP_COORDINATE,
      MIN_EDITOR_HEIGHT
    );
    setWorkspaceHeight(newWorkspaceHeight);
    const newOutputHeight = Math.max(
      Math.min(
        rawOutputHeight,
        window.innerHeight -
          newWorkspaceHeight -
          RESIZE_BAR_SIZE_PX -
          PANEL_TOP_COORDINATE
      ),
      MIN_OUTPUT_HEIGHT
    );
    setOutputHeight(newOutputHeight);
  }, [rawOutputHeight]);

  const throttledAdjustWorkspaceHeight = useMemo(
    () => throttle(adjustWorkspaceHeight, 30),
    [adjustWorkspaceHeight]
  );

  const throttledResize = useMemo(
    () =>
      throttle(() => {
        adjustRightPanelWidth();
        adjustWorkspaceHeight();
      }, 30),
    [adjustRightPanelWidth, adjustWorkspaceHeight]
  );

  useEffect(() => {
    throttledAdjustRightPanelWidth();
  }, [throttledAdjustRightPanelWidth]);

  useEffect(() => {
    throttledAdjustWorkspaceHeight();
  }, [throttledAdjustWorkspaceHeight]);

  useEffect(() => {
    // Flexbox can handle adjusting the widths of the panel to fit the screen, but the
    // output panel needs an accurate width in order to resize the visualization appropriately.
    window.addEventListener('resize', throttledResize);
    return () => window.removeEventListener('resize', throttledResize);
  }, [throttledResize]);

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
      <div className={moduleStyles.flexColumn} style={{width: rightPanelWidth}}>
        <Workspace style={{height: workspaceHeight}} />
        <ResizeBar
          isVertical={false}
          separatorProps={outputSeparatorProps}
          isDragging={outputDragging}
        />
        <Output height={outputHeight} width={rightPanelWidth} />
      </div>
    </div>
  );
};

export default HorizontalLayout;
