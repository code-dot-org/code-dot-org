import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import PreviewPaneHeader from './PreviewPaneHeader';
import ProtectedVisualizationDiv from '@cdo/apps/templates/ProtectedVisualizationDiv';
import {toggleVisualizationCollapsed} from './javalabRedux';

class PlaygroundVisualizationColumn extends React.Component {
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
        <div style={{opacity}}>
          <ProtectedVisualizationDiv>
            <div id="playground-container" style={styles.playground}>
              <div id="playground" style={styles.playgroundDiv} />
              <audio id="playground-audio" autoPlay={true} />
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
  playgroundDiv: {
    width: 800,
    height: 800,
    overflow: 'hidden'
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
