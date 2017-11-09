import React, { Component, PropTypes } from 'react';
import VirtualizedSelect from 'react-virtualized-select';
import 'react-virtualized/styles.css';
import 'react-select/dist/react-select.css';
import 'react-virtualized-select/styles.css';
import i18n from "@cdo/locale";

export default class SchoolAutocompleteDropdown extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    // Value is the NCES id of the school
    value: PropTypes.string
  };

  getOptions(q) {
    if (q.length < 4) {
      return Promise.resolve();
    }
    const url = `/dashboardapi/v1/schoolsearch/${encodeURIComponent(q)}/40`;
    return fetch(url)
      .then(response => response.ok ? response.json() : [])
      .then(json => {
        const schools = json.map(school => ({
          value: school.nces_id.toString(),
          label: `${school.name} - ${school.city}, ${school.state} ${school.zip}`
        }));
        schools.unshift({ value: "-1", label: i18n.schoolNotFound()});
        return { options: schools };
    });
  }

  render() {
    return (
      <VirtualizedSelect
        id="nces_school"
        name="nces_school_s"
        async={true}
        loadOptions={this.getOptions}
        filterOption={() => true}
        value={this.props.value}
        onChange={this.props.onChange}
        placeholder={i18n.searchForSchool()}
      />
    );
  }
}
