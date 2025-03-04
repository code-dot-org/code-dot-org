import React, {useCallback, useEffect, useState} from 'react';
import {useResizable} from 'react-resizable-layout';

import {logOnResize} from '@cdo/apps/lab2/utils/logOnResize';
import {RESIZE_BAR_SIZE_PX} from '@cdo/apps/lab2/views/components/ResizeBar';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

interface PanelConfig {
  minWidth: number;
  initialWidth?: number;
  name: string;
}

const TWO_RESIZE_BARS = RESIZE_BAR_SIZE_PX * 2;

export const useVerticalLayout = (
  leftPanel: PanelConfig,
  middlePanel: PanelConfig,
  rightPanel: PanelConfig
) => {
  const [leftPanelWidth, setLeftPanelWidth] = useState<number | undefined>(
    leftPanel.initialWidth
  );
  const [middlePanelWidth, setMiddlePanelWidth] = React.useState<
    number | undefined
  >(middlePanel.initialWidth);
  const [rightPanelWidth, setRightPanelWidth] = React.useState<
    number | undefined
  >(rightPanel.initialWidth);
  const appName = useAppSelector(state => state.lab.levelProperties?.appName);

  const {
    position: rawLeftPanelWidth,
    separatorProps: leftPanelSeparatorProps,
    isDragging: leftPanelDragging,
  } = useResizable({
    axis: 'x',
    initial: leftPanel.initialWidth,
    min: leftPanel.minWidth,
    onResizeStart: () =>
      logOnResize(appName, {layout: 'vertical', resizeBar: leftPanel.name}),
  });
  const {
    position: rawRightPanelWidth,
    separatorProps: rightPanelSeparatorProps,
    isDragging: rightPanelDragging,
  } = useResizable({
    axis: 'x',
    initial: rightPanel.initialWidth,
    min: rightPanel.minWidth,
    reverse: true,
    onResizeStart: () =>
      logOnResize(appName, {layout: 'vertical', resizeBar: rightPanel.name}),
  });

  const adjustWidths = useCallback(() => {
    // Middle panel takes priority in terms of available space.
    const adjustedMiddleWidth = Math.max(
      window.innerWidth -
        rawLeftPanelWidth -
        rawRightPanelWidth -
        TWO_RESIZE_BARS,
      middlePanel.minWidth
    );
    setMiddlePanelWidth(adjustedMiddleWidth);

    // Second priority is right panel.
    const spaceForRightPanel = Math.max(
      window.innerWidth -
        leftPanel.minWidth -
        TWO_RESIZE_BARS -
        adjustedMiddleWidth,
      rightPanel.minWidth
    );
    const adjustedRightWidth = Math.min(rawRightPanelWidth, spaceForRightPanel);
    setRightPanelWidth(adjustedRightWidth);

    // Left panel takes up remaining space, but won't go below the minimum width.
    const spaceForLeftPanel = Math.max(
      window.innerWidth -
        adjustedRightWidth -
        TWO_RESIZE_BARS -
        adjustedMiddleWidth,
      leftPanel.minWidth
    );
    const adjustedLeftPanelWidth = Math.min(
      rawLeftPanelWidth,
      spaceForLeftPanel
    );
    setLeftPanelWidth(adjustedLeftPanelWidth);
  }, [
    leftPanel.minWidth,
    middlePanel.minWidth,
    rawLeftPanelWidth,
    rawRightPanelWidth,
    rightPanel.minWidth,
  ]);

  useEffect(() => {
    adjustWidths();
  }, [adjustWidths]);

  useEffect(() => {
    // Flexbox can handle adjusting the widths of the panel to fit the screen, but the
    // output panel needs an accurate width in order to resize the visualization appropriately.
    window.addEventListener('resize', adjustWidths);
    return () => window.removeEventListener('resize', adjustWidths);
  }, [adjustWidths]);

  return {
    leftPanelWidth,
    middlePanelWidth,
    rightPanelWidth,
    leftPanelSeparatorProps,
    leftPanelDragging,
    rightPanelSeparatorProps,
    rightPanelDragging,
  };
};
