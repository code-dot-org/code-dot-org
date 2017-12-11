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
    value: PropTypes.string,
    fieldName: PropTypes.string
  };

  static defaultProps = {
    fieldName: "nces_school_s"
  };

  constructSchoolOption = school => ({
    value: school.nces_id.toString(),
    label: `${school.name} - ${school.city}, ${school.state} ${school.zip}`
  });

  constructSchoolNotFoundOption = () => ({
    value: "-1",
    label: i18n.schoolNotFound()
  });

  getOptions = (q) => {
    // Existing value? Construct the matching option for display.
    if (q.length === 0 && this.props.value) {
      if (this.props.value === '-1') {
        return Promise.resolve({options: [this.constructSchoolNotFoundOption()]});
      } else {
        const getUrl = `/dashboardapi/v1/schools/${this.props.value}`;
        return fetch(getUrl)
          .then(response => response.ok ? response.json() : [])
          .then(json => ({options: [this.constructSchoolOption(json)]}));
      }
    }

    // Search
    if (q.length < 4) {
      return Promise.resolve();
    }
    const searchUrl = `/dashboardapi/v1/schoolsearch/${encodeURIComponent(q)}/40`;
    return fetch(searchUrl)
      .then(response => response.ok ? response.json() : [])
      .then(json => {
        const schools = json.map(school => this.constructSchoolOption(school));
        schools.unshift(this.constructSchoolNotFoundOption());
        return { options: schools };
    });
  };

  render() {
    return (
      <VirtualizedSelect
        id="nces_school"
        name={this.props.fieldName}
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
