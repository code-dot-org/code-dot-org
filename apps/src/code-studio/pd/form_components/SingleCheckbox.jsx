import PropTypes from 'prop-types';
import React from 'react';
import {Checkbox} from 'react-bootstrap';

const style = {
  required: {
    color: 'red',
    float: 'left',
    marginLeft: -8
  }
};

const REQUIRED = <span style={style.required}>*</span>;

export default class SingleCheckbox extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.element])
      .isRequired,
    value: PropTypes.bool,
    required: PropTypes.bool,
    validationState: PropTypes.string,
    onChange: PropTypes.func,
    style: PropTypes.object
  };

  handleChange = event => {
    this.props.onChange &&
      this.props.onChange({
        [this.props.name]: event.target.checked
      });
  };

  render() {
    return (
      <Checkbox
        id={this.props.name}
        checked={this.props.value || false}
        onChange={this.handleChange}
        validationState={this.props.validationState}
        style={this.props.style}
      >
        {this.props.required && REQUIRED}
        {this.props.label}
      </Checkbox>
    );
  }
}
