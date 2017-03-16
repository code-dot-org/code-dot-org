import React from 'react';
import ReactDOM from 'react-dom';
import FormGroup from './FormGroup';

const MultiFormGroup = React.createClass({
  propTypes: {
    label: React.PropTypes.string,
    name: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func,
    required: React.PropTypes.bool,
    values: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
  },

  handleChange() {
    const checked = ReactDOM.findDOMNode(this).querySelectorAll('input:checked');
    const values = Array.prototype.map.call(checked, (element) => element.value);
    this.props.onChange && this.props.onChange(values);
  },

  render() {
    return (
      <FormGroup
        label={this.props.label}
        name={this.props.name}
        onChange={this.handleChange}
        required={this.props.required}
        type="checkbox"
        values={this.props.values}
      />
    );
  }
});

export default MultiFormGroup;
