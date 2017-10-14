/** @file Root of the animation editor interface mode for GameLab */
import React, {PropTypes} from 'react';
import Radium from 'radium';
import { connect } from 'react-redux';
import color from "../../util/color";
import AnimationPicker from '../AnimationPicker/AnimationPicker';
import GameLabVisualizationHeader from '../GameLabVisualizationHeader';
import { setColumnSizes } from './animationTabModule';
import AnimationList from './AnimationList';
import ResizablePanes from '@cdo/apps/templates/ResizablePanes';
import PiskelEditor from './PiskelEditor';
import * as shapes from '../shapes';

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
    minWidth: 190,
    maxWidth: 300
  },
  editorColumn: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  },
  piskelEl: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    border: 'solid thin ' + color.light_gray
  },
  emptyPiskelEl: {
    backgroundColor: color.light_gray,
    color: color.white,
    position: 'absolute',
    width: '100%',
    height: '100%',
    paddingRight: 1,
    paddingBottom: 1,
    textAlign: 'center',
    fontSize: 14
  },
  helpText: {
    position: 'relative',
    top: '50%',
    transform: 'translateY(-50%)'
  }
};

/**
 * Root of the animation editor interface mode for GameLab
 */
class AnimationTab extends React.Component {
  static propTypes = {
    channelId: PropTypes.string.isRequired,
    onColumnWidthsChange: PropTypes.func.isRequired,
    // Provided by Redux
    columnSizes: PropTypes.arrayOf(PropTypes.number).isRequired,
    selectedAnimation: shapes.AnimationKey
  };

  render() {
    let hidePiskelStyle = {visibility: 'visible'};
    if (this.props.selectedAnimation) {
      hidePiskelStyle = {visibility: 'hidden'};
    }
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
          <div style={styles.editorColumn}>
            <PiskelEditor style={styles.piskelEl}/>
            <div style={[hidePiskelStyle, styles.emptyPiskelEl]}>
              <div style={styles.helpText}>
                Add a new animation on the left to begin
              </div>
            </div>
          </div>
        </ResizablePanes>
        <AnimationPicker
          channelId={this.props.channelId}
          allowedExtensions=".png,.jpg,.jpeg"
        />
      </div>
    );
  }
}
export default connect(state => ({
  columnSizes: state.animationTab.columnSizes,
  selectedAnimation: state.animationTab.selectedAnimation
}), dispatch => ({
  onColumnWidthsChange(widths) {
    dispatch(setColumnSizes(widths));
  }
}))(Radium(AnimationTab));
