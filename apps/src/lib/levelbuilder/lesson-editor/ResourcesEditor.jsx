import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {resourceShape} from '@cdo/apps/lib/levelbuilder/shapes';
import _ from 'lodash';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import color from '@cdo/apps/util/color';
import AddResourceDialog from './AddResourceDialog';

const styles = {
  resourceSearch: {
    paddingBottom: 10
  },
  resourceBox: {
    border: '1px solid ' + color.light_gray,
    padding: 10,
    marginTop: 10,
    marginBottom: 10
  },
  oddRow: {
    backgroundColor: color.lightest_gray
  },

  remove: {
    fontSize: 14,
    color: 'white',
    background: color.dark_red,
    cursor: 'pointer',
    textAlign: 'center'
  }
};

export default class ResourcesEditor extends Component {
  static propTypes = {
    resources: PropTypes.arrayOf(resourceShape)
  };

  constructor(props) {
    super(props);

    this.state = {
      resources: props.resources || [],
      resourceInput: '',
      searchValue: '',
      newResourceDialogOpen: false
    };
  }

  constructResourceOption = resource => ({
    value: resource.key.toString(),
    label: `${resource.name} - ${resource.url}`,
    resource: resource
  });

  /**
   * Debounced function that will request resource search results from the server.
   * Because this function is debounced it is not guaranteed to execute
   * when it is called - there may be a delay of up to 200ms.
   * @param {string} q - Search query
   * @param {function(err, result)} callback - Function called when the server
   *   returns results or a request error occurs.
   */
  debouncedSearch = _.debounce((q, callback) => {
    const searchLimit = 7;
    const searchUrl = `/resourcesearch/${encodeURIComponent(q)}/${searchLimit}`;
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
        const resourceKeysAdded = this.state['resources'].map(
          resource => resource.key
        );
        const resources = json
          .map(resource => this.constructResourceOption(resource))
          // Filter any that are already added to lesson
          .filter(resource => resourceKeysAdded.indexOf(resource.value) === -1);
        return {options: resources};
      })
      .then(result => callback(null, result))
      .catch(err => callback(err, null));
  }, 200);

  getOptions = q => {
    // Only search if there are at least 3 characters
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

  addResource = resource => {
    var {resources} = this.state;
    resources.push(resource);
    this.setState({resources});
  };

  handleRemove = key => {
    const {resources} = this.state;
    const resourceToRemove = resources.find(resource => resource.key === key);
    resources.splice(resources.indexOf(resourceToRemove), 1);
    this.setState({resources});
  };

  handleNewResourceDialogClose = () => {
    this.setState({newResourceDialogOpen: false});
  };

  render() {
    return (
      <div>
        <AddResourceDialog
          isOpen={this.state.newResourceDialogOpen}
          onSave={this.addResource}
          handleClose={this.handleNewResourceDialogClose}
          typeOptions={['handout', 'slides']}
          audienceOptions={['teacher', 'studen']}
        />
        Resources
        <input
          type="hidden"
          name="resources"
          value={JSON.stringify(this.state.resources.map(r => r.key))}
        />
        <div style={styles.resourceBox}>
          <div style={styles.resourceSearch}>
            <label>Select a resource to add</label>
            <Select.Async
              id="resource_search"
              name="resource_search"
              loadOptions={this.getOptions}
              value={this.state.searchValue}
              onChange={e => this.addResource(e.resource)}
              onValueClick={this.addResource}
              placeholder={''}
            />
          </div>
          <table style={{width: '100%'}}>
            <thead>
              <tr>
                <th style={{width: '10%'}}>Key</th>
                <th style={{width: '25%'}}>Name</th>
                <th style={{width: '15%'}}>Type</th>
                <th style={{width: '40%'}}>URL</th>
                <th style={{width: '10%'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {this.state.resources.map((resource, index) => (
                <tr
                  key={resource.key}
                  style={index % 2 === 1 ? styles.oddRow : {}}
                >
                  <td>{resource.key}</td>
                  <td>{resource.name}</td>
                  <td>{resource.type}</td>
                  <td>{resource.url}</td>
                  <td style={{backgroundColor: 'white'}}>
                    <div
                      style={styles.remove}
                      onMouseDown={() => this.handleRemove(resource.key)}
                    >
                      <i className="fa fa-times" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          Or add a new resource
          <div onMouseDown={() => this.setState({newResourceDialogOpen: true})}>
            <i className="fa fa-plus" />
          </div>
        </div>
      </div>
    );
  }
}
