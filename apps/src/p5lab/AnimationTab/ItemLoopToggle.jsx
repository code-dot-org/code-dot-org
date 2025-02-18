/** @file controls below an animation looping toggle */
import PropTypes from 'prop-types';
import React from 'react';
import {OverlayTrigger, Tooltip} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports

import style from './item-loop-toggle.module.scss';

/**
 * The toggle that controls whether the animation loops frames.
 */

class ItemLoopToggle extends React.Component {
  static defaultProps = {looping: true};

  static propTypes = {
    style: PropTypes.object,
    onToggleChange: PropTypes.func.isRequired,
    looping: PropTypes.bool.isRequired,
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
          style={this.props.style}
          className={style.loopToggle}
          onClick={this.toggleClicked}
        >
          {
            // TODO: A11y279 (https://codedotorg.atlassian.net/browse/A11Y-279)
            // Verify or update this alt-text as necessary
          }
          <img src={iconImageSrc} alt="" />
        </div>
      </OverlayTrigger>
    );
  }
}

export default ItemLoopToggle;
