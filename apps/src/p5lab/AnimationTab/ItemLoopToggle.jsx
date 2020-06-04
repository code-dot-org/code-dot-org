/** @file controls below an animation looping toggle */
import React from 'react';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import PropTypes from 'prop-types';
import Radium from 'radium';

const styles = {
  loopToggleStyle: {
    cursor: 'pointer',
    float: 'left'
  }
};

/**
 * The toggle that controls whether the animation loops frames.
 */

class ItemLoopToggle extends React.Component {
  static defaultProps = {looping: true};

  static propTypes = {
    style: PropTypes.object,
    onToggleChange: PropTypes.func.isRequired,
    looping: PropTypes.bool.isRequired
  };

  toggleClicked = () => this.props.onToggleChange(!this.props.looping);

  render() {
    const iconImageName = this.props.looping
      ? 'looping-continuous'
      : 'looping-one-time';
    const toggleText = this.props.looping ? 'Loop forever' : 'Loop once';
    const iconImageSrc = `/blockly/media/gamelab/${iconImageName}.png`;
    const tooltip = <Tooltip id={0}>{toggleText}</Tooltip>;

    return (
      <OverlayTrigger overlay={tooltip} placement="bottom" delayShow={500}>
        <div
          style={[styles.loopToggleStyle, this.props.style]}
          onClick={this.toggleClicked}
        >
          <img src={iconImageSrc} style={styles.loopIconStyle} />
        </div>
      </OverlayTrigger>
    );
  }
}

export default Radium(ItemLoopToggle);
