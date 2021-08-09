import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import PreviewPaneHeader from './PreviewPaneHeader';
import ProtectedVisualizationDiv from '@cdo/apps/templates/ProtectedVisualizationDiv';

class TheaterVisualizationColumn extends React.Component {
  static propTypes = {
    // populated by redux
    isReadOnlyWorkspace: PropTypes.bool
  };

  state = {
    isCollapsed: false,
    isFullscreen: false
  };

  render() {
    const {isReadOnlyWorkspace} = this.props;
    const {isCollapsed, isFullscreen} = this.state;

    return (
      <div>
        <PreviewPaneHeader
          isCollapsed={isCollapsed}
          isFullscreen={isFullscreen}
          showAssetManagerButton
          disableAssetManagerButton={isReadOnlyWorkspace}
          showPreviewTitle={false}
        />
        <ProtectedVisualizationDiv>
          <div id="theater-container" style={styles.theater}>
            <img id="theater" style={styles.theaterImage} />
            <audio id="theater-audio" autoPlay="true" />
          </div>
        </ProtectedVisualizationDiv>
      </div>
    );
  }
}

const styles = {
  theater: {
    backgroundColor: 'white',
    width: 800,
    height: 800
  },
  theaterImage: {
    width: 800,
    height: 800
  }
};

export default connect(state => ({
  isReadOnlyWorkspace: state.pageConstants.isReadOnlyWorkspace
}))(TheaterVisualizationColumn);
