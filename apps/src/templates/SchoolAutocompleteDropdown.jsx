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
    fieldName: PropTypes.string,
    schoolDropdownOption: PropTypes.object,
    schoolFilter: PropTypes.func,
  };

  static defaultProps = {
    fieldName: "nces_school_s",
    schoolFilter: () => true,
  };


  constructSchoolOption = school => ({
    value: school.nces_id.toString(),
    label: `${school.name} - ${school.city}, ${school.state} ${school.zip}`,
    school: school,
  });

  constructSchoolNotFoundOption = () => ({
    value: "-1",
    label: i18n.schoolNotFound()
  });

  /**
   * Debounced function that will request school search results from the server.
   * Because this function is debounced it is not guaranteed to execute
   * when it is called - there may be a delay of up to 200ms.
   * @param {string} q - Search query
   * @param {function(err, result)} callback - Function called when the server
   *   returns results or a request error occurs.
   */
  debouncedSearch = _.debounce((q, callback) => {
    const searchUrl = `/dashboardapi/v1/schoolsearch/${encodeURIComponent(q)}/40`;
    // Note, we don't return the fetch promise chain because in a debounced
    // function we're not guaranteed to return anything, and it's not a great
    // interface to sometimes return undefined when there's still async work
    // going on.
    //
    // We are including the X-Requested-With header to avoid getting a 403
    // returned by Rack::Protection::JsonCsrf in some environments
    fetch(searchUrl, {headers: {'X-Requested-With': 'XMLHttpRequest'}})
      .then(response => response.ok ? response.json() : [])
      .then(json => {
        const schools = json.filter(this.props.schoolFilter).map(school => this.constructSchoolOption(school));
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

    // Wrap the debounced call in a Promise so we _always_ return a promise
    // from this function, which resolves whenever results come back.
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
        value={this.props.schoolDropdownOption ? this.props.schoolDropdownOption : this.props.value}
        onChange={this.props.onChange}
        placeholder={i18n.searchForSchool()}
      />
    );
  }
}
