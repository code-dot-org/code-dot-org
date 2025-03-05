import React from 'react';

import {FilePreview} from '@cdo/apps/codebridge/FilePreview';
import {InfoPanel} from '@cdo/apps/codebridge/InfoPanel';
import Workspace from '@cdo/apps/codebridge/Workspace';
import {useHorizontalLayout} from '@cdo/apps/lab2/views/components/layout/useHorizontalLayout';
import ResizeBar from '@cdo/apps/lab2/views/components/ResizeBar';

import moduleStyles from './layout.module.scss';

const HorizontalLayout: React.FunctionComponent = () => {
  const {
    leftPanelWidth,
    rightPanelWidth,
    rightTopPanelHeight,
    rightBottomPanelHeight,
    leftPanelSeparatorProps,
    leftPanelDragging,
    rightBottomPanelSeparatorProps,
    rightBottomPanelDragging,
  } = useHorizontalLayout({
    leftPanel: {
      minWidth: 150,
      initialWidth: 300,
      name: 'instructions',
    },
    rightTopPanel: {
      minHeight: 300,
      name: 'editor',
    },
    rightBottomPanel: {
      minHeight: 200,
      initialHeight: 600,
      name: 'preview',
    },
    minRightPanelWidth: 300,
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
      <div className={moduleStyles.flexColumn} style={{width: rightPanelWidth}}>
        <Workspace style={{height: rightTopPanelHeight}} />
        <ResizeBar
          isVertical={false}
          separatorProps={rightBottomPanelSeparatorProps}
          isDragging={rightBottomPanelDragging}
        />
        <div style={{height: rightBottomPanelHeight}}>
          <FilePreview />
        </div>
      </div>
    </div>
  );
};

export default HorizontalLayout;
