import React from 'react';

import {FilePreview} from '@cdo/apps/codebridge/FilePreview';
import {InfoPanel} from '@cdo/apps/codebridge/InfoPanel';
import Workspace from '@cdo/apps/codebridge/Workspace';
import {useVerticalLayout} from '@cdo/apps/lab2/hooks/useVerticalLayout';
import ResizeBar from '@cdo/apps/lab2/views/components/layout/ResizeBar';

import moduleStyles from '@cdo/apps/lab2/views/components/layout/layout.module.scss';

const MIN_INFO_PANEL_WIDTH = 150;
const INITIAL_INFO_PANEL_WIDTH = 300;
const MIN_EDITOR_WIDTH = 300;
const MIN_PREVIEW_WIDTH = 200;
const INITIAL_PREVIEW_WIDTH = 600;

const VerticalLayout: React.FunctionComponent = () => {
  const {
    leftPanelWidth,
    middlePanelWidth,
    rightPanelWidth,
    leftPanelSeparatorProps,
    leftPanelDragging,
  } = useVerticalLayout({
    leftPanel: {
      minWidth: MIN_INFO_PANEL_WIDTH,
      initialWidth: INITIAL_INFO_PANEL_WIDTH,
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
  );
};

export default VerticalLayout;
