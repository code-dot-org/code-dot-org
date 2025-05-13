import {InfoPanel} from '@codebridge/InfoPanel/InfoPanel';
import {LayoutProps} from '@codebridge/types';
import React from 'react';

import HorizontalOutput from '@cdo/apps/codebridge/Workspace/HorizontalOutput';
import {useHorizontalLayout} from '@cdo/apps/lab2/hooks/useHorizontalLayout';
import ResizeBar from '@cdo/apps/lab2/views/components/layout/ResizeBar';

import moduleStyles from '@cdo/apps/lab2/views/components/layout/layout.module.scss';

const MIN_RIGHT_PANEL_WIDTH = 300;
const MIN_LEFT_PANEL_WIDTH = 150;
const MIN_OUTPUT_HEIGHT = 120;
const MIN_EDITOR_HEIGHT = 200;
const INITIAL_INFO_PANEL_WIDTH = 300;
const INITIAL_OUTPUT_HEIGHT = 300;

const WidgetView: React.FunctionComponent<LayoutProps> = () => {
  const {
    leftPanelWidth,
    rightPanelWidth,
    rightBottomPanelHeight,
    leftPanelSeparatorProps,
    leftPanelDragging,
    setRightBottomPanelSize,
  } = useHorizontalLayout({
    leftPanel: {
      initialWidth: INITIAL_INFO_PANEL_WIDTH,
      minWidth: MIN_LEFT_PANEL_WIDTH,
      name: 'instructions',
    },
    rightTopPanel: {
      minHeight: MIN_EDITOR_HEIGHT,
      name: 'editor',
    },
    rightBottomPanel: {
      initialHeight: INITIAL_OUTPUT_HEIGHT,
      minHeight: MIN_OUTPUT_HEIGHT,
      name: 'output',
    },
    minRightPanelWidth: MIN_RIGHT_PANEL_WIDTH,
    appName: 'pythonlab',
    heightOffset: 0,
  });

  return (
    <div className={moduleStyles.defaultContainer}>
      <div className={moduleStyles.layoutContainer}>
        <InfoPanel
          style={{width: leftPanelWidth}}
          className={moduleStyles.flexShrink0}
        />
        <ResizeBar
          isVertical={true}
          separatorProps={leftPanelSeparatorProps}
          isDragging={leftPanelDragging}
        />

        <div
          className={moduleStyles.flexColumn}
          style={{width: rightPanelWidth}}
        >
          <HorizontalOutput
            height={rightBottomPanelHeight || INITIAL_OUTPUT_HEIGHT}
            width={rightPanelWidth}
            setOutputHeight={setRightBottomPanelSize}
          />
        </div>
      </div>
    </div>
  );
};

export default WidgetView;
