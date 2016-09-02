import React from 'react';
import ToggleGroup from '@cdo/apps/templates/ToggleGroup';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import color from '../../../color';

const styles = {
  main: {
    // float: 'right'
    // marginTop: 10
  }
};

const HiddenStageToggle = React.createClass({
  render() {
    return (
      <span style={styles.main}>
        <ToggleGroup
          selected="visible"
          activeColor={color.cyan}
          onChange={() => console.log('todo')}
        >
          <button value="visible">
            <FontAwesome icon="eye"/>
          </button>
          <button value="hidden">
            <FontAwesome icon="eye-slash"/>
          </button>
        </ToggleGroup>
      </span>
    );
  }
});

export default HiddenStageToggle;
