import React from 'react';
import ProtectedVisualizationDiv from '@cdo/apps/templates/ProtectedVisualizationDiv';
import PreviewPaneHeader from './PreviewPaneHeader';

export default class DefaultVisualization extends React.Component {
  state = {
    isCollapsed: false,
    isFullscreen: false
  };

  render() {
    const {isCollapsed, isFullscreen} = this.state;

    return (
      <div>
        <PreviewPaneHeader
          isCollapsed={isCollapsed}
          isFullscreen={isFullscreen}
        />
        <ProtectedVisualizationDiv />
      </div>
    );
  }
}
