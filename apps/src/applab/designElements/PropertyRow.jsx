import React, {PropTypes} from 'react';
import color from "../../util/color";
import * as rowStyle from './rowStyle';
import * as elementUtils from './elementUtils';
import * as utils from '../../utils';

var LockState = utils.makeEnum('LOCKED', 'UNLOCKED');

var PropertyRow = React.createClass({
  propTypes: {
    desc: PropTypes.string.isRequired,
    initialValue: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]).isRequired,
    isNumber: PropTypes.bool,
    lockState: PropTypes.oneOf([LockState.LOCKED, LockState.UNLOCKED, undefined]),
    isMultiLine: PropTypes.bool,
    handleChange: PropTypes.func,
    handleLockChange: PropTypes.func,
    isIdRow: PropTypes.bool
  },

  getInitialState: function () {
    return {
      value: this.props.initialValue,
      isValidValue: true
    };
  },

  componentWillReceiveProps: function (newProps) {
    this.setState({
      value: newProps.initialValue,
      isValidValue: true
    });
  },

  isIdAvailable: function (value) {
    if (value === this.props.initialValue) {
      return true;
    }

    // Elements in divApplab must be allowed since divApplab may be stale
    // with respect to what's in design mode, and we will catch any collisions
    // with design mode elements by not setting allowDesignElements.
    var options = {
      allowCodeElements: true,
      allowDesignElements: false,
      allowDesignPrefix: false
    };
    return elementUtils.isIdAvailable(value, options);
  },

  handleChangeInternal: function (event) {
    var value = event.target.value;
    var isValidValue = !this.props.isIdRow || this.isIdAvailable(value);
    this.setValue(value, isValidValue);
  },

  /**
   * Updates this component's state, and calls the change handler
   * only if the new value is valid.
   * @param value {string} The new value of the property row.
   * @param isValidValue {boolean} Whether the value is valid. Default: true.
   */
  setValue: function (value, isValidValue) {
    isValidValue = utils.valueOr(isValidValue, true);
    this.setState({
      value: value,
      isValidValue: isValidValue
    });
    if (isValidValue) {
      this.props.handleChange(value);
    }
  },

  handleClickLock: function () {
    if (this.props.lockState === LockState.LOCKED) {
      this.props.handleLockChange(LockState.UNLOCKED);
    } else if (this.props.lockState === LockState.UNLOCKED) {
      this.props.handleLockChange(LockState.LOCKED);
    }
  },

  onIdRowBlur: function () {
    if (!this.state.isValidValue) {
      var value = this.props.initialValue;
      this.setValue(value);
    }
  },

  render: function () {
    var idRowStyle = Object.assign({}, rowStyle.container, rowStyle.maxWidth, {
      backgroundColor: color.light_purple,
      paddingBottom: 10
    });
    var inputStyle = Object.assign({}, rowStyle.input, {
      backgroundColor: this.state.isValidValue ? null : "#ffcccc"
    });

    var inputElement;
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

    var lockStyle = {
      marginLeft: '5px'
    };

    var lockIcon;
    // state is either locked/unlocked or undefined (no icon)
    if (this.props.lockState) {
      var lockClass = "fa fa-" + (this.props.lockState === LockState.LOCKED ?
        'lock' : 'unlock');
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
});
PropertyRow.LockState = LockState;

export default PropertyRow;
