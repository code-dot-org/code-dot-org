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
    background: color.cyan,
    borderRadius: 3,
    color: color.white,
    fontSize: 14,
    padding: 7,
    textAlign: 'center',
    marginTop: 10,
    marginLeft: 0
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
          <Table.Provider columns={columns}>
            <Table.Header />
            <Table.Body rows={this.props.resources} rowKey="key" />
          </Table.Provider>
          <button
            onClick={this.handleAddResourceClick}
            style={styles.addButton}
            type="button"
          >
            <i className="fa fa-plus" style={{marginRight: 7}} /> Resource
          </button>
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
