import PropTypes from 'prop-types';
import React, {Component} from 'react';
import * as Table from 'reactabular-table';
import {lessonEditorTableStyles} from './TableConstants';
import color from '@cdo/apps/util/color';
import Dialog from '@cdo/apps/templates/Dialog';

const styles = {
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
  }
};

export default class StandardsEditor extends Component {
  static propTypes = {
    standards: PropTypes.arrayOf(PropTypes.object).isRequired
  };

  state = {
    standardToRemove: null,
    confirmRemovalDialogOpen: false
  };

  actionsCellFormatter = (actions, {rowData}) => {
    return (
      <div style={styles.actionsColumn}>
        <div
          style={styles.remove}
          className="unit-test-remove-standard"
          onMouseDown={() => this.handleRemoveStandardDialogOpen(rowData)}
        >
          <i className="fa fa-trash" />
        </div>
      </div>
    );
  };

  getColumns() {
    const columns = [
      {
        property: 'frameworkName',
        header: {
          label: 'Framework',
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
        property: 'shortcode',
        header: {
          label: 'Shortcode',
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
        property: 'description',
        header: {
          label: 'Description',
          props: {
            style: {width: '60%'}
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
    return columns;
  }

  handleRemoveStandardDialogOpen = standard => {
    this.setState({standardToRemove: standard, confirmRemovalDialogOpen: true});
  };

  handleRemoveStandardDialogClose = () => {
    this.setState({standardToRemove: null, confirmRemovalDialogOpen: false});
  };

  removeStandard = () => {
    const {frameworkShortcode, shortcode} = this.state.standardToRemove;
    console.log('removeStandard', frameworkShortcode, shortcode);
    // this.props.removeStandard(frameworkShortcode, shortcode);
    this.handleRemoveStandardDialogClose();
  };

  render() {
    const columns = this.getColumns();
    return (
      <div>
        <Table.Provider columns={columns}>
          <Table.Header />
          <Table.Body rows={this.props.standards} rowKey="shortcode" />
        </Table.Provider>
        {this.state.confirmRemovalDialogOpen && (
          <Dialog
            body={`Are you sure you want to remove standard "${
              this.state.standardToRemove.shortcode
            }" from this lesson?`}
            cancelText="Cancel"
            confirmText="Delete"
            confirmType="danger"
            isOpen={this.state.confirmRemovalDialogOpen}
            handleClose={this.handleRemoveStandardDialogClose}
            onCancel={this.handleRemoveStandardDialogClose}
            onConfirm={this.removeStandard}
          />
        )}
      </div>
    );
  }
}
