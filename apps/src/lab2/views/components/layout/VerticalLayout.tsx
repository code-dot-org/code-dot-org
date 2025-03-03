import React, {useCallback, useEffect} from 'react';
import {useResizable} from 'react-resizable-layout';

import {logOnResize} from '@cdo/apps/lab2/utils/logOnResize';
import ResizeBar, {
  RESIZE_BAR_SIZE_PX,
} from '@cdo/apps/lab2/views/components/ResizeBar';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import moduleStyles from './layout.module.scss';

// const MIN_INFO_PANEL_WIDTH = 150;
// const MIN_OUTPUT_WIDTH = 200;
// const MIN_EDITOR_WIDTH = 300;
const TWO_RESIZE_BARS = RESIZE_BAR_SIZE_PX * 2;
// const INITIAL_INFO_PANEL_WIDTH = 300;
// const INITIAL_OUTPUT_WIDTH = 400;

interface PanelConfig {
  minWidth: number;
  initialWidth?: number;
  component: React.ReactNode;
  name: string;
}

interface VerticalLayoutProps {
  leftPanel: PanelConfig;
  middlePanel: PanelConfig;
  rightPanel: PanelConfig;
}

const VerticalLayout: React.FunctionComponent<VerticalLayoutProps> = ({
  leftPanel,
  middlePanel,
  rightPanel,
}) => {
  const [leftPanelWidth, setLeftPanelWidth] = React.useState<
    number | undefined
  >(leftPanel.initialWidth);
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

    // Info panel takes up remaining space, but won't go below the minimum width.
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

  return (
    <div className={moduleStyles.layoutContainer}>
      <div style={{width: leftPanelWidth}} className={moduleStyles.flexShrink0}>
        {leftPanel.component}
      </div>
      <ResizeBar
        isVertical={true}
        separatorProps={leftPanelSeparatorProps}
        isDragging={leftPanelDragging}
      />
      <div
        style={{width: middlePanelWidth}}
        className={moduleStyles.shrinkAndGrow}
      >
        {middlePanel.component}
      </div>
      <ResizeBar
        isVertical={true}
        separatorProps={rightPanelSeparatorProps}
        isDragging={rightPanelDragging}
      />
      <div
        style={{width: rightPanelWidth}}
        className={moduleStyles.shrinkAndGrow}
      >
        {/* TODO: right panel in codebridge is output, which needs width...maybe we cannot generalize this :( */}
        {rightPanel.component}
      </div>
    </div>
  );
};

export default VerticalLayout;
