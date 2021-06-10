import React from 'react';
import PreviewPaneHeader from './PreviewPaneHeader';
import ProtectedVisualizationDiv from '@cdo/apps/templates/ProtectedVisualizationDiv';

export default class TheaterVisualizationColumn extends React.Component {
  static propTypes = {};

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
          showAssetManagerButton={true}
          headerTitle={''}
        />
        <ProtectedVisualizationDiv>
          <canvas id="theater" width="400" height="400" />
        </ProtectedVisualizationDiv>
      </div>
    );
  }
}
