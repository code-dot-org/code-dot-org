import React, { PropTypes } from 'react';
import Button from '../Button';
import i18n from '@cdo/locale';

const styles = {
  main: {
    wrap: 'nowrap',
    marginTop: 5,
    marginLeft: 15,
    marginRight: 15
  },
  disabled: {
    opacity: 0.5,
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

/**
 * A component that provides a toggle that goes between visible and hidden that
 * can be used be teachers to hide/show scripts or stages on a per section basis.
 */
export default class HiddenForSectionToggle extends React.Component {
  static propTypes = {
    hidden: PropTypes.bool.isRequired,
    disabled: PropTypes.bool,
    onChange: PropTypes.func.isRequired
  };

  render() {
    const { hidden, disabled, onChange } = this.props;
    return (
      <div
        style={{
          ...styles.main,
          ...(disabled && styles.disabled),
        }}
        className="uitest-togglehidden"
      >
        <Button
          onClick={() => !disabled && onChange('visible')}
          text={i18n.visible()}
          color={Button.ButtonColor.gray}
          disabled={!hidden}
          icon="eye"
          style={{...styles.button, ...styles.leftButton}}
        />
        <Button
          onClick={() => !disabled && onChange('hidden')}
          text={i18n.hidden()}
          color={Button.ButtonColor.gray}
          disabled={hidden}
          icon="eye-slash"
          style={{...styles.button, ...styles.rightButton}}
        />
      </div>
    );
  }
}
