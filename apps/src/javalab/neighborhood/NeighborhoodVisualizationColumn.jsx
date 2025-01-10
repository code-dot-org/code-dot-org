import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {toggleVisualizationCollapsed} from '@cdo/apps/javalab/redux/viewRedux';
import NeighborhoodVisualization from '@cdo/apps/miniApps/neighborhood/NeighborhoodVisualization';

import {DisplayTheme} from '../DisplayTheme';
import PreviewPaneHeader from '../PreviewPaneHeader';

import moduleStyles from './neighborhood-visualization-column.module.scss';

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

    const visualizationClassName = isCollapsed
      ? moduleStyles.collapsed
      : moduleStyles.expanded;

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
        <NeighborhoodVisualization
          isDarkMode={displayTheme === DisplayTheme.DARK}
          className={visualizationClassName}
        />
      </div>
    );
  }
}

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
