import PropTypes from 'prop-types';
import React from 'react';
import color from '../../util/color';
import * as rowStyle from './rowStyle';
import * as elementUtils from './elementUtils';
import * as utils from '../../utils';

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
      undefined
    ]),
    isMultiLine: PropTypes.bool,
    handleChange: PropTypes.func,
    handleLockChange: PropTypes.func,
    isIdRow: PropTypes.bool
  };

  static LockState = LockState;

  state = {
    value: this.props.initialValue,
    isValidValue: true
  };

  UNSAFE_componentWillReceiveProps(newProps) {
    this.setState({
      value: newProps.initialValue,
      isValidValue: true
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
      allowDesignPrefix: false
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
      isValidValue: isValidValue
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
    const idRowStyle = Object.assign(
      {},
      rowStyle.container,
      rowStyle.maxWidth,
      {
        backgroundColor: color.light_purple,
        paddingBottom: 10
      }
    );
    const inputStyle = Object.assign({}, rowStyle.input, {
      backgroundColor: this.state.isValidValue ? null : '#ffcccc'
    });

    let inputElement;
    if (this.props.isMultiLine) {
      inputElement = (
        <textarea
          value={this.state.value}
          onChange={this.handleChangeInternal}
        />
      );
    } else {
      inputElement = (
        <input
          type={this.props.isNumber ? 'number' : undefined}
          value={this.state.value}
          onChange={this.handleChangeInternal}
          onBlur={this.props.isIdRow ? this.onIdRowBlur : null}
          style={inputStyle}
        />
      );
    }

    const lockStyle = {
      marginLeft: '5px'
    };

    let lockIcon;
    // state is either locked/unlocked or undefined (no icon)
    if (this.props.lockState) {
      const lockClass =
        'fa fa-' +
        (this.props.lockState === LockState.LOCKED ? 'lock' : 'unlock');
      lockIcon = (
        <i
          className={lockClass}
          style={lockStyle}
          onClick={this.handleClickLock}
        />
      );
    }

    return (
      <div style={this.props.isIdRow ? idRowStyle : rowStyle.container}>
        <div style={rowStyle.description}>{this.props.desc}</div>
        <div>
          {inputElement}
          {lockIcon}
        </div>
      </div>
    );
  }
}
