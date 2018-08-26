import React, { Component, PropTypes } from 'react';
import VirtualizedSelect from 'react-virtualized-select';
import 'react-virtualized/styles.css';
import 'react-select/dist/react-select.css';
import 'react-virtualized-select/styles.css';
import _ from 'lodash';
import i18n from "@cdo/locale";
import experiments from '@cdo/apps/util/experiments';

export default class SchoolAutocompleteDropdown extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    fieldName: PropTypes.string,
    initialValue: PropTypes.string,
    schoolDropdownOption: PropTypes.object,
    schoolFilter: PropTypes.func,
  };

  state = {
    initialValueLoaded: false
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
    const searchUrl = `/dashboardapi/v1/schoolsearch/${encodeURIComponent(q)}/40` +
      (experiments.isEnabled(experiments.SCHOOL_AUTOCOMPLETE_DROPDOWN_NEW_SEARCH) ?
       '/useNewSearch' : '');

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
    let value;
    if (this.props.initialValue && !this.state.initialValueLoaded) {
      value = this.props.initialValue;
    } else if (this.props.schoolDropdownOption && this.props.schoolDropdownOption.value !== '') {
      value = this.props.schoolDropdownOption.value;
    } else {
      value = null;
    }

    // Existing value? Construct the matching option for display.
    if (q.length === 0 && value) {
      if (value === '-1') {
        return Promise.resolve({options: [this.constructSchoolNotFoundOption()]});
      } else {
        const getUrl = `/dashboardapi/v1/schools/${value}`;
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

  onChange = (value) => {
    this.setState({initialValueLoaded: true});
    this.props.onChange(value);
  };

  render() {
    // If we have an initial value, and we haven't manually changed away from it
    // yet, then use that value.  It's passed into the VirtualizedSelect as a string,
    // and the whole value will be retrieved asynchronously.
    // In lieu of that, if we have a proper schoolDropdownOption (which is an object
    // containing a value and a label to be displayed in the dropdown) then pass
    // it into the VirtualizedSelect as an object.
    // This different types of parameters are goofy but appear to be quirks of
    // react-select 1.x.
    let value;
    if (this.props.initialValue && !this.state.initialValueLoaded) {
      value = this.props.initialValue;
    } else if (this.props.schoolDropdownOption && this.props.schoolDropdownOption.value !== '') {
      value = this.props.schoolDropdownOption;
    } else {
      value = null;
    }

    return (
      <VirtualizedSelect
        id="nces_school"
        name={this.props.fieldName}
        async={true}
        loadOptions={this.getOptions}
        cache={false}
        filterOption={() => true}
        value={value}
        onChange={this.onChange}
        placeholder={i18n.searchForSchool()}
      />
    );
  }
}
