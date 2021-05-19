import PropTypes from 'prop-types';
import React from 'react';
import Button from '../Button';
import i18n from '@cdo/locale';
import {connect} from 'react-redux';

/**
 * A component that provides a toggle that goes between visible and hidden that
 * can be used be teachers to hide/show scripts or lesson on a per section basis.
 */
class HiddenForSectionToggle extends React.Component {
  static propTypes = {
    hidden: PropTypes.bool.isRequired,
    disabled: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    // Redux
    isRtl: PropTypes.bool
  };

  render() {
    const {hidden, disabled, onChange, isRtl} = this.props;

    // Reverse button order if locale is RTL
    const mainStyle = {
      ...styles.main,
      ...(disabled && styles.disabled),
      ...(isRtl ? styles.reverseButtons : null)
    };

    return (
      <div style={mainStyle} className="uitest-togglehidden">
        <Button
          __useDeprecatedTag
          onClick={() => !disabled && onChange('visible')}
          text={i18n.visible()}
          color={Button.ButtonColor.gray}
          disabled={!hidden}
          icon="eye"
          style={{...styles.button, ...styles.leftButton}}
        />
        <Button
          __useDeprecatedTag
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

const styles = {
  main: {
    wrap: 'nowrap',
    marginTop: 5,
    marginLeft: 15,
    marginRight: 15
  },
  disabled: {
    opacity: 0.5
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
    borderBottomRightRadius: 0
  },
  rightButton: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0
  },
  reverseButtons: {
    display: 'flex',
    flexDirection: 'row-reverse'
  }
};

export const UnconnectedHiddenForSectionToggle = HiddenForSectionToggle;

export default connect(state => ({
  isRtl: state.isRtl
}))(HiddenForSectionToggle);
