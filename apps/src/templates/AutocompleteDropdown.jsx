import React, { PropTypes } from 'react';
import Select from 'react-select';

const AutocompleteDropdown = React.createClass({
  propTypes: {
    options: PropTypes.array.required,
  },

  getInitialState() {
    return {
    disabled: false,
    searchable: true,
    };
  },

  switchOption(e) {
    const newOption = e.target.value;
    this.setState({
      option: newOption,
      selectValue: null
    });
  },

  updateValue(newValue) {
    this.setState({
      selectValue: newValue
    });
  },

  focusStateSelect() {
    this.refs.stateSelect.focus();
  },

  render() {
    const {options} = this.props;

    return (
      <div className="section">
        <Select
          autofocus
          options={options}
          simpleValue
          name="selected-state"
          disabled={this.state.disabled}
          value={this.state.selectValue}
          onChange={this.updateValue}
          searchable={true}
          style={{width:300, marginTop:50}}
        />
      </div>
    );
  }
});

export default AutocompleteDropdown;
