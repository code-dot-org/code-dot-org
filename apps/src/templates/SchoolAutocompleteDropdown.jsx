import React, { Component, PropTypes } from 'react';
import VirtualizedSelect from 'react-virtualized-select';
import 'react-virtualized/styles.css';
import 'react-select/dist/react-select.css';
import 'react-virtualized-select/styles.css';
import _ from 'lodash';
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

  debouncedSearch = _.debounce((q, callback) => {
    const searchUrl = `/dashboardapi/v1/schoolsearch/${encodeURIComponent(q)}/40`;
    fetch(searchUrl)
      .then(response => response.ok ? response.json() : [])
      .then(json => {
        const schools = json.map(school => this.constructSchoolOption(school));
        schools.unshift(this.constructSchoolNotFoundOption());
        return { options: schools };
      })
      .then(result => callback(null, result))
      .catch(err => callback(err, null));
  }, 200);

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

    return new Promise((resolve, reject) => {
      this.debouncedSearch(q, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  };

  render() {
    return (
      <VirtualizedSelect
        id="nces_school"
        name={this.props.fieldName}
        async={true}
        loadOptions={this.getOptions}
        cache={false}
        filterOption={() => true}
        value={this.props.value}
        onChange={this.props.onChange}
        placeholder={i18n.searchForSchool()}
      />
    );
  }
}
