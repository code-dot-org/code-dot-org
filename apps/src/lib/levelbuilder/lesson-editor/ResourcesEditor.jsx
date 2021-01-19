import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {resourceShape} from '@cdo/apps/lib/levelbuilder/shapes';
import color from '@cdo/apps/util/color';
import AddResourceDialog from './AddResourceDialog';
import SearchBox from './SearchBox';
import Button from '@cdo/apps/templates/Button';
import Dialog from '@cdo/apps/templates/Dialog';
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
      newResourceDialogOpen: false,
      confirmRemovalDialogOpen: false
    };
  }

  onSearchSelect = e => {
    this.props.addResource(e.resource);
  };

  constructResourceOption = resource => ({
    value: resource.key.toString(),
    label: `${resource.name} - ${resource.url}`,
    resource: resource
  });

  addResource = resource => {
    this.props.addResource(resource);
  };

  saveEditResource = resource => {
    this.props.editResource(resource);
  };

  handleRemoveResourceDialogOpen = resource => {
    this.setState({resourceToRemove: resource, confirmRemovalDialogOpen: true});
  };

  handleRemoveResourceDialogClose = () => {
    this.setState({resourceToRemove: null, confirmRemovalDialogOpen: false});
  };

  removeResource = () => {
    this.props.removeResource(this.state.resourceToRemove.key);
    this.handleRemoveResourceDialogClose();
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

  constructSearchOptions = json => {
    const resourceKeysAdded = this.props.resources.map(
      resource => resource.key
    );
    const resources = json
      .map(resource => this.constructResourceOption(resource))
      // Filter any that are already added to lesson
      .filter(resource => resourceKeysAdded.indexOf(resource.value) === -1);
    return {options: resources};
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
        {this.state.confirmRemovalDialogOpen && (
          <Dialog
            body={`Are you sure you want to remove resource "${
              this.state.resourceToRemove.name
            }" from this lesson?`}
            cancelText="Cancel"
            confirmText="Delete"
            confirmType="danger"
            isOpen={this.state.confirmRemovalDialogOpen}
            handleClose={this.handleRemoveResourceDialogClose}
            onCancel={this.handleRemoveResourceDialogClose}
            onConfirm={this.removeResource}
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
            <SearchBox
              onSearchSelect={this.onSearchSelect}
              searchUrl={'resourcesearch'}
              constructOptions={this.constructSearchOptions}
              additionalQueryParams={{
                courseVersionId: this.props.courseVersionId
              }}
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
                      className="unit-test-remove-resource"
                      onMouseDown={() =>
                        this.handleRemoveResourceDialogOpen(resource)
                      }
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
