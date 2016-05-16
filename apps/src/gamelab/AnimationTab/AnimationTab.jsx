/** @file Root of the animation editor interface mode for GameLab */
'use strict';

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
  framesColumn: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 150,
    maxWidth: 300,
    borderTop: 'solid thin ' + color.light_purple,
    borderBottom: 'solid thin ' + color.light_purple,
    borderLeft: 'solid thin ' + color.light_purple,
    borderRight: 'none'
  },
  editorColumn: {
    display: 'flex',
    flexDirection: 'column',
    border: 'solid thin ' + color.light_purple
  },
  editorRegion: {
    flex: '1 0',
    backgroundColor: 'white',
    textAlign: 'center',
    paddingTop:'48%'
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
          <div style={styles.framesColumn}>
            <div className="purple-header workspace-header" style={commonStyles.purpleHeader}>
              <span>Frames</span>
            </div>
            <FrameList />
          </div>
          <div style={styles.editorColumn}>
            <div className="purple-header workspace-header" style={commonStyles.purpleHeader}>
              <span>Workspace</span>
            </div>
            <div style={styles.editorRegion}>
              TODO: Piskel editor goes here!
            </div>
          </div>
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
