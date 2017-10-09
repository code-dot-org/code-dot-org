import React, { Component, PropTypes } from 'react';
import VirtualizedSelect from 'react-virtualized-select';
import 'react-virtualized/styles.css';
import 'react-select/dist/react-select.css';
import 'react-virtualized-select/styles.css';
import SchoolNotFound from './SchoolNotFound';

export default class SchoolAutocompleteDropdown extends Component {
  static propTypes = {
    // This prop allows us to handle special cases where even if the school is // not found via the school autocomplete dropdown, we do NOT want to show
    // the default SchooNotFound input fields. Specifically, on the Hour of
    // Code signup form, the school location is entered via a Google maps
    // lookup to support the functionality of the map on that page.
    overrideSchoolNotFound: PropTypes.bool
  };

  state = {
    selectValue: {value: 0, label: ""}
  };

  render() {
    const getOptions = (q) => {
      if (!q.length) {
        return Promise.resolve({ options: [{ value: -1, label: "Search for your school"}] });
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

    const schoolNotFound = this.state.selectValue.value === -1;

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
      {schoolNotFound && (
        <SchoolNotFound/>
      )}
      </div>
    );
  }
}
