import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import PreviewPaneHeader from './PreviewPaneHeader';
import MazeVisualization from '@cdo/apps/maze/Visualization';
import {toggleVisualizationCollapsed} from './javalabRedux';

const ICON_PATH = '/blockly/media/turtle/';

class NeighborhoodVisualizationColumn extends React.Component {
  static propTypes = {
    // populated by redux
    isDarkMode: PropTypes.bool,
    isCollapsed: PropTypes.bool,
    toggleVisualizationCollapsed: PropTypes.func
  };

  state = {
    isFullscreen: false
  };

  render() {
    const {isDarkMode, isCollapsed, toggleVisualizationCollapsed} = this.props;
    const {isFullscreen} = this.state;

    const fullIconPath = isDarkMode
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
          <MazeVisualization />
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

export default connect(
  state => ({
    isDarkMode: state.javalab.isDarkMode,
    isCollapsed: state.javalab.isVisualizationCollapsed
  }),
  dispatch => ({
    toggleVisualizationCollapsed() {
      dispatch(toggleVisualizationCollapsed());
    }
  })
)(NeighborhoodVisualizationColumn);
