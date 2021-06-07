import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import PreviewPaneHeader from './PreviewPaneHeader';
import MazeVisualization from '@cdo/apps/maze/Visualization';

class NeighborhoodVisualizationColumn extends React.Component {
  static propTypes = {
    showSpeedSlider: PropTypes.bool.isRequired,
    iconPath: PropTypes.string.isRequired,
    // populated by redux
    isDarkMode: PropTypes.bool
  };

  state = {
    isCollapsed: false,
    isFullscreen: false
  };

  render() {
    const {showSpeedSlider, iconPath, isDarkMode} = this.props;
    const {isCollapsed, isFullscreen} = this.state;

    const fullIconPath = isDarkMode
      ? iconPath + 'icons_white.png'
      : iconPath + 'icons.png';

    return (
      <div>
        <PreviewPaneHeader
          isCollapsed={isCollapsed}
          isFullscreen={isFullscreen}
        />
        <MazeVisualization />
        {showSpeedSlider && (
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
        )}
      </div>
    );
  }
}

export default connect(state => ({
  isDarkMode: state.javalab.isDarkMode
}))(NeighborhoodVisualizationColumn);
