import React, { PropTypes } from 'react';
import ToggleGroup from '@cdo/apps/templates/ToggleGroup';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import color from '../../../color';
import commonMsg from '@cdo/locale';

const styles = {
  buttonText: {
    marginLeft: 5
  }
};

export default function HiddenStageToggle({hidden, onChange}) {
  return (
    <span>
      <ToggleGroup
        selected={hidden ? "hidden" : "visible"}
        activeColor={color.cyan}
        onChange={onChange}
      >
        <button value="visible" title={commonMsg.visible()}>
          <FontAwesome icon="eye"/>
          <span style={styles.buttonText}>{commonMsg.visible()}</span>
        </button>
        <button value="hidden" title={commonMsg.hidden()}>
          <FontAwesome icon="eye-slash"/>
          <span style={styles.buttonText}>{commonMsg.hidden()}</span>
        </button>
      </ToggleGroup>
    </span>
  );
}

HiddenStageToggle.propTypes = {
  hidden: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired
};
