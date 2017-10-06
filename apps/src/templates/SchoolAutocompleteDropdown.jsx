import React, { Component } from 'react';
import VirtualizedSelect from 'react-virtualized-select';
import 'react-virtualized/styles.css';
import 'react-select/dist/react-select.css';
import 'react-virtualized-select/styles.css';

export default class SchoolAutocompleteDropdown extends Component {

  state = {};

  render() {
    const getOptions = (q) => {
      if (!q.length) {
        return Promise.resolve({ options: [{ value: -1, label: "School not found"}] });
      }
      return fetch('/dashboardapi/v1/schoolsearch/' + encodeURIComponent(q) + '/40')
        .then((response) => response.json())
        .then((json) => {
          var schools = [];
          for (var i = 0; i < json.length; i++) {
            schools.push({
              value: json[i].nces_id,
              label: json[i].name + ' - ' + json[i].city + ', ' + json[i].state + ' ' + json[i].zip
            });
          }
          if (schools.length > 1) {
            return { options: schools };
          } else {
            return { options: [{ value: -1, label: "School not found"}] };
          }
      });
    };

    return (
      <div>
        <VirtualizedSelect
          id="nces_school"
          clearable={true}
          async={true}
          loadOptions={getOptions}
          filterOption={() => true}
          value={this.state.selectValue}
          disabled={false}
          onChange={(selectValue) => this.setState({ selectValue })}
          placeholder="Search for your school"
        />
      </div>
    );
  }
}
