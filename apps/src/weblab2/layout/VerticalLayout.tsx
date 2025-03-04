import React from 'react';

import {FilePreview} from '@cdo/apps/codebridge/FilePreview';
import {InfoPanel} from '@cdo/apps/codebridge/InfoPanel';
import Workspace from '@cdo/apps/codebridge/Workspace';
import {useVerticalLayout} from '@cdo/apps/lab2/views/components/layout/useVerticalLayout';
import ResizeBar from '@cdo/apps/lab2/views/components/ResizeBar';

import moduleStyles from './layout.module.scss';

const VerticalLayout: React.FunctionComponent = () => {
  const {
    leftPanelWidth,
    middlePanelWidth,
    rightPanelWidth,
    leftPanelSeparatorProps,
    leftPanelDragging,
  } = useVerticalLayout(
    {
      minWidth: 150,
      initialWidth: 300,
      name: 'instructions',
    },
    {
      minWidth: 300,
      name: 'editor',
    },
    {
      minWidth: 200,
      initialWidth: 600,
      name: 'preview',
    }
  );

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
         captured by the preview?) */}
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
