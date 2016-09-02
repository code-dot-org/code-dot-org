import React, { PropTypes } from 'react';
import ToggleGroup from '@cdo/apps/templates/ToggleGroup';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import color from '../../../color';

const HiddenStageToggle = React.createClass({
  propTypes: {
    hidden: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired
  },
  render() {
    return (
      <span>
        <ToggleGroup
          selected={this.props.hidden ? "hidden" : "visible"}
          activeColor={color.cyan}
          onChange={this.props.onChange}
        >
          <button value="visible" title="Visible">
            <FontAwesome icon="eye"/>
          </button>
          <button value="hidden" title="Hidden">
            <FontAwesome icon="eye-slash"/>
          </button>
        </ToggleGroup>
      </span>
    );
  }
});

export default HiddenStageToggle;
