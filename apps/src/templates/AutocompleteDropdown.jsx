import React, { PropTypes } from 'react';
import Select from 'react-select';
import $ from 'jquery';
import 'selectize';

const AutocompleteDropdown = React.createClass({
  propTypes: {
    options: PropTypes.array,
  },

  processResponse(data) {
    console.log(data);
    return data;
  },

  processError() {
    console.log("There was an error fetching schools");
  },

  getSchools() {
    $.ajax({
      url: 'http://localhost-studio.code.org:3000/dashboardapi/v1/schoolsearch/' + ("ab") + '/40',
      type: 'GET',
    }).done(this.processResponse).fail(this.processError);
    event.preventDefault();
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

    return (
      <div className="section">
        <Select
          autofocus
          options={this.getSchools()}
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
