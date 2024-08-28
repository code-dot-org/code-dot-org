import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {toggleVisualizationCollapsed} from '@cdo/apps/javalab/redux/viewRedux';
import {
  VISUALIZATION_DIV_ID,
  isResponsiveFromState,
} from '@cdo/apps/templates/ProtectedVisualizationDiv';

import JavalabCrosshairOverlay, {
  showOverlayFromState,
} from '../JavalabCrosshairOverlay';
import PreviewPaneHeader from '../PreviewPaneHeader';

import style from './theater-visualization-column.module.scss';

class TheaterVisualizationColumn extends React.Component {
  static propTypes = {
    // populated by redux
    isReadOnlyWorkspace: PropTypes.bool,
    isCollapsed: PropTypes.bool,
    responsive: PropTypes.bool,
    showOverlay: PropTypes.bool,
    toggleVisualizationCollapsed: PropTypes.func,
  };

  state = {
    isFullscreen: false,
  };

  render() {
    const {
      isReadOnlyWorkspace,
      isCollapsed,
      responsive,
      showOverlay,
      toggleVisualizationCollapsed,
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
          style={styles.theaterPreviewBackground}
        >
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
              {
                // TODO: A11y279 (https://codedotorg.atlassian.net/browse/A11Y-279)
                // Verify or update this alt-text as necessary
              }
              <img id="theater" className={style.image} alt="" />
              {/* The audio here is generated dynamically from a student's code,
                  and we don't have text that would appropriately represent the audio being generated. */}
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <audio id="theater-audio" preload="auto" />
            </div>
            <JavalabCrosshairOverlay visible={showOverlay} />
          </div>
        </div>
      </div>
    );
  }
}

// Note (madelynkasula 09/28/2022): Do not add to this styles object. Use theater-visualization-column.module.scss instead.
// SCSS modules currently aren't able to load static assets (i.e., Theater.png below), so these styles will be removed
// when that is fixed.
const styles = {
  theaterPreviewBackground: {
    backgroundImage: 'url("/blockly/media/javalab/Theater.png")',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundPosition: 'top',
  },
};

export default connect(
  state => ({
    isReadOnlyWorkspace: state.pageConstants.isReadOnlyWorkspace,
    isCollapsed: state.javalabView.isVisualizationCollapsed,
    responsive: isResponsiveFromState(state),
    showOverlay: showOverlayFromState(state),
  }),
  dispatch => ({
    toggleVisualizationCollapsed() {
      dispatch(toggleVisualizationCollapsed());
    },
  })
)(TheaterVisualizationColumn);
