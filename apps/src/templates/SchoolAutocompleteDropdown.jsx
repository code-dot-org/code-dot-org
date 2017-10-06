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
        return Promise.resolve({ options: [] });
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
          console.log("schools", schools);
          return { options: schools };
      });
    };

    return (
      <div>
        <VirtualizedSelect
          id="nces_school"
          clearable={true}
          async={true}
          loadOptions={getOptions}
          value={this.state.selectValue}
          disabled={false}
          onChange={(selectValue) => this.setState({ selectValue })}
        />
      </div>
    );
  }
}
