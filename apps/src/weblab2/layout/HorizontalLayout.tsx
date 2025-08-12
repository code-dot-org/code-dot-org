import {InfoPanel} from '@codebridge/InfoPanel/InfoPanel';
import {LayoutProps} from '@codebridge/types';
import Workspace from '@codebridge/Workspace/Workspace';
import classNames from 'classnames';
import React from 'react';

import {HTMLPreview} from '@cdo/apps/codebridge/FilePreview/HTMLPreview';
import {useHorizontalLayout} from '@cdo/apps/lab2/hooks/useHorizontalLayout';
import ResizeBar from '@cdo/apps/lab2/views/components/layout/ResizeBar';

import moduleStyles from '@cdo/apps/lab2/views/components/layout/layout.module.scss';

const MIN_INFO_PANEL_WIDTH = 150;
const INITIAL_INFO_PANEL_WIDTH = 300;
const MIN_EDITOR_HEIGHT = 200;
const MIN_PREVIEW_HEIGHT = 200;
const INITIAL_PREVIEW_HEIGHT = 400;
const MIN_RIGHT_PANEL_WIDTH = 300;
const PROJECT_FOOTER_HEIGHT = 56;

const HorizontalLayout: React.FunctionComponent<LayoutProps> = ({
  isProjectLevel,
}) => {
  const {
    leftPanelWidth,
    rightPanelWidth,
    rightTopPanelHeight,
    rightBottomPanelHeight,
    rightBottomPanelSeparatorProps,
    rightBottomPanelDragging,
    leftPanelSeparatorProps,
    leftPanelDragging,
    panelClassName,
  } = useHorizontalLayout({
    leftPanel: {
      minWidth: isProjectLevel ? 0 : MIN_INFO_PANEL_WIDTH,
      initialWidth: isProjectLevel ? 0 : INITIAL_INFO_PANEL_WIDTH,
      name: 'instructions',
    },
    rightTopPanel: {
      minHeight: MIN_EDITOR_HEIGHT,
      name: 'editor',
    },
    rightBottomPanel: {
      minHeight: MIN_PREVIEW_HEIGHT,
      initialHeight: INITIAL_PREVIEW_HEIGHT,
      name: 'preview',
    },
    minRightPanelWidth: MIN_RIGHT_PANEL_WIDTH,
    appName: 'weblab2',
    heightOffset: isProjectLevel ? PROJECT_FOOTER_HEIGHT : 0,
  });

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
        <div
          className={moduleStyles.flexColumn}
          style={{width: rightPanelWidth}}
        >
          <Workspace
            style={{height: rightTopPanelHeight}}
            className={panelClassName}
          />
          <ResizeBar
            isVertical={false}
            separatorProps={rightBottomPanelSeparatorProps}
            isDragging={rightBottomPanelDragging}
          />
          <div
            style={{height: rightBottomPanelHeight}}
            className={panelClassName}
          >
            <HTMLPreview />
          </div>
        </div>
      </div>
      {isProjectLevel && <div className={moduleStyles.footerArea} />}
    </div>
  );
};

export default HorizontalLayout;
