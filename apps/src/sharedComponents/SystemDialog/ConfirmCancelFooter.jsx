import {Button as MuiButton} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

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
    confirmText: PropTypes.string,
    cancelText: PropTypes.string,
    confirmColor: PropTypes.oneOf([
      'inherit',
      'primary',
      'secondary',
      'success',
      'error',
      'info',
      'warning',
    ]),
    cancelColor: PropTypes.oneOf([
      'inherit',
      'primary',
      'secondary',
      'success',
      'error',
      'info',
      'warning',
    ]),
    disableConfirm: PropTypes.bool,
    disableCancel: PropTypes.bool,
    children: PropTypes.any,
  };

  static defaultProps = {
    confirmText: i18n.dialogOK(),
    cancelText: i18n.cancel(),
    confirmColor: 'primary',
    cancelColor: 'secondary',
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
      children,
    } = this.props;
    return (
      <div style={style}>
        <MuiButton
          variant="contained"
          color={confirmColor}
          size="small"
          disabled={disableConfirm}
          onClick={onConfirm}
          style={buttonStyle}
          type="button"
        >
          {confirmText}
        </MuiButton>
        <span style={messageStyle}>{children}</span>
        <MuiButton
          variant="outlined"
          color={cancelColor}
          size="small"
          disabled={disableCancel}
          onClick={onCancel}
          style={buttonStyle}
          type="button"
        >
          {cancelText}
        </MuiButton>
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
  marginTop: 10,
};

const messageStyle = {
  display: 'inline-block',
  lineHeight: '34px',
  textAlign: 'right',
  verticalAlign: 'top',
  marginLeft: '1em',
  marginRight: '1em',
  flexGrow: 1,
};

const buttonStyle = {
  flexShrink: 0,
};
