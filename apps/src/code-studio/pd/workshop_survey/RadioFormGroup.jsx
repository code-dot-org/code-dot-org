import React from 'react';
import ReactDOM from 'react-dom';
import FormGroup from './FormGroup';

const SingleFormGroup = React.createClass({
  propTypes: {
    label: React.PropTypes.string,
    name: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func,
    required: React.PropTypes.bool,
    values: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
  },

  handleChange() {
    const value = ReactDOM.findDOMNode(this).querySelector('input:checked').value;
    this.props.onChange && this.props.onChange(value);
  },

  render() {
    return (
      <FormGroup
        label={this.props.label}
        name={this.props.name}
        onChange={this.handleChange}
        required={this.props.required}
        type="radio"
        values={this.props.values}
      />
    );
  }
});

export default SingleFormGroup;
