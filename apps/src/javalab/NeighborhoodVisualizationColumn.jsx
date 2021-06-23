import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import PreviewPaneHeader from './PreviewPaneHeader';
import MazeVisualization from '@cdo/apps/maze/Visualization';

const ICON_PATH = '/blockly/media/turtle/';

class NeighborhoodVisualizationColumn extends React.Component {
  static propTypes = {
    // populated by redux
    isDarkMode: PropTypes.bool
  };

  state = {
    isCollapsed: false,
    isFullscreen: false
  };

  render() {
    const {isDarkMode} = this.props;
    const {isCollapsed, isFullscreen} = this.state;

    const fullIconPath = isDarkMode
      ? ICON_PATH + 'icons_white.png'
      : ICON_PATH + 'icons.png';

    return (
      <div>
        <PreviewPaneHeader
          isCollapsed={isCollapsed}
          isFullscreen={isFullscreen}
        />
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
    );
  }
}

export default connect(state => ({
  isDarkMode: state.javalab.isDarkMode
}))(NeighborhoodVisualizationColumn);
