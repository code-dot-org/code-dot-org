import {useCallback, useEffect, useMemo, useState} from 'react';
import {useResizable} from 'react-resizable-layout';

import {logOnResize} from '@cdo/apps/lab2/utils/resizeUtils';
import {RESIZE_BAR_SIZE_PX} from '@cdo/apps/lab2/views/components/layout/ResizeBar';
import {ColumnPanelConfig} from '@cdo/apps/lab2/views/components/layout/types';

import moduleStyles from '@cdo/apps/lab2/views/components/layout/layout.module.scss';

interface UseVerticalLayoutProps {
  leftPanel: ColumnPanelConfig;
  rightPanel: ColumnPanelConfig;
  appName: string;
}

/**
 * Hook that manages the layout of a lab with 2 vertical, resizable panels.
 * The resize bar is used to adjust the width of the left panel,
 * and the right panel takes up the remaining space, but won't go below its minimum width.
 * To be used in conjunction with the ResizeBar component.
 * See SketchlabView for a usage example.
 */
export const useTwoColumnLayout = ({
  leftPanel,
  rightPanel,
  appName,
}: UseVerticalLayoutProps) => {
  const [leftPanelWidth, setLeftPanelWidth] = useState<number | undefined>(
    leftPanel.initialWidth
  );
  const [rightPanelWidth, setRightPanelWidth] = useState<number | undefined>(
    rightPanel.initialWidth
  );

  const {
    position: rawLeftPanelWidth,
    separatorProps: leftPanelSeparatorProps,
    isDragging,
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

  const adjustWidths = useCallback(() => {
    // Right panel takes priority in terms of available space.
    const adjustedRightWidth = Math.max(
      window.innerWidth - rawLeftPanelWidth - RESIZE_BAR_SIZE_PX,
      rightPanel.minWidth
    );
    setRightPanelWidth(adjustedRightWidth);

    // Left panel takes up remaining space, but won't go below the minimum width.
    const spaceForLeftPanel = Math.max(
      window.innerWidth - adjustedRightWidth - RESIZE_BAR_SIZE_PX,
      leftPanel.minWidth
    );
    const adjustedLeftPanelWidth = Math.min(
      rawLeftPanelWidth,
      spaceForLeftPanel
    );
    setLeftPanelWidth(adjustedLeftPanelWidth);
  }, [leftPanel.minWidth, rawLeftPanelWidth, rightPanel.minWidth]);

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
    if (isDragging) {
      return moduleStyles.resizingPanel;
    } else {
      return undefined;
    }
  }, [isDragging]);

  return {
    leftPanelWidth,
    rightPanelWidth,
    leftPanelSeparatorProps,
    isDragging,
    setLeftPanelSize,
    panelClassName,
  };
};
