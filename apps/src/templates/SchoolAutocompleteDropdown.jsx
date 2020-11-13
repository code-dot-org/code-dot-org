import PropTypes from 'prop-types';
import React, {Component} from 'react';
import loadable from '../util/loadable';
const VirtualizedSelect = loadable(() => import('./VirtualizedSelect'));
import _ from 'lodash';
import i18n from '@cdo/locale';
import experiments from '@cdo/apps/util/experiments';

export default class SchoolAutocompleteDropdown extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    // Value is the NCES id of the school
    value: PropTypes.string,
    fieldName: PropTypes.string,
    schoolDropdownOption: PropTypes.object,
    schoolFilter: PropTypes.func,
    disabled: PropTypes.bool
  };

  state = {
    knownValue: null,
    knownLabel: null
  };

  static defaultProps = {
    fieldName: 'nces_school_s',
    schoolFilter: () => true
  };

  constructSchoolOption = school => ({
    value: school.nces_id.toString(),
    label: `${school.name} - ${school.city}, ${school.state} ${school.zip}`,
    school: school
  });

  constructSchoolNotFoundOption = () => ({
    value: '-1',
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
    const searchUrl =
      `/dashboardapi/v1/schoolsearch/${encodeURIComponent(q)}/40` +
      (experiments.isEnabled(
        experiments.SCHOOL_AUTOCOMPLETE_DROPDOWN_NEW_SEARCH
      )
        ? '/useNewSearch'
        : '');

    // Note, we don't return the fetch promise chain because in a debounced
    // function we're not guaranteed to return anything, and it's not a great
    // interface to sometimes return undefined when there's still async work
    // going on.
    //
    // We are including the X-Requested-With header to avoid getting a 403
    // returned by Rack::Protection::JsonCsrf in some environments
    fetch(searchUrl, {headers: {'X-Requested-With': 'XMLHttpRequest'}})
      .then(response => (response.ok ? response.json() : []))
      .then(json => {
        const schools = json
          .filter(this.props.schoolFilter)
          .map(school => this.constructSchoolOption(school));
        schools.unshift(this.constructSchoolNotFoundOption());
        return {options: schools};
      })
      .then(result => callback(null, result))
      .catch(err => callback(err, null));
  }, 200);

  getOptions = q => {
    // Existing value? Construct the matching option for display.
    if (q.length === 0 && this.props.value) {
      if (this.props.value === '-1') {
        return Promise.resolve({
          options: [this.constructSchoolNotFoundOption()]
        });
      } else {
        const getUrl = `/dashboardapi/v1/schools/${this.props.value}`;
        return fetch(getUrl)
          .then(response => (response.ok ? response.json() : []))
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

  onChange = value => {
    if (value) {
      // Cache the label for this value in case we need it for the next render.
      this.setState({knownValue: value.value, knownLabel: value.label});
    }
    this.props.onChange(value);
  };

  render() {
    // value will end up either an object or a string, depending whether we have
    // a label or not.  It appears to be the quirky behavior of react-select 1.x.
    // See https://github.com/JedWatson/react-select/issues/865.
    let value;
    if (this.props.schoolDropdownOption) {
      // Use the provided value & label object.
      value = this.props.schoolDropdownOption;
    } else if (this.props.value === this.state.knownValue) {
      // Use the cached label for this value.
      value = {value: this.props.value, label: this.state.knownLabel};
    } else {
      // Use this value (typically an initial value).  The label will be
      // asychronously retrieved in this.getOptions().
      value = this.props.value;
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
        searchPromptText={i18n.searchForSchoolPrompt()}
        disabled={this.props.disabled}
      />
    );
  }
}
