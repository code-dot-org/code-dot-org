import {throttle} from 'lodash';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {useResizable} from 'react-resizable-layout';

import {logOnResize} from '@cdo/apps/lab2/utils/logOnResize';
import {RESIZE_BAR_SIZE_PX} from '@cdo/apps/lab2/views/components/layout/ResizeBar';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {
  ColumnPanelConfig,
  RowPanelConfig,
} from '../views/components/layout/types';

// The top Y coordinate of the panel. This is the height of the main page header.
const PANEL_TOP_COORDINATE = 50;

interface UseHorizontalLayoutProps {
  leftPanel: ColumnPanelConfig;
  rightTopPanel: RowPanelConfig;
  rightBottomPanel: RowPanelConfig;
  minRightPanelWidth: number;
}

export const useHorizontalLayout = ({
  leftPanel,
  rightTopPanel,
  rightBottomPanel,
  minRightPanelWidth,
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
  const appName = useAppSelector(state => state.lab.levelProperties?.appName);

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
      window.innerWidth - rawLeftPanelWidth - RESIZE_BAR_SIZE_PX,
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
  }, [leftPanel.minWidth, minRightPanelWidth, rawLeftPanelWidth]);

  const throttledAdjustRightPanelWidth = useMemo(
    () => throttle(adjustRightPanelWidth, 30),
    [adjustRightPanelWidth]
  );

  const adjustRightTopPanelHeight = useCallback(() => {
    const newRightTopPanelHeight = Math.max(
      window.innerHeight -
        rawRightBottomPanelHeight -
        RESIZE_BAR_SIZE_PX -
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
          PANEL_TOP_COORDINATE
      ),
      rightBottomPanel.minHeight
    );
    setrightBottomPanelHeight(newRightBottomPanelHeight);
  }, [
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

  useEffect(() => {
    // Flexbox can handle adjusting the widths of the panel to fit the screen, but the
    // output panel needs an accurate width in order to resize the visualization appropriately.
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
  };
};
