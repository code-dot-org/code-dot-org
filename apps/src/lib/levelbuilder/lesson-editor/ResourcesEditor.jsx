import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {resourceShape} from '@cdo/apps/lib/levelbuilder/shapes';
import color from '@cdo/apps/util/color';
import AddResourceDialog from './AddResourceDialog';
import SearchBox from './SearchBox';
import Dialog from '@cdo/apps/templates/Dialog';
import {connect} from 'react-redux';
import {
  addResource,
  editResource,
  removeResource
} from '@cdo/apps/lib/levelbuilder/lesson-editor/resourcesEditorRedux';
import * as Table from 'reactabular-table';
import {lessonEditorTableStyles} from './TableConstants';
import $ from 'jquery';

class ResourcesEditor extends Component {
  static propTypes = {
    courseVersionId: PropTypes.number,
    resourceContext: PropTypes.string.isRequired,
    resources: PropTypes.arrayOf(resourceShape).isRequired,
    getRollupsUrl: PropTypes.string,

    // Provided by redux
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
      confirmRemovalDialogOpen: false,
      error: ''
    };
  }

  actionsCellFormatter = (actions, {rowData}) => {
    return (
      <div style={styles.actionsColumn}>
        <div style={styles.edit} onMouseDown={() => this.handleEdit(rowData)}>
          <i className="fa fa-edit" />
        </div>
        <div
          style={styles.remove}
          className="unit-test-remove-resource"
          onMouseDown={() => this.handleRemoveResourceDialogOpen(rowData)}
        >
          <i className="fa fa-trash" />
        </div>
      </div>
    );
  };

  getColumns() {
    return [
      {
        property: 'key',
        header: {
          label: 'Key',
          props: {
            style: {width: '20%'}
          }
        },
        cell: {
          props: {
            style: {
              ...lessonEditorTableStyles.cell
            }
          }
        }
      },
      {
        property: 'name',
        header: {
          label: 'Name',
          props: {
            style: {width: '15%'}
          }
        },
        cell: {
          props: {
            style: {
              ...lessonEditorTableStyles.cell
            }
          }
        }
      },
      {
        property: 'type',
        header: {
          label: 'Type',
          props: {
            style: {width: '10%'}
          }
        },
        cell: {
          props: {
            style: {
              ...lessonEditorTableStyles.cell
            }
          }
        }
      },
      {
        property: 'audience',
        header: {
          label: 'Audience',
          props: {
            style: {width: '7%'}
          }
        },
        cell: {
          props: {
            style: {
              ...lessonEditorTableStyles.cell
            }
          }
        }
      },
      {
        property: 'url',
        header: {
          label: 'URL',
          props: {
            style: {width: '35%'}
          }
        },
        cell: {
          props: {
            style: {
              ...lessonEditorTableStyles.cell
            }
          }
        }
      },
      {
        property: 'actions',
        header: {
          label: 'Actions',
          props: {
            style: {width: '10%'}
          }
        },
        cell: {
          formatters: [this.actionsCellFormatter],
          props: {
            style: {
              ...lessonEditorTableStyles.actionsCell
            }
          }
        }
      }
    ];
  }

  onSearchSelect = e => {
    this.props.addResource(this.props.resourceContext, e.resource);
  };

  constructResourceOption = resource => ({
    value: resource.key.toString(),
    label: `${resource.name} - ${resource.url}`,
    resource: resource
  });

  addResource = resource => {
    this.props.addResource(this.props.resourceContext, resource);
  };

  saveEditResource = resource => {
    this.props.editResource(this.props.resourceContext, resource);
  };

  handleRemoveResourceDialogOpen = resource => {
    this.setState({resourceToRemove: resource, confirmRemovalDialogOpen: true});
  };

  handleRemoveResourceDialogClose = () => {
    this.setState({resourceToRemove: null, confirmRemovalDialogOpen: false});
  };

  removeResource = () => {
    this.props.removeResource(
      this.props.resourceContext,
      this.state.resourceToRemove.key
    );
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

  addRollupPages = () => {
    $.ajax({
      url: this.props.getRollupsUrl,
      method: 'GET',
      contentType: 'application/json;charset=UTF-8'
    })
      .done(data => {
        this.props.resources
          .filter(resource => resource.isRollup)
          .filter(resource => !data.find(r => r.key === resource.key))
          .forEach(resource =>
            this.props.removeResource(this.props.resourceContext, resource)
          );
        data
          .filter(
            resource => !this.props.resources.find(r => r.key === resource.key)
          )
          .forEach(resource =>
            this.props.addResource(this.props.resourceContext, resource)
          );
      })
      .fail(error => {
        this.setState({error: 'Could not add rollup resources'});
      });
  };

  render() {
    const columns = this.getColumns();
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
        <div>
          <div style={styles.resourceSearch}>
            <label>
              <strong>Select a resource to add</strong>
            </label>
            <SearchBox
              onSearchSelect={this.onSearchSelect}
              searchUrl={'resources/search'}
              constructOptions={this.constructSearchOptions}
              additionalQueryParams={{
                courseVersionId: this.props.courseVersionId
              }}
            />
          </div>
          <Table.Provider columns={columns}>
            <Table.Header />
            <Table.Body rows={this.props.resources} rowKey="key" />
          </Table.Provider>
          <button
            onClick={this.handleAddResourceClick}
            style={styles.addButton}
            type="button"
          >
            <i className="fa fa-plus" style={{marginRight: 7}} /> Create New
            Resource
          </button>
          {this.props.getRollupsUrl && (
            <button
              onClick={this.addRollupPages}
              style={styles.addButton}
              type="button"
            >
              Add rollup pages
            </button>
          )}
          {this.state.error && <h3>{this.state.error}</h3>}
        </div>
      </div>
    );
  }
}

const styles = {
  resourceSearch: {
    paddingBottom: 10
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
    width: '50%',
    lineHeight: '30px'
  },
  edit: {
    fontSize: 14,
    color: 'white',
    background: color.default_blue,
    cursor: 'pointer',
    textAlign: 'center',
    width: '50%',
    lineHeight: '30px'
  },
  addButton: {
    background: '#eee',
    border: '1px solid #ddd',
    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.8)',
    borderRadius: 3,
    fontSize: 14,
    padding: 7,
    textAlign: 'center',
    marginTop: 10,
    marginLeft: 0
  }
};

export const UnconnectedResourcesEditor = ResourcesEditor;

export default connect(
  state => ({}),
  {
    addResource,
    editResource,
    removeResource
  }
)(ResourcesEditor);
