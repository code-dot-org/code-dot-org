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

export default connect(state => ({
  isReadOnlyWorkspace: state.pageConstants.isReadOnlyWorkspace
}))(TheaterVisualizationColumn);
