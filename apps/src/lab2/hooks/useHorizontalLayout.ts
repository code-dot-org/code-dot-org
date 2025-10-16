import {throttle} from 'lodash';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {useResizable} from 'react-resizable-layout';

import {logOnResize} from '@cdo/apps/lab2/utils/resizeUtils';
import {RESIZE_BAR_SIZE_PX} from '@cdo/apps/lab2/views/components/layout/ResizeBar';
import {
  ColumnPanelConfig,
  RowPanelConfig,
} from '@cdo/apps/lab2/views/components/layout/types';

import moduleStyles from '@cdo/apps/lab2/views/components/layout/layout.module.scss';

// The top Y coordinate of the panel. This is the height of the main page header.
const PANEL_TOP_COORDINATE = 50;

interface UseHorizontalLayoutProps {
  leftPanel: ColumnPanelConfig;
  rightTopPanel: RowPanelConfig;
  rightBottomPanel: RowPanelConfig;
  minRightPanelWidth: number;
  appName: string;
  heightOffset?: number;
  showingRightmostPanel?: boolean;
}
/**
 * Hook that manages the layout of a lab with 3 resizable panels.
 * The page is split into two columns, with the left column containing the left panel.
 * The right column contains 2 panels, the right top panel and the right bottom panel.
 * The resize bars adjust the width of the left panel and the height of the right bottom panel,
 * and the right top panel and right column take up the remaining space (but will not go below their minimum sizes).
 * To be used in conjunction with the ResizeBar component.
 * See pythonlab/layout/HorizontalLayout for a usage example.
 */
export const useHorizontalLayout = ({
  leftPanel,
  rightTopPanel,
  rightBottomPanel,
  minRightPanelWidth,
  showingRightmostPanel,
  appName,
  heightOffset = 0,
}: UseHorizontalLayoutProps) => {
  const [rightPanelWidth, setRightPanelWidth] = useState<number | undefined>(
    undefined
  );
  const [rightTopPanelHeight, setRightTopPanelHeight] = useState<
    number | undefined
  >(undefined);
  const [leftPanelWidth, setLeftPanelWidth] = useState<number | undefined>(
    leftPanel.initialWidth
  );
  const [rightBottomPanelHeight, setrightBottomPanelHeight] = useState<
    number | undefined
  >(rightBottomPanel.initialHeight);
  const rightmostPanelWidth = 300;

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
        layout: 'horizontal',
        resizeBar: leftPanel.name,
      }),
  });
  const {
    position: rawRightBottomPanelHeight,
    separatorProps: rightBottomPanelSeparatorProps,
    isDragging: rightBottomPanelDragging,
    setPosition: setRightBottomPanelSize,
  } = useResizable({
    axis: 'y',
    initial: rightBottomPanel.initialHeight,
    min: rightBottomPanel.minHeight,
    reverse: true,
    onResizeStart: () =>
      logOnResize(appName, {
        layout: 'horizontal',
        resizeBar: rightBottomPanel.name,
      }),
  });

  const adjustRightPanelWidth = useCallback(() => {
    const newRightPanelWidth = Math.max(
      window.innerWidth -
        rawLeftPanelWidth -
        RESIZE_BAR_SIZE_PX -
        (showingRightmostPanel ? rightmostPanelWidth : 0),
      minRightPanelWidth
    );
    setRightPanelWidth(newRightPanelWidth);
    const newLeftPanelWidth = Math.max(
      Math.min(
        rawLeftPanelWidth,
        window.innerWidth - newRightPanelWidth - RESIZE_BAR_SIZE_PX
      ),
      leftPanel.minWidth
    );
    setLeftPanelWidth(newLeftPanelWidth);
  }, [
    leftPanel.minWidth,
    minRightPanelWidth,
    rawLeftPanelWidth,
    showingRightmostPanel,
  ]);

  const throttledAdjustRightPanelWidth = useMemo(
    () => throttle(adjustRightPanelWidth, 30),
    [adjustRightPanelWidth]
  );

  const adjustRightTopPanelHeight = useCallback(() => {
    const newRightTopPanelHeight = Math.max(
      window.innerHeight -
        rawRightBottomPanelHeight -
        RESIZE_BAR_SIZE_PX -
        heightOffset -
        PANEL_TOP_COORDINATE,
      rightTopPanel.minHeight
    );
    setRightTopPanelHeight(newRightTopPanelHeight);
    const newRightBottomPanelHeight = Math.max(
      Math.min(
        rawRightBottomPanelHeight,
        window.innerHeight -
          newRightTopPanelHeight -
          RESIZE_BAR_SIZE_PX -
          heightOffset -
          PANEL_TOP_COORDINATE
      ),
      rightBottomPanel.minHeight
    );
    setrightBottomPanelHeight(newRightBottomPanelHeight);
  }, [
    heightOffset,
    rawRightBottomPanelHeight,
    rightBottomPanel.minHeight,
    rightTopPanel.minHeight,
  ]);

  const throttledAdjustWorkspaceHeight = useMemo(
    () => throttle(adjustRightTopPanelHeight, 30),
    [adjustRightTopPanelHeight]
  );

  const throttledResize = useMemo(
    () =>
      throttle(() => {
        adjustRightPanelWidth();
        adjustRightTopPanelHeight();
      }, 30),
    [adjustRightPanelWidth, adjustRightTopPanelHeight]
  );

  useEffect(() => {
    throttledAdjustRightPanelWidth();
  }, [throttledAdjustRightPanelWidth]);

  useEffect(() => {
    throttledAdjustWorkspaceHeight();
  }, [throttledAdjustWorkspaceHeight]);

  const panelClassName = useMemo(() => {
    if (leftPanelDragging || rightBottomPanelDragging) {
      return moduleStyles.resizingPanel;
    } else {
      return undefined;
    }
  }, [leftPanelDragging, rightBottomPanelDragging]);

  useEffect(() => {
    // Flexbox can handle adjusting the widths of the panel to fit the screen, but some
    // panels needs an accurate width in order to resize appropriately (for example, output panels
    // in pythonlab resize the visualization).
    window.addEventListener('resize', throttledResize);
    return () => window.removeEventListener('resize', throttledResize);
  }, [throttledResize]);

  return {
    leftPanelWidth,
    rightPanelWidth,
    rightTopPanelHeight,
    rightBottomPanelHeight,
    leftPanelSeparatorProps,
    leftPanelDragging,
    rightBottomPanelSeparatorProps,
    rightBottomPanelDragging,
    setLeftPanelSize,
    setRightBottomPanelSize,
    rightmostPanelWidth,
    panelClassName,
  };
};
