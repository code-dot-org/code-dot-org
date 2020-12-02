import PropTypes from 'prop-types';
import React from 'react';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';
import Button from '../../../templates/Button';

/**
 * Footer for a "System" dialog style used on account pages.
 * Always has an OK button and a Cancel button (OK text can be customized).
 * Buttons can be disabled.
 * Any children are rendered in a message area to the left of the OK button.
 */
export default class ConfirmCancelFooter extends React.Component {
  static propTypes = {
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    confirmText: Button.propTypes.text,
    cancelText: Button.propTypes.text,
    confirmColor: Button.propTypes.color.isRequired,
    cancelColor: Button.propTypes.color.isRequired,
    disableConfirm: PropTypes.bool,
    disableCancel: PropTypes.bool,
    tabIndex: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    children: PropTypes.any
  };

  static defaultProps = {
    confirmText: i18n.dialogOK(),
    cancelText: i18n.cancel(),
    confirmColor: Button.ButtonColor.orange,
    cancelColor: Button.ButtonColor.gray
  };

  render() {
    const {
      onConfirm,
      onCancel,
      confirmText,
      cancelText,
      confirmColor,
      cancelColor,
      disableConfirm,
      disableCancel,
      tabIndex,
      children
    } = this.props;
    return (
      <div style={style}>
        <Button
          __useDeprecatedTag
          onClick={onConfirm}
          text={confirmText}
          color={confirmColor}
          disabled={disableConfirm}
          tabIndex={tabIndex}
          style={buttonStyle}
        />
        <span style={messageStyle}>{children}</span>
        <Button
          __useDeprecatedTag
          onClick={onCancel}
          text={cancelText}
          color={cancelColor}
          disabled={disableCancel}
          tabIndex={tabIndex}
          style={buttonStyle}
        />
      </div>
    );
  }
}

const style = {
  display: 'flex',
  flexDirection: 'row-reverse',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  borderStyle: 'solid',
  borderColor: color.lighter_gray,
  borderTopWidth: 1,
  borderBottomWidth: 0,
  borderRightWidth: 0,
  borderLeftWidth: 0,
  paddingTop: 10,
  marginTop: 10
};

const messageStyle = {
  display: 'inline-block',
  lineHeight: '34px',
  textAlign: 'right',
  verticalAlign: 'top',
  marginLeft: '1em',
  marginRight: '1em',
  flexGrow: 1
};

const buttonStyle = {
  flexShrink: 0
};
