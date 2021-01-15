import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import _ from 'lodash';

export default class SearchBox extends Component {
  static propTypes = {
    onSearchSelect: PropTypes.func.isRequired,
    searchUrl: PropTypes.string.isRequired,
    constructOptions: PropTypes.func.isRequired,
    additionalQueryParams: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      searchValue: ''
    };
  }

  /**
   * Debounced function that will request search results from the server.
   * Because this function is debounced it is not guaranteed to execute
   * when it is called - there may be a delay of up to 200ms.
   * @param {string} q - Search query
   * @param {function(err, result)} callback - Function called when the server
   *   returns results or a request error occurs.
   */
  debouncedSearch = _.debounce((q, resolve, reject) => {
    const searchLimit = 7;
    const params = {
      query: encodeURIComponent(q),
      limit: searchLimit
    };
    if (this.props.additionalQueryParams) {
      Object.assign(params, this.props.additionalQueryParams);
    }
    const query_params = Object.keys(params)
      .map(key => `${key}=${params[key]}`)
      .join('&');
    const searchUrl = `/${this.props.searchUrl}?${query_params}`;
    // Note, we don't return the fetch promise chain because in a debounced
    // function we're not guaranteed to return anything, and it's not a great
    // interface to sometimes return undefined when there's still async work
    // going on.
    //
    // We are including the X-Requested-With header to avoid getting a 403
    // returned by Rack::Protection::JsonCsrf in some environments
    fetch(searchUrl, {
      headers: {'X-Requested-With': 'XMLHttpRequest'}
    })
      .then(response => (response.ok ? response.json() : []))
      .then(json => {
        return this.props.constructOptions(json);
      })
      .then(resolve)
      .catch(reject);
  }, 200);

  getOptions = q => {
    // Only search if there are at least 3 characters
    if (q.length < 3) {
      return Promise.resolve();
    }

    // Wrap the debounced call in a Promise so we _always_ return a promise
    // from this function, which resolves whenever results come back.
    return new Promise((resolve, reject) => {
      this.debouncedSearch(q, resolve, reject);
    });
  };

  render() {
    return (
      <Select.Async
        loadOptions={this.getOptions}
        value={this.state.searchValue}
        onChange={this.props.onSearchSelect}
        placeholder={''}
      />
    );
  }
}
