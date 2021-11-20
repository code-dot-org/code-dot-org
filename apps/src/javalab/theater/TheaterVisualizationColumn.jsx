import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import PreviewPaneHeader from '../PreviewPaneHeader';
import ProtectedVisualizationDiv from '@cdo/apps/templates/ProtectedVisualizationDiv';
import {toggleVisualizationCollapsed} from '../javalabRedux';

class TheaterVisualizationColumn extends React.Component {
  static propTypes = {
    // populated by redux
    isReadOnlyWorkspace: PropTypes.bool,
    isCollapsed: PropTypes.bool,
    toggleVisualizationCollapsed: PropTypes.func
  };

  state = {
    isFullscreen: false
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
        <div style={{...styles.theaterPreviewBackground, opacity}}>
          <ProtectedVisualizationDiv>
            <div id="theater-container" style={styles.theater}>
              <img id="theater" style={styles.theaterImage} />
              <audio id="theater-audio" preload="auto" />
            </div>
          </ProtectedVisualizationDiv>
        </div>
      </div>
    );
  }
}

const styles = {
  theater: {
    width: 800,
    height: 800
  },
  theaterImage: {
    // Start hidden so we can start the audio and gif at the same time.
    visibility: 'hidden',
    width: 800,
    height: 800
  },
  theaterPreviewBackground: {
    backgroundImage: 'url("/blockly/media/javalab/Theater.png")',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundPosition: 'top'
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
)(TheaterVisualizationColumn);
