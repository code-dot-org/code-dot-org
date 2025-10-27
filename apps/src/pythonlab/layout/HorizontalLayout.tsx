import {InfoPanel} from '@codebridge/InfoPanel/InfoPanel';
import {LayoutProps} from '@codebridge/types';
import Workspace from '@codebridge/Workspace/Workspace';
import classNames from 'classnames';
import React, {useEffect} from 'react';

import HorizontalOutput from '@cdo/apps/codebridge/Workspace/HorizontalOutput';
import {useHorizontalLayout} from '@cdo/apps/lab2/hooks/useHorizontalLayout';
import ResizeBar from '@cdo/apps/lab2/views/components/layout/ResizeBar';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import moduleStyles from '@cdo/apps/lab2/views/components/layout/layout.module.scss';

const MIN_RIGHT_PANEL_WIDTH = 300;
const MIN_LEFT_PANEL_WIDTH = 150;
const MIN_LEFT_PANEL_WIDTH_COLLAPSED = 55;
const MIN_OUTPUT_HEIGHT = 120;
const MIN_EDITOR_HEIGHT = 200;
const INITIAL_INFO_PANEL_WIDTH = 330;
const INITIAL_INFO_PANEL_WIDTH_COLLAPSED = 55;
const INITIAL_OUTPUT_HEIGHT = 300;
const INITIAL_OUTPUT_HEIGHT_WIDGET = 800;

const HorizontalLayout: React.FunctionComponent<LayoutProps> = ({
  isWidgetView,
}) => {
  const widgetViewShowCode = useAppSelector(
    state => state.codebridgeWorkspace.widgetViewShowCode
  );

  const isStandaloneCollapsed = useAppSelector(
    state => state.lab2View.isStandaloneCollapsed
  );
  const infoPanelInitialWidth = isStandaloneCollapsed
    ? INITIAL_INFO_PANEL_WIDTH_COLLAPSED
    : INITIAL_INFO_PANEL_WIDTH;

  const infoPanelMinWidth = isStandaloneCollapsed
    ? MIN_LEFT_PANEL_WIDTH_COLLAPSED
    : MIN_LEFT_PANEL_WIDTH;

  const {
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
    panelClassName,
  } = useHorizontalLayout({
    leftPanel: {
      initialWidth: infoPanelInitialWidth,
      minWidth: infoPanelMinWidth,
      name: 'instructions',
    },
    rightTopPanel: {
      minHeight: isWidgetView && !widgetViewShowCode ? 0 : MIN_EDITOR_HEIGHT,
      name: 'editor',
    },
    rightBottomPanel: {
      initialHeight:
        isWidgetView && !widgetViewShowCode
          ? INITIAL_OUTPUT_HEIGHT_WIDGET
          : INITIAL_OUTPUT_HEIGHT,
      minHeight: MIN_OUTPUT_HEIGHT,
      name: 'output',
    },
    minRightPanelWidth: MIN_RIGHT_PANEL_WIDTH,
    appName: 'pythonlab',
    heightOffset: 0,
  });

  useEffect(() => {
    setLeftPanelSize(
      isStandaloneCollapsed
        ? INITIAL_INFO_PANEL_WIDTH_COLLAPSED
        : INITIAL_INFO_PANEL_WIDTH
    );
  }, [isStandaloneCollapsed, setLeftPanelSize]);

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

        <div
          className={moduleStyles.flexColumn}
          style={{width: rightPanelWidth}}
        >
          {(!isWidgetView || widgetViewShowCode) && (
            <>
              <Workspace
                style={{height: rightTopPanelHeight}}
                isWidgetView={isWidgetView}
                className={panelClassName}
              />
              <ResizeBar
                isVertical={false}
                separatorProps={rightBottomPanelSeparatorProps}
                isDragging={rightBottomPanelDragging}
              />
            </>
          )}
          <HorizontalOutput
            height={rightBottomPanelHeight || INITIAL_OUTPUT_HEIGHT}
            width={rightPanelWidth}
            setOutputHeight={setRightBottomPanelSize}
            className={panelClassName}
          />
        </div>
      </div>
    </div>
  );
};

export default HorizontalLayout;
