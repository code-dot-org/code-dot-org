import {useCallback, useEffect, useMemo, useState} from 'react';
import {useResizable} from 'react-resizable-layout';

import {logOnResize} from '@cdo/apps/lab2/utils/resizeUtils';
import {RESIZE_BAR_SIZE_PX} from '@cdo/apps/lab2/views/components/layout/ResizeBar';
import {ColumnPanelConfig} from '@cdo/apps/lab2/views/components/layout/types';

import moduleStyles from '@cdo/apps/lab2/views/components/layout/layout.module.scss';

const TWO_RESIZE_BARS = RESIZE_BAR_SIZE_PX * 2;

interface UseVerticalLayoutProps {
  leftPanel: ColumnPanelConfig;
  middlePanel: ColumnPanelConfig;
  rightPanel: ColumnPanelConfig;
  appName: string;
}

/**
 * Hook that manages the layout of a lab with 3 vertical, resizable panels.
 * The resize bars are used to adjust the width of the left and right panels,
 * and the middle panel takes up the remaining space, but won't go below its minimum width.
 * To be used in conjunction with the ResizeBar component.
 * See pythonlab/layout/VerticalLayout for a usage example.
 */
export const useVerticalLayout = ({
  leftPanel,
  middlePanel,
  rightPanel,
  appName,
}: UseVerticalLayoutProps) => {
  const [leftPanelWidth, setLeftPanelWidth] = useState<number | undefined>(
    leftPanel.initialWidth
  );
  const [middlePanelWidth, setMiddlePanelWidth] = useState<number | undefined>(
    middlePanel.initialWidth
  );
  const [rightPanelWidth, setRightPanelWidth] = useState<number | undefined>(
    rightPanel.initialWidth
  );

  const {
    position: rawLeftPanelWidth,
    separatorProps: leftPanelSeparatorProps,
    isDragging: leftPanelDragging,
    setPosition: setLeftPanelSize,
  } = useResizable({
    axis: 'x',
    initial: leftPanel.initialWidth,
    min: leftPanel.minWidth,
    onResizeStart: () =>
      logOnResize(appName, {
        layout: 'vertical',
        resizeBar: leftPanel.name,
      }),
  });
  const {
    position: rawRightPanelWidth,
    separatorProps: rightPanelSeparatorProps,
    isDragging: rightPanelDragging,
    setPosition: setRightPanelSize,
  } = useResizable({
    axis: 'x',
    initial: rightPanel.initialWidth,
    min: rightPanel.minWidth,
    reverse: true,
    onResizeStart: () =>
      logOnResize(appName, {
        layout: 'vertical',
        resizeBar: rightPanel.name,
      }),
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
    // Flexbox can handle adjusting the widths of the panel to fit the screen, but some
    // panels needs an accurate width in order to resize appropriately (for example, output panels
    // in pythonlab resize the visualization).
    window.addEventListener('resize', adjustWidths);
    return () => window.removeEventListener('resize', adjustWidths);
  }, [adjustWidths]);

  const panelClassName = useMemo(() => {
    if (leftPanelDragging || rightPanelDragging) {
      return moduleStyles.resizingPanel;
    } else {
      return undefined;
    }
  }, [leftPanelDragging, rightPanelDragging]);

  return {
    leftPanelWidth,
    middlePanelWidth,
    rightPanelWidth,
    leftPanelSeparatorProps,
    leftPanelDragging,
    rightPanelSeparatorProps,
    rightPanelDragging,
    setLeftPanelSize,
    setRightPanelSize,
    panelClassName,
  };
};
