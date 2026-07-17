import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import FormFieldWrapper from '@code-dot-org/component-library/formFieldWrapper';
import TextField from '@code-dot-org/component-library/textField';
import {Box, IconButton as MuiIconButton} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import * as utils from '../../utils';

import * as elementUtils from './elementUtils';
import * as rowStyle from './rowStyle';

const LockState = utils.makeEnum('LOCKED', 'UNLOCKED');

export default class PropertyRow extends React.Component {
  static propTypes = {
    desc: PropTypes.string.isRequired,
    initialValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    isNumber: PropTypes.bool,
    lockState: PropTypes.oneOf([
      LockState.LOCKED,
      LockState.UNLOCKED,
      undefined,
    ]),
    isMultiLine: PropTypes.bool,
    handleChange: PropTypes.func,
    handleLockChange: PropTypes.func,
    isIdRow: PropTypes.bool,
  };

  static LockState = LockState;

  state = {
    value: this.props.initialValue,
    isValidValue: true,
  };

  UNSAFE_componentWillReceiveProps(newProps) {
    this.setState({
      value: newProps.initialValue,
      isValidValue: true,
    });
  }

  isIdAvailable(value) {
    if (value === this.props.initialValue) {
      return true;
    }

    // Elements in divApplab must be allowed since divApplab may be stale
    // with respect to what's in design mode, and we will catch any collisions
    // with design mode elements by not setting allowDesignElements.
    const options = {
      allowCodeElements: true,
      allowDesignElements: false,
      allowDesignPrefix: false,
    };
    return elementUtils.isIdAvailable(value, options);
  }

  handleChangeInternal = event => {
    var isIdRow = this.props.isIdRow;
    var value = event.target.value;
    if (isIdRow) {
      value = value.replace(/\s+/g, '');
    }
    const isValidValue = !isIdRow || this.isIdAvailable(value);
    this.setValue(value, isValidValue);
  };

  /**
   * Updates this component's state, and calls the change handler
   * only if the new value is valid.
   * @param value {string} The new value of the property row.
   * @param isValidValue {boolean} Whether the value is valid. Default: true.
   */
  setValue(value, isValidValue) {
    isValidValue = utils.valueOr(isValidValue, true);
    this.setState({
      value: value,
      isValidValue: isValidValue,
    });
    if (isValidValue) {
      this.props.handleChange(value);
    }
  }

  handleClickLock = () => {
    if (this.props.lockState === LockState.LOCKED) {
      this.props.handleLockChange(LockState.UNLOCKED);
    } else if (this.props.lockState === LockState.UNLOCKED) {
      this.props.handleLockChange(LockState.LOCKED);
    }
  };

  onIdRowBlur = () => {
    if (!this.state.isValidValue) {
      const value = this.props.initialValue;
      this.setValue(value);
    }
  };

  render() {
    const idRowStyle = {
      ...rowStyle.container,
      backgroundColor: 'var(--background-brand-purple-light)',
      paddingBottom: 10,
    };

    const buttonStyle = {
      marginTop: '1.375rem',
      height: '2rem',
      width: '2rem',
    };

    return (
      <Box style={this.props.isIdRow ? idRowStyle : rowStyle.container}>
        {this.props.isMultiLine ? (
          <FormFieldWrapper color="black" size="s" label={this.props.desc}>
            <textarea
              name={''}
              value={this.state.value}
              onChange={this.handleChangeInternal}
              style={{
                boxSizing: 'border-box',
                margin: 0,
                width: '100%',
              }}
            />
          </FormFieldWrapper>
        ) : (
          <>
            <TextField
              name={''}
              label={this.props.desc}
              inputType={this.props.isNumber ? 'number' : undefined}
              value={
                this.props.isNumber && isNaN(this.state.value)
                  ? ''
                  : this.state.value
              }
              onChange={this.handleChangeInternal}
              size="s"
              style={{width: '100%'}}
            />
            {this.props.lockState && (
              <MuiIconButton
                aria-label="Lock the field"
                variant="outlined"
                color="secondary"
                size="extraSmall"
                type="button"
                style={buttonStyle}
                onClick={this.handleClickLock}
              >
                <FontAwesomeV6Icon
                  iconStyle="solid"
                  iconName={
                    this.props.lockState === LockState.LOCKED
                      ? 'lock'
                      : 'unlock'
                  }
                />
              </MuiIconButton>
            )}
          </>
        )}
      </Box>
    );
  }
}
