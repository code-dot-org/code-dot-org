import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {resourceShape} from '@cdo/apps/lib/levelbuilder/shapes';
import _ from 'lodash';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import color from '@cdo/apps/util/color';
import AddResourceDialog from './AddResourceDialog';
import Button from '@cdo/apps/templates/Button';
import {connect} from 'react-redux';
import {
  addResource,
  editResource,
  removeResource
} from '@cdo/apps/lib/levelbuilder/lesson-editor/resourcesEditorRedux';

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
  actionsColumn: {
    display: 'flex',
    justifyContent: 'space-evenly',
    backgroundColor: 'white'
  },
  remove: {
    fontSize: 14,
    color: 'white',
    background: color.dark_red,
    cursor: 'pointer',
    textAlign: 'center',
    width: '48%'
  },
  edit: {
    fontSize: 14,
    color: 'white',
    background: color.default_blue,
    cursor: 'pointer',
    textAlign: 'center',
    width: '48%'
  }
};

class ResourcesEditor extends Component {
  static propTypes = {
    courseVersionId: PropTypes.number,

    // Provided by redux
    resources: PropTypes.arrayOf(resourceShape).isRequired,
    addResource: PropTypes.func.isRequired,
    editResource: PropTypes.func.isRequired,
    removeResource: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
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
    const params = {
      query: encodeURIComponent(q),
      limit: searchLimit
    };
    if (this.props.courseVersionId) {
      params['courseVersionId'] = this.props.courseVersionId;
    }
    const query_params = Object.keys(params)
      .map(key => `${key}=${params[key]}`)
      .join('&');
    const searchUrl = `/resourcesearch?${query_params}`;
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
        const resourceKeysAdded = this.props.resources.map(
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
    this.props.addResource(resource);
  };

  saveEditResource = resource => {
    this.props.editResource(resource);
  };

  handleRemove = key => {
    this.props.removeResource(key);
  };

  handleEdit = resource => {
    this.setState({newResourceDialogOpen: true, editingResource: resource});
  };

  handleAddResourceClick = e => {
    e.preventDefault();
    this.setState({newResourceDialogOpen: true});
  };

  handleNewResourceDialogClose = () => {
    this.setState({newResourceDialogOpen: false, editingResource: null});
  };

  render() {
    return (
      <div>
        {this.state.newResourceDialogOpen && (
          <AddResourceDialog
            isOpen={this.state.newResourceDialogOpen}
            onSave={
              this.state.editingResource
                ? this.saveEditResource
                : this.addResource
            }
            handleClose={this.handleNewResourceDialogClose}
            existingResource={this.state.editingResource}
            courseVersionId={this.props.courseVersionId}
          />
        )}
        Resources
        <input
          type="hidden"
          name="resources"
          value={JSON.stringify(this.props.resources.map(r => r.key))}
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
                <th style={{width: '20%'}}>Key</th>
                <th style={{width: '20%'}}>Name</th>
                <th style={{width: '10%'}}>Type</th>
                <th style={{width: '10%'}}>Audience</th>
                <th style={{width: '30%'}}>URL</th>
                <th style={{width: '10%'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {this.props.resources.map((resource, index) => (
                <tr
                  key={resource.key}
                  style={index % 2 === 1 ? styles.oddRow : {}}
                >
                  <td>{resource.key}</td>
                  <td>{resource.name}</td>
                  <td>{resource.type}</td>
                  <td>{resource.audience}</td>
                  <td>{resource.url}</td>
                  <td style={styles.actionsColumn}>
                    <div
                      style={styles.edit}
                      onMouseDown={() => this.handleEdit(resource)}
                    >
                      <i className="fa fa-edit" />
                    </div>
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
          <Button
            onClick={this.handleAddResourceClick}
            text={'Add New Resource'}
            color={color.blue}
          />
        </div>
      </div>
    );
  }
}

export const UnconnectedResourcesEditor = ResourcesEditor;

export default connect(
  state => ({
    resources: state.resources
  }),
  {
    addResource,
    editResource,
    removeResource
  }
)(ResourcesEditor);
