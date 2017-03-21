import React from 'react';

const FormGroup = React.createClass({
  propTypes: {
    label: React.PropTypes.string,
    name: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func,
    required: React.PropTypes.bool,
    type: React.PropTypes.string.isRequired,
    values: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
  },

  getDefaultProps() {
    return {
      required: true
    };
  },

  render() {
    const values = this.props.values.map(value => (
      <div className={this.props.type} key={value}>
        <label className="control-label" style={{fontFamily: 'inherit'}}>
          <input
            name={this.props.name}
            type={this.props.type}
            value={value}
            onChange={this.props.onChange}
          />
          {value}
        </label>
      </div>
    ));

    return (
      <div className="form-group" htmlFor={this.props.name}>
        <label className="control-label" htmlFor={this.props.name}>
          {this.props.label}
          {this.props.required && <span className="form-required-field">*</span>}
        </label>
        {values}
      </div>
    );
  }
});

export default FormGroup;
