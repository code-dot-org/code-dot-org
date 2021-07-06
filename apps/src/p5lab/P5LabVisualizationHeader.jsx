/** @file Row of controls above the visualization. */
import PropTypes from 'prop-types';
import React from 'react';
import {changeInterfaceMode} from './actions';
import {connect} from 'react-redux';
import {P5LabInterfaceMode} from './constants';
import msg from '@cdo/locale';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import ToggleGroup from '@cdo/apps/templates/ToggleGroup';
import styleConstants from '@cdo/apps/styleConstants';
import {allowAnimationMode} from './stateQueries';
import * as utils from '../utils';

/**
 * Controls above the visualization header, including the code/animation toggle.
 */
class P5LabVisualizationHeader extends React.Component {
  static propTypes = {
    interfaceMode: PropTypes.oneOf([
      P5LabInterfaceMode.CODE,
      P5LabInterfaceMode.ANIMATION
    ]).isRequired,
    allowAnimationMode: PropTypes.bool.isRequired,
    onInterfaceModeChange: PropTypes.func.isRequired,
    spriteLab: PropTypes.bool.isRequired
  };

  changeInterfaceMode = mode => {
    // Make sure code workspace is rendered properly after switching from the Animation Tab.
    if (mode === P5LabInterfaceMode.CODE) {
      if (this.props.spriteLab) {
        // Sprite Lab (Blockly) doesn't need a window resize event, but it does need to rerender.
        setTimeout(() => Blockly.mainBlockSpace.render(), 0);
      } else {
        // Fire a window resize event to tell Game Lab (Droplet) to rerender.
        setTimeout(() => utils.fireResizeEvent(), 0);
      }
    } else if (mode === P5LabInterfaceMode.ANIMATION) {
      firehoseClient.putRecord({
        study: 'animation-library',
        study_group: 'control-2020',
        event: 'tab-click',
        data_string: this.props.spriteLab ? 'spritelab' : 'gamelab'
      });
    }

    this.props.onInterfaceModeChange(mode);
  };

  render() {
    const {interfaceMode, allowAnimationMode} = this.props;
    return (
      <div style={styles.main} id="playSpaceHeader">
        <ToggleGroup
          selected={interfaceMode}
          onChange={this.changeInterfaceMode}
        >
          <button type="button" value={P5LabInterfaceMode.CODE} id="codeMode">
            {msg.codeMode()}
          </button>
          {allowAnimationMode && (
            <button
              type="button"
              value={P5LabInterfaceMode.ANIMATION}
              id="animationMode"
            >
              {this.props.spriteLab ? msg.costumeMode() : msg.animationMode()}
            </button>
          )}
        </ToggleGroup>
      </div>
    );
  }
}

const styles = {
  main: {
    height: styleConstants['workspace-headers-height']
  }
};
export default connect(
  state => ({
    interfaceMode: state.interfaceMode,
    allowAnimationMode: allowAnimationMode(state),
    spriteLab: state.pageConstants.isBlockly
  }),
  dispatch => ({
    onInterfaceModeChange: mode => dispatch(changeInterfaceMode(mode))
  })
)(P5LabVisualizationHeader);
