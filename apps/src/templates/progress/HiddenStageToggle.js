import React, { PropTypes } from 'react';
import ProgressButton from './ProgressButton';
import i18n from '@cdo/locale';

const styles = {
  main: {
    wrap: 'nowrap',
    marginTop: 5,
    marginLeft: 15,
    marginRight: 15
  },
  button: {
    display: 'inline-block',
    paddingLeft: 0,
    paddingRight: 0,
    boxSizing: 'border-box',
    width: '50%'
  },
  leftButton: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  rightButton: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
};

const HiddenStageToggle = React.createClass({
  propTypes: {
    hidden: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired
  },
  render() {
    const { hidden, onChange } = this.props;
    return (
      <div style={styles.main}>
        <ProgressButton
          onClick={() => onChange('visible')}
          text={i18n.visible()}
          color={ProgressButton.ButtonColor.gray}
          disabled={!hidden}
          icon="eye"
          style={{...styles.button, ...styles.leftButton}}
        />
        <ProgressButton
          onClick={() => onChange('hidden')}
          text={i18n.hidden()}
          color={ProgressButton.ButtonColor.gray}
          disabled={hidden}
          icon="eye-slash"
          style={{...styles.button, ...styles.rightButton}}
        />
      </div>
    );
  }
});

export default HiddenStageToggle;
