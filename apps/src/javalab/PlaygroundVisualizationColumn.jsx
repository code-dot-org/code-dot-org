import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import PreviewPaneHeader from './PreviewPaneHeader';
import ProtectedVisualizationDiv from '@cdo/apps/templates/ProtectedVisualizationDiv';
import {toggleVisualizationCollapsed} from './javalabRedux';
import calculator from './PlaygroundLatencyCalculator';

const PLAYGROUND_CONTAINER_ID = 'playground-container';
const PLAYGROUND_SERVER_WIDTH = 400;
const PLAYGROUND_SERVER_HEIGHT = 400;

class PlaygroundVisualizationColumn extends React.Component {
  static propTypes = {
    onPlaygroundClicked: PropTypes.func,
    // populated by redux
    isReadOnlyWorkspace: PropTypes.bool,
    isCollapsed: PropTypes.bool,
    toggleVisualizationCollapsed: PropTypes.func
  };

  state = {
    isFullscreen: false
  };

  onMouseDown = event => {
    // Compute relative coordinates, normalized to server width and height
    const rect = document
      .getElementById(PLAYGROUND_CONTAINER_ID)
      .getBoundingClientRect();
    const normalizedX = Math.round(
      ((event.clientX - rect.x) / rect.width) * PLAYGROUND_SERVER_WIDTH
    );
    const normalizedY = Math.round(
      ((event.clientY - rect.y) / rect.height) * PLAYGROUND_SERVER_HEIGHT
    );
    console.log(`PLAYGROUND clicked (${normalizedX}, ${normalizedY})`);
    calculator.onClick();

    this.props.onPlaygroundClicked(normalizedX, normalizedY);
  };

  render() {
    const {
      isReadOnlyWorkspace,
      isCollapsed,
      toggleVisualizationCollapsed
    } = this.props;
    const {isFullscreen} = this.state;

    const opacity = isCollapsed ? 0 : 1;

    return (
      <div>
        <PreviewPaneHeader
          isCollapsed={isCollapsed}
          isFullscreen={isFullscreen}
          showAssetManagerButton
          disableAssetManagerButton={isReadOnlyWorkspace}
          showPreviewTitle={false}
          toggleVisualizationCollapsed={toggleVisualizationCollapsed}
        />
        <div style={{opacity}}>
          <ProtectedVisualizationDiv>
            <div
              id={PLAYGROUND_CONTAINER_ID}
              style={styles.playground}
              onMouseDown={this.onMouseDown}
            >
              <img id="playground" style={styles.playgroundImage} />
              <audio id="playground-audio" autoPlay="true" />
            </div>
          </ProtectedVisualizationDiv>
        </div>
      </div>
    );
  }
}

const styles = {
  playground: {
    backgroundColor: 'white',
    width: 800,
    height: 800
  },
  playgroundImage: {
    width: 800,
    height: 800
  }
};

export default connect(
  state => ({
    isReadOnlyWorkspace: state.pageConstants.isReadOnlyWorkspace,
    isCollapsed: state.javalab.isVisualizationCollapsed
  }),
  dispatch => ({
    toggleVisualizationCollapsed() {
      dispatch(toggleVisualizationCollapsed());
    }
  })
)(PlaygroundVisualizationColumn);
