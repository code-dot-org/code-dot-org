/** @file Root of the animation editor interface mode for GameLab */
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import color from '@cdo/apps/util/color';
import AnimationPicker, {PICKER_TYPE} from '../AnimationPicker/AnimationPicker';
import P5LabVisualizationHeader from '../P5LabVisualizationHeader';
import {setColumnSizes} from '../redux/animationTab';
import AnimationList from './AnimationList';
import ResizablePanes from '@cdo/apps/templates/ResizablePanes';
import PiskelEditor from './PiskelEditor';
import * as shapes from '../shapes';
import i18n from '@cdo/locale';
import {P5LabInterfaceMode, P5LabType} from '../constants.js';

/**
 * Root of the animation editor interface mode for GameLab
 */
class AnimationTab extends React.Component {
  static propTypes = {
    channelId: PropTypes.string.isRequired,
    onColumnWidthsChange: PropTypes.func.isRequired,
    libraryManifest: PropTypes.object.isRequired,
    hideUploadOption: PropTypes.bool.isRequired,
    hideAnimationNames: PropTypes.bool.isRequired,
    hideBackgrounds: PropTypes.bool.isRequired,
    hideCostumes: PropTypes.bool.isRequired,
    labType: PropTypes.oneOf(Object.keys(P5LabType)).isRequired,
    pickerType: PropTypes.oneOf(Object.values(PICKER_TYPE)).isRequired,
    interfaceMode: PropTypes.oneOf([
      P5LabInterfaceMode.CODE,
      P5LabInterfaceMode.ANIMATION,
      P5LabInterfaceMode.BACKGROUND
    ]).isRequired,

    // Provided by Redux
    columnSizes: PropTypes.arrayOf(PropTypes.number).isRequired,
    selectedAnimation: shapes.AnimationKey,
    defaultQuery: PropTypes.object
  };

  render() {
    let hidePiskelStyle = {visibility: 'visible'};
    if (this.props.selectedAnimation) {
      hidePiskelStyle = {visibility: 'hidden'};
    }
    const hideCostumes =
      this.props.interfaceMode === P5LabInterfaceMode.BACKGROUND;
    const animationsColumnStyle =
      this.props.labType === 'SPRITELAB'
        ? styles.animationsColumnSpritelab
        : styles.animationsColumnGamelab;
    return (
      <div>
        <ResizablePanes
          style={styles.root}
          columnSizes={this.props.columnSizes}
          onChange={this.props.onColumnWidthsChange}
        >
          <div style={animationsColumnStyle}>
            <P5LabVisualizationHeader labType={this.props.labType} />
            <AnimationList
              hideBackgrounds={this.props.hideBackgrounds}
              hideCostumes={hideCostumes}
              labType={this.props.labType}
            />
          </div>
          <div style={styles.editorColumn}>
            <PiskelEditor style={styles.piskelEl} />
            <div style={{...hidePiskelStyle, ...styles.emptyPiskelEl}}>
              <div style={styles.helpText}> {i18n.addNewAnimation()} </div>
            </div>
          </div>
        </ResizablePanes>
        {this.props.channelId && (
          <AnimationPicker
            channelId={this.props.channelId}
            libraryManifest={this.props.libraryManifest}
            hideUploadOption={this.props.hideUploadOption}
            hideAnimationNames={this.props.hideAnimationNames}
            navigable={!this.props.hideCostumes}
            hideBackgrounds={this.props.hideBackgrounds}
            hideCostumes={hideCostumes}
            pickerType={this.props.pickerType}
            defaultQuery={this.props.defaultQuery}
          />
        )}
      </div>
    );
  }
}

const styles = {
  root: {
    position: 'absolute',
    top: 0,
    bottom: 20,
    left: 0,
    right: 0
  },
  animationsColumnGamelab: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 190,
    maxWidth: 300
  },
  animationsColumnSpritelab: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 240,
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
export default connect(
  state => ({
    columnSizes: state.animationTab.columnSizes,
    selectedAnimation: state.animationTab.selectedAnimation
  }),
  dispatch => ({
    onColumnWidthsChange(widths) {
      dispatch(setColumnSizes(widths));
    }
  })
)(AnimationTab);
