import {useCallback, useEffect, useMemo, useState} from 'react';
import {useResizable} from 'react-resizable-layout';

import {logOnResize} from '@cdo/apps/lab2/utils/resizeUtils';
import {RESIZE_BAR_SIZE_PX} from '@cdo/apps/lab2/views/components/layout/ResizeBar';
import {ColumnPanelConfig} from '@cdo/apps/lab2/views/components/layout/types';

import moduleStyles from '@cdo/apps/lab2/views/components/layout/layout.module.scss';

interface UseVerticalLayoutProps {
  leftPanel: ColumnPanelConfig;
  middlePanel?: ColumnPanelConfig;
  rightPanel: ColumnPanelConfig;
  appName: string;
}

/**
 * Hook that manages the layout of a lab with either 2 or 3 vertical, resizable panels.
 * If a middlePanel isn't provided, then this hook manages two panels.
 * The resize bars are used to adjust the width of the left and right panels,
 * and the middle panel takes up the remaining space, but won't go below its minimum width.
 * To be used in conjunction with the ResizeBar component.
 * See pythonlab/layout/VerticalLayout for a 3 panel usage example,
 * or SketchlabView for a 2 panel usage example.
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
    middlePanel?.initialWidth
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
    const RESIZE_BARS_WIDTH = RESIZE_BAR_SIZE_PX * (middlePanel ? 2 : 1);

    if (middlePanel) {
      // Middle panel takes priority in terms of available space in a 3 panel layout.
      const adjustedMiddleWidth = Math.max(
        window.innerWidth -
          rawLeftPanelWidth -
          rawRightPanelWidth -
          RESIZE_BARS_WIDTH,
        middlePanel.minWidth
      );
      setMiddlePanelWidth(adjustedMiddleWidth);

      // Second priority is right panel.
      const spaceForRightPanel = Math.max(
        window.innerWidth -
          leftPanel.minWidth -
          RESIZE_BARS_WIDTH -
          adjustedMiddleWidth,
        rightPanel.minWidth
      );
      const adjustedRightWidth = Math.min(
        rawRightPanelWidth,
        spaceForRightPanel
      );
      setRightPanelWidth(adjustedRightWidth);

      // Left panel takes up remaining space, but won't go below the minimum width.
      const spaceForLeftPanel = Math.max(
        window.innerWidth -
          adjustedRightWidth -
          RESIZE_BARS_WIDTH -
          adjustedMiddleWidth,
        leftPanel.minWidth
      );
      const adjustedLeftPanelWidth = Math.min(
        rawLeftPanelWidth,
        spaceForLeftPanel
      );
      setLeftPanelWidth(adjustedLeftPanelWidth);
    } else {
      setMiddlePanelWidth(0);

      // In 2-panel mode, only the left panel is resizable,
      // so we start by establishing the size of that panel.
      const spaceForLeftPanel = Math.max(
        window.innerWidth - rightPanel.minWidth - RESIZE_BARS_WIDTH,
        leftPanel.minWidth
      );
      const adjustedLeftWidth = Math.min(rawLeftPanelWidth, spaceForLeftPanel);
      setLeftPanelWidth(adjustedLeftWidth);

      // Then, we give the remaining space to the right panel, but it won't go below its minimum width.
      const adjustedRightWidth = Math.max(
        window.innerWidth - adjustedLeftWidth - RESIZE_BARS_WIDTH,
        rightPanel.minWidth
      );
      setRightPanelWidth(adjustedRightWidth);
    }
  }, [
    middlePanel,
    leftPanel.minWidth,
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
