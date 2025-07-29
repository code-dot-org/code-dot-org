import {FilePreview} from '@codebridge/FilePreview/FilePreview';
import {InfoPanel} from '@codebridge/InfoPanel/InfoPanel';
import {LayoutProps} from '@codebridge/types';
import Workspace from '@codebridge/Workspace/Workspace';
import React from 'react';

import {useVerticalLayout} from '@cdo/apps/lab2/hooks/useVerticalLayout';
import ResizeBar from '@cdo/apps/lab2/views/components/layout/ResizeBar';

import moduleStyles from '@cdo/apps/lab2/views/components/layout/layout.module.scss';

const MIN_INFO_PANEL_WIDTH = 150;
const INITIAL_INFO_PANEL_WIDTH = 300;
const MIN_EDITOR_WIDTH = 300;
const MIN_PREVIEW_WIDTH = 200;
const INITIAL_PREVIEW_WIDTH = 600;

const VerticalLayout: React.FunctionComponent<LayoutProps> = ({
  isProjectLevel,
}) => {
  const {
    leftPanelWidth,
    middlePanelWidth,
    rightPanelWidth,
    leftPanelSeparatorProps,
    leftPanelDragging,
  } = useVerticalLayout({
    leftPanel: {
      minWidth: isProjectLevel ? 0 : MIN_INFO_PANEL_WIDTH,
      initialWidth: isProjectLevel ? 0 : INITIAL_INFO_PANEL_WIDTH,
      name: 'instructions',
    },
    middlePanel: {
      minWidth: MIN_EDITOR_WIDTH,
      name: 'editor',
    },
    rightPanel: {
      minWidth: MIN_PREVIEW_WIDTH,
      initialWidth: INITIAL_PREVIEW_WIDTH,
      name: 'preview',
    },
    appName: 'weblab2',
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
              className={moduleStyles.flexShrink0}
            />
            <ResizeBar
              isVertical={true}
              separatorProps={leftPanelSeparatorProps}
              isDragging={leftPanelDragging}
            />
          </>
        )}
        <Workspace
          style={{width: middlePanelWidth}}
          className={moduleStyles.shrinkAndGrow}
        />
        {/* TODO: Make right panel resizable. The iframe in FilePreview makes it so you
         can only drag left, not right (something about the mouse events getting 
         captured by the preview?) 
         Ticket: https://codedotorg.atlassian.net/browse/CT-1125 */}
        <div
          style={{width: rightPanelWidth}}
          className={moduleStyles.shrinkAndGrow}
        >
          <FilePreview />
        </div>
      </div>
      {isProjectLevel && <div className={moduleStyles.footerArea} />}
    </div>
  );
};

export default VerticalLayout;
