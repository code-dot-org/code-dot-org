import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {toggleVisualizationCollapsed} from '@cdo/apps/javalab/redux/viewRedux';
import MazeVisualization from '@cdo/apps/maze/Visualization';

import {DisplayTheme} from '../DisplayTheme';
import PreviewPaneHeader from '../PreviewPaneHeader';

const ICON_PATH = '/blockly/media/turtle/';

class NeighborhoodVisualizationColumn extends React.Component {
  static propTypes = {
    // populated by redux
    displayTheme: PropTypes.oneOf(Object.values(DisplayTheme)),
    isCollapsed: PropTypes.bool,
    toggleVisualizationCollapsed: PropTypes.func,
  };

  state = {
    isFullscreen: false,
  };

  render() {
    const {displayTheme, isCollapsed, toggleVisualizationCollapsed} =
      this.props;
    const {isFullscreen} = this.state;

    const fullIconPath =
      displayTheme === DisplayTheme.DARK
        ? ICON_PATH + 'icons_white.png'
        : ICON_PATH + 'icons.png';

    const opacity = isCollapsed ? 0 : 1;

    return (
      <div
        id="neighbourhood-visualization-column"
        style={{textAlign: 'center'}}
      >
        <PreviewPaneHeader
          isFullscreen={isFullscreen}
          isCollapsed={isCollapsed}
          toggleVisualizationCollapsed={toggleVisualizationCollapsed}
        />
        <div style={{opacity}}>
          <div style={styles.neighborhoodPreviewBackground}>
            <MazeVisualization />
          </div>
          <svg id="slider" version="1.1" width="150" height="50">
            {/* Slow icon. */}
            <clipPath id="slowClipPath">
              <rect width="26" height="12" x="5" y="14" />
            </clipPath>
            <image
              xlinkHref={fullIconPath}
              height="42"
              width="84"
              x="-21"
              y="-10"
              clipPath="url(#slowClipPath)"
            />
            {/* Fast icon. */}
            <clipPath id="fastClipPath">
              <rect width="26" height="16" x="120" y="10" />
            </clipPath>
            <image
              xlinkHref={fullIconPath}
              height="42"
              width="84"
              x="120"
              y="-11"
              clipPath="url(#fastClipPath)"
            />
          </svg>
        </div>
      </div>
    );
  }
}

const styles = {
  neighborhoodPreviewBackground: {
    backgroundImage: 'url("/blockly/media/javalab/Neighborhood.png")',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundPosition: 'top',
  },
};

export default connect(
  state => ({
    displayTheme: state.javalabView.displayTheme,
    isCollapsed: state.javalabView.isVisualizationCollapsed,
  }),
  dispatch => ({
    toggleVisualizationCollapsed() {
      dispatch(toggleVisualizationCollapsed());
    },
  })
)(NeighborhoodVisualizationColumn);
