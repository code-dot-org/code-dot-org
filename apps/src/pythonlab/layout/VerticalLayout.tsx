import {InfoPanel} from '@codebridge/InfoPanel/InfoPanel';
import Workspace from '@codebridge/Workspace/Workspace';
import React from 'react';

import VerticalOutput from '@cdo/apps/codebridge/Workspace/VerticalOutput';
import {useVerticalLayout} from '@cdo/apps/lab2/hooks/useVerticalLayout';
import ResizeBar from '@cdo/apps/lab2/views/components/layout/ResizeBar';

import moduleStyles from '@cdo/apps/lab2/views/components/layout/layout.module.scss';

const MIN_INFO_PANEL_WIDTH = 150;
const MIN_OUTPUT_WIDTH = 200;
const MIN_EDITOR_WIDTH = 300;
const INITIAL_INFO_PANEL_WIDTH = 300;
const INITIAL_OUTPUT_WIDTH = 400;

const VerticalLayout: React.FunctionComponent = () => {
  const {
    leftPanelWidth,
    middlePanelWidth,
    rightPanelWidth,
    leftPanelSeparatorProps,
    leftPanelDragging,
    rightPanelSeparatorProps,
    rightPanelDragging,
    setRightPanelSize,
  } = useVerticalLayout({
    leftPanel: {
      initialWidth: INITIAL_INFO_PANEL_WIDTH,
      minWidth: MIN_INFO_PANEL_WIDTH,
      name: 'instructions',
    },
    middlePanel: {
      minWidth: MIN_EDITOR_WIDTH,
      name: 'editor',
    },
    rightPanel: {
      initialWidth: INITIAL_OUTPUT_WIDTH,
      minWidth: MIN_OUTPUT_WIDTH,
      name: 'output',
    },
    appName: 'pythonlab',
  });

  return (
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
      <Workspace
        style={{width: middlePanelWidth}}
        className={moduleStyles.shrinkAndGrow}
      />
      <ResizeBar
        isVertical={true}
        separatorProps={rightPanelSeparatorProps}
        isDragging={rightPanelDragging}
      />
      <VerticalOutput
        width={rightPanelWidth || INITIAL_OUTPUT_WIDTH}
        className={moduleStyles.shrinkAndGrow}
        setOutputWidth={setRightPanelSize}
      />
    </div>
  );
};

export default VerticalLayout;
