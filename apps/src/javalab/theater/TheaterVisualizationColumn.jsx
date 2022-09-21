import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import classNames from 'classnames';
import PreviewPaneHeader from '../PreviewPaneHeader';
import {
  VISUALIZATION_DIV_ID,
  isResponsiveFromState
} from '@cdo/apps/templates/ProtectedVisualizationDiv';
import {toggleVisualizationCollapsed} from '../javalabRedux';
import style from './theater-visualization-column.module.scss';
import JavalabCrosshairOverlay, {
  showOverlayFromState
} from '../JavalabCrosshairOverlay';

class TheaterVisualizationColumn extends React.Component {
  static propTypes = {
    // populated by redux
    isReadOnlyWorkspace: PropTypes.bool,
    isCollapsed: PropTypes.bool,
    responsive: PropTypes.bool,
    showOverlay: PropTypes.bool,
    toggleVisualizationCollapsed: PropTypes.func
  };

  state = {
    isFullscreen: false
  };

  render() {
    const {
      isReadOnlyWorkspace,
      isCollapsed,
      responsive,
      showOverlay,
      toggleVisualizationCollapsed
    } = this.props;
    const {isFullscreen} = this.state;

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
        <div
          className={classNames(
            style.previewBackground,
            isCollapsed && style.collapsed
          )}
        >
          {/* create ResponsiveVisualization */}
          <div
            id={VISUALIZATION_DIV_ID}
            className={classNames(responsive && 'responsive')}
          >
            <div
              id="theater-container"
              className={classNames(
                style.container,
                showOverlay && style.overlay
              )}
            >
              <img id="theater" className={style.image} />
              <audio id="theater-audio" preload="auto" />
            </div>
            <JavalabCrosshairOverlay visible={showOverlay} />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({
    isReadOnlyWorkspace: state.pageConstants.isReadOnlyWorkspace,
    isCollapsed: state.javalab.isVisualizationCollapsed,
    responsive: isResponsiveFromState(state),
    showOverlay: showOverlayFromState(state)
  }),
  dispatch => ({
    toggleVisualizationCollapsed() {
      dispatch(toggleVisualizationCollapsed());
    }
  })
)(TheaterVisualizationColumn);
