import {FilePreview} from '@codebridge/FilePreview/FilePreview';
import {InfoPanel} from '@codebridge/InfoPanel/InfoPanel';
import {LayoutProps} from '@codebridge/types';
import Workspace from '@codebridge/Workspace/Workspace';
import classNames from 'classnames';
import React, {useEffect} from 'react';

import {useVerticalLayout} from '@cdo/apps/lab2/hooks/useVerticalLayout';
import ResizeBar from '@cdo/apps/lab2/views/components/layout/ResizeBar';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import moduleStyles from '@cdo/apps/lab2/views/components/layout/layout.module.scss';

const MIN_INFO_PANEL_WIDTH = 150;
const INITIAL_INFO_PANEL_WIDTH = 300;
const INITIAL_INFO_PANEL_WIDTH_WIDGET = 500;
const MIN_EDITOR_WIDTH = 300;
const MIN_PREVIEW_WIDTH = 200;
const INITIAL_PREVIEW_WIDTH = 600;
const INITIAL_PREVIEW_WIDTH_WIDGET = 900;

const VerticalLayout: React.FunctionComponent<LayoutProps> = ({
  isProjectLevel,
  isWidgetView,
}) => {
  const widgetViewShowCode = useAppSelector(
    state => state.codebridgeWorkspace.widgetViewShowCode
  );
  const shouldHideEditor = isWidgetView && !widgetViewShowCode;
  const infoPanelInitialWidth = isProjectLevel
    ? 0
    : shouldHideEditor
    ? INITIAL_INFO_PANEL_WIDTH_WIDGET
    : INITIAL_INFO_PANEL_WIDTH;

  const editorMinWidth = shouldHideEditor ? 0 : MIN_EDITOR_WIDTH;
  const previewInitialWidth = shouldHideEditor
    ? INITIAL_PREVIEW_WIDTH_WIDGET
    : INITIAL_PREVIEW_WIDTH;

  const {
    leftPanelWidth,
    middlePanelWidth,
    rightPanelWidth,
    leftPanelSeparatorProps,
    leftPanelDragging,
    setRightPanelSize,
    setLeftPanelSize,
    rightPanelSeparatorProps,
    rightPanelDragging,
    panelClassName,
  } = useVerticalLayout({
    leftPanel: {
      minWidth: isProjectLevel ? 0 : MIN_INFO_PANEL_WIDTH,
      initialWidth: infoPanelInitialWidth,
      name: 'instructions',
    },
    middlePanel: {
      minWidth: editorMinWidth,
      name: 'editor',
    },
    rightPanel: {
      minWidth: MIN_PREVIEW_WIDTH,
      initialWidth: previewInitialWidth,
      name: 'preview',
    },
    appName: 'weblab2',
  });

  useEffect(() => {
    setRightPanelSize(
      shouldHideEditor ? INITIAL_PREVIEW_WIDTH_WIDGET : INITIAL_PREVIEW_WIDTH
    );
  }, [setRightPanelSize, shouldHideEditor]);

  useEffect(() => {
    if (!isProjectLevel) {
      setLeftPanelSize(
        shouldHideEditor
          ? INITIAL_INFO_PANEL_WIDTH_WIDGET
          : INITIAL_INFO_PANEL_WIDTH
      );
    } else {
      setLeftPanelSize(0);
    }
  }, [isProjectLevel, setLeftPanelSize, shouldHideEditor]);

  return (
    <div
      className={
        isProjectLevel
          ? moduleStyles.containerWithFooter
          : moduleStyles.defaultContainer
      }
    >
      <div className={moduleStyles.layoutContainer}>
        {!isProjectLevel && (
          <>
            <InfoPanel
              style={{width: leftPanelWidth}}
              className={classNames(moduleStyles.flexShrink0, panelClassName)}
            />
            <ResizeBar
              isVertical={true}
              separatorProps={leftPanelSeparatorProps}
              isDragging={leftPanelDragging}
            />
          </>
        )}
        {!shouldHideEditor && (
          <>
            <Workspace
              style={{width: middlePanelWidth}}
              className={classNames(moduleStyles.shrinkAndGrow, panelClassName)}
            />
            <ResizeBar
              isVertical={true}
              separatorProps={rightPanelSeparatorProps}
              isDragging={rightPanelDragging}
            />
          </>
        )}
        <div
          style={{width: rightPanelWidth}}
          className={classNames(moduleStyles.shrinkAndGrow, panelClassName)}
        >
          <FilePreview />
        </div>
      </div>
      {isProjectLevel && <div className={moduleStyles.footerArea} />}
    </div>
  );
};

export default VerticalLayout;
