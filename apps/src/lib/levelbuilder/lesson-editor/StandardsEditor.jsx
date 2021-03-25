import PropTypes from 'prop-types';
import React, {Component} from 'react';
import * as Table from 'reactabular-table';
import {lessonEditorTableStyles} from './TableConstants';
import color from '@cdo/apps/util/color';
import Dialog from '@cdo/apps/templates/Dialog';
import {connect} from 'react-redux';
import {removeStandard} from '@cdo/apps/lib/levelbuilder/lesson-editor/standardsEditorRedux';

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
    width: 50,
    lineHeight: '30px'
  }
};

class StandardsEditor extends Component {
  static propTypes = {
    // provided by redux
    standards: PropTypes.arrayOf(PropTypes.object).isRequired,
    removeStandard: PropTypes.func.isRequired
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
            style: {width: '63%'}
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
            style: {width: '7%'}
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
    this.props.removeStandard(frameworkShortcode, shortcode);
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

export const UnconnectedStandardsEditor = StandardsEditor;

export default connect(
  state => ({
    standards: state.standards
  }),
  {
    removeStandard
  }
)(StandardsEditor);
