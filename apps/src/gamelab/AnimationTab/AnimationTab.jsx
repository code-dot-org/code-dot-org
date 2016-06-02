/** @file Root of the animation editor interface mode for GameLab */
'use strict';

import React from 'react';
import Radium from 'radium';
import { connect } from 'react-redux';
import color from '../../color';
import commonStyles from '../../commonStyles';
import AnimationPicker from '../AnimationPicker/AnimationPicker';
import GameLabVisualizationHeader from '../GameLabVisualizationHeader';
import { setColumnSizes } from './animationTabModule';
import AnimationList from './AnimationList';
import FrameList from './FrameList';
import ResizablePanes from './ResizablePanes';

const styles = {
  root: {
    position: 'absolute',
    top: 0,
    bottom: 20,
    left: 0,
    right: 0
  },
  animationsColumn: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 150,
    maxWidth: 300
  },
  editorColumn: {
    display: 'flex',
    flexDirection: 'column',
    border: 'solid thin ' + color.light_purple
  }
};

/**
 * Root of the animation editor interface mode for GameLab
 */
const AnimationTab = React.createClass({
  propTypes: {
    channelId: React.PropTypes.string.isRequired,
    columnSizes: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
    onColumnWidthsChange: React.PropTypes.func.isRequired
  },

  render() {
    return (
      <div>
        <ResizablePanes
            style={styles.root}
            columnSizes={this.props.columnSizes}
            onChange={this.props.onColumnWidthsChange}
        >
          <div style={styles.animationsColumn}>
            <GameLabVisualizationHeader />
            <AnimationList />
          </div>
          <iframe id="piskel-frame" style={styles.editorColumn} src="/assets/js/piskel/index.html" />
        </ResizablePanes>
        <AnimationPicker channelId={this.props.channelId}/>
      </div>
    );
  }
});
export default connect(state => ({
  columnSizes: state.animationTab.columnSizes
}), dispatch => ({
  onColumnWidthsChange(widths) {
    dispatch(setColumnSizes(widths));
  }
}))(Radium(AnimationTab));
