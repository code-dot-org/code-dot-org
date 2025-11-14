import {InfoPanel} from '@codebridge/InfoPanel/InfoPanel';
import {LayoutProps} from '@codebridge/types';
import Workspace from '@codebridge/Workspace/Workspace';
import classNames from 'classnames';
import React, {useEffect} from 'react';

import VerticalOutput from '@cdo/apps/codebridge/Workspace/VerticalOutput';
import {useVerticalLayout} from '@cdo/apps/lab2/hooks/useVerticalLayout';
import ResizeBar from '@cdo/apps/lab2/views/components/layout/ResizeBar';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import moduleStyles from '@cdo/apps/lab2/views/components/layout/layout.module.scss';

const MIN_INFO_PANEL_WIDTH = 150;
const MIN_OUTPUT_WIDTH = 200;
const MIN_EDITOR_WIDTH = 300;
const INITIAL_INFO_PANEL_WIDTH = 300;
const INITIAL_OUTPUT_WIDTH = 400;
const INITIAL_INFO_PANEL_WIDTH_COLLAPSED = 55;
const INITIAL_OUTPUT_WIDTH_COLLAPSED = 600;

const VerticalLayout: React.FunctionComponent<LayoutProps> = () => {
  const isStandaloneCollapsed = useAppSelector(
    state => state.lab2View.isStandaloneCollapsed
  );

  const infoPanelInitialWidth = isStandaloneCollapsed
    ? INITIAL_INFO_PANEL_WIDTH_COLLAPSED
    : INITIAL_INFO_PANEL_WIDTH;
  const outputPanelInitialWidth = isStandaloneCollapsed
    ? INITIAL_OUTPUT_WIDTH_COLLAPSED
    : INITIAL_OUTPUT_WIDTH;

  const {
    leftPanelWidth,
    middlePanelWidth,
    rightPanelWidth,
    leftPanelSeparatorProps,
    leftPanelDragging,
    rightPanelSeparatorProps,
    rightPanelDragging,
    setRightPanelSize,
    setLeftPanelSize,
    panelClassName,
  } = useVerticalLayout({
    leftPanel: {
      initialWidth: infoPanelInitialWidth,
      minWidth: MIN_INFO_PANEL_WIDTH,
      name: 'instructions',
    },
    middlePanel: {
      minWidth: MIN_EDITOR_WIDTH,
      name: 'editor',
    },
    rightPanel: {
      initialWidth: outputPanelInitialWidth,
      minWidth: MIN_OUTPUT_WIDTH,
      name: 'output',
    },
    appName: 'pythonlab',
  });

  useEffect(() => {
    setRightPanelSize(
      isStandaloneCollapsed
        ? INITIAL_OUTPUT_WIDTH_COLLAPSED
        : INITIAL_OUTPUT_WIDTH
    );
  }, [setRightPanelSize, isStandaloneCollapsed]);

  useEffect(() => {
    setLeftPanelSize(
      isStandaloneCollapsed
        ? INITIAL_INFO_PANEL_WIDTH_COLLAPSED
        : INITIAL_INFO_PANEL_WIDTH
    );
  }, [setLeftPanelSize, isStandaloneCollapsed]);

  return (
    <div className={moduleStyles.defaultContainer}>
      <div className={moduleStyles.layoutContainer}>
        <InfoPanel
          style={{width: leftPanelWidth}}
          className={classNames(moduleStyles.flexShrink0, panelClassName)}
        />
        <ResizeBar
          isVertical={true}
          separatorProps={leftPanelSeparatorProps}
          isDragging={leftPanelDragging}
        />

        <Workspace
          style={{width: middlePanelWidth}}
          className={classNames(moduleStyles.shrinkAndGrow, panelClassName)}
        />
        <ResizeBar
          isVertical={true}
          separatorProps={rightPanelSeparatorProps}
          isDragging={rightPanelDragging}
        />
        <VerticalOutput
          width={rightPanelWidth || INITIAL_OUTPUT_WIDTH}
          className={classNames(moduleStyles.shrinkAndGrow, panelClassName)}
          setOutputWidth={setRightPanelSize}
        />
      </div>
    </div>
  );
};

export default VerticalLayout;
