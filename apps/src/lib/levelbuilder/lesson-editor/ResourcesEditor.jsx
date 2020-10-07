import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {resourceShape} from '@cdo/apps/lib/levelbuilder/shapes';
import _ from 'lodash';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import {SelectStyleProps} from '@cdo/apps/code-studio/pd/constants';

export default class ResourcesEditor extends Component {
  static propTypes = {
    resources: PropTypes.arrayOf(resourceShape)
  };

  constructor(props) {
    super(props);

    this.state = {
      resources: props.resources || [],
      resourceInput: '',
      searchValue: ''
    };
  }

  constructResourceOption = resource => ({
    value: resource.key.toString(),
    label: `${resource.name} - ${resource.url}`,
    resource: resource
  });

  addResource = e => {
    e.preventDefault();
    var {resources, resourceInput} = this.state;
    resources.push({key: resourceInput});
    this.setState({resources});
  };

  handleResourceInputChange = e => {
    //this.setState({resourceInput: e.target.value});
    //this.setState({searchValue: e.target.value});
    var {resources} = this.state;
    resources.push(e.resource);
    this.setState({resources});
  };

  /**
   * Debounced function that will request school search results from the server.
   * Because this function is debounced it is not guaranteed to execute
   * when it is called - there may be a delay of up to 200ms.
   * @param {string} q - Search query
   * @param {function(err, result)} callback - Function called when the server
   *   returns results or a request error occurs.
   */
  debouncedSearch = _.debounce((q, callback) => {
    const searchUrl = `/resourcesearch/${encodeURIComponent(q)}/5`;
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
        const resources = json.map(resource =>
          this.constructResourceOption(resource)
        );
        return {options: resources};
      })
      .then(result => callback(null, result))
      .catch(err => callback(err, null));
  }, 200);

  getOptions = q => {
    // Search
    if (q.length < 3) {
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
      <div>
        <input
          type="hidden"
          name="resources"
          value={JSON.stringify(this.state.resources.map(r => r.key))}
        />
        <label>Select a resource to add</label>
        <Select.Async
          id="resource_search"
          name="resource_search"
          loadOptions={this.getOptions}
          value={this.state.searchValue}
          onChange={this.handleResourceInputChange}
          onValueClick={this.addResource}
          placeholder={''}
          {...SelectStyleProps}
        />
        <table style={{width: '100%'}}>
          <thead>
            <tr>
              <th style={{width: '15%'}}>Key</th>
              <th style={{width: '30%'}}>Name</th>
              <th style={{width: '15%'}}>Type</th>
              <th style={{width: '40%'}}>URL</th>
            </tr>
          </thead>
          <tbody>
            {this.state.resources.map((resource, index) => (
              <tr key={resource.key}>
                <td>{resource.key}</td>
                <td>{resource.name}</td>
                <td>{resource.type}</td>
                <td>{resource.url}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}
