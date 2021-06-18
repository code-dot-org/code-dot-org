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
          showAssetManagerButton
          showPreviewTitle={false}
        />
        <ProtectedVisualizationDiv>
          <div style={styles.theater}>
            <img id="theater" style={styles.theaterImage} />
          </div>
        </ProtectedVisualizationDiv>
      </div>
    );
  }
}

const styles = {
  theater: {
    backgroundColor: 'white',
    width: 400,
    height: 400
  },
  theaterImage: {
    width: 400,
    height: 400
  }
};
