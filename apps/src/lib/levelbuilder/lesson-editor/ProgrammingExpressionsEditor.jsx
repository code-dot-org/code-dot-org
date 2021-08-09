import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {
  programmingExpressionShape,
  programmingEnvironmentShape
} from '@cdo/apps/lib/levelbuilder/shapes';
import color from '@cdo/apps/util/color';
import Dialog from '@cdo/apps/templates/Dialog';
import {connect} from 'react-redux';
import {
  addProgrammingExpression,
  removeProgrammingExpression
} from '@cdo/apps/lib/levelbuilder/lesson-editor/programmingExpressionsEditorRedux';
import * as Table from 'reactabular-table';
import {lessonEditorTableStyles} from './TableConstants';
import Button from '@cdo/apps/templates/Button';
import FindProgrammingExpressionDialog from '@cdo/apps/lib/levelbuilder/lesson-editor/FindProgrammingExpressionDialog';

class ProgrammingExpressionsEditor extends Component {
  static propTypes = {
    // Provided by redux
    programmingEnvironments: PropTypes.arrayOf(programmingEnvironmentShape)
      .isRequired,
    programmingExpressions: PropTypes.arrayOf(programmingExpressionShape)
      .isRequired,
    addProgrammingExpression: PropTypes.func.isRequired,
    removeProgrammingExpression: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      confirmRemovalDialogOpen: false,
      programmingExpressionForRemoval: null,
      addProgrammingExpressionOpen: false
    };
  }

  actionsCellFormatter = (actions, {rowData}) => {
    return (
      <div style={styles.actionsColumn}>
        <div
          style={styles.remove}
          className="unit-test-remove-programming-expression"
          onMouseDown={() =>
            this.setState({
              confirmRemovalDialogOpen: true,
              programmingExpressionForRemoval: rowData
            })
          }
        >
          <i className="fa fa-trash" />
        </div>
      </div>
    );
  };

  getColumns() {
    return [
      {
        property: 'name',
        header: {
          label: 'Name',
          props: {
            style: {width: '30%'}
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
        property: 'programmingEnvironmentName',
        header: {
          label: 'Programming Environment',
          props: {
            style: {width: '30%'}
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
        property: 'category',
        header: {
          label: 'Category',
          props: {
            style: {width: '30%'}
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

  handleRemoveProgrammingExpressionDialogClose = () => {
    this.setState({
      confirmRemovalDialogOpen: false,
      programmingExpressionForRemoval: null
    });
  };

  handleRemoveProgrammingExpressionConfirm = () => {
    this.props.removeProgrammingExpression(
      this.state.programmingExpressionForRemoval.id
    );
    this.handleRemoveProgrammingExpressionDialogClose();
  };

  handleOpenAddProgrammingExpression = event => {
    // Prevents button from trigger save
    event.preventDefault();
    this.setState({addProgrammingExpressionOpen: true});
  };

  handleCloseAddProgrammingExpression = programmingExpression => {
    this.setState(
      {addProgrammingExpressionOpen: false},
      this.props.addProgrammingExpression(programmingExpression)
    );
  };

  render() {
    const columns = this.getColumns();
    return (
      <div>
        {this.state.confirmRemovalDialogOpen && (
          <Dialog
            body={`Are you sure you want to remove the programming expression "${
              this.state.programmingExpressionForRemoval.name
            }" from this lesson?`}
            cancelText="Cancel"
            confirmText="Delete"
            confirmType="danger"
            isOpen={this.state.confirmRemovalDialogOpen}
            handleClose={this.handleRemoveProgrammingExpressionDialogClose}
            onCancel={this.handleRemoveProgrammingExpressionDialogClose}
            onConfirm={this.handleRemoveProgrammingExpressionConfirm}
          />
        )}
        <Table.Provider columns={columns} style={{width: '100%'}}>
          <Table.Header />
          <Table.Body rows={this.props.programmingExpressions} rowKey="id" />
        </Table.Provider>
        <Button
          text={'Add Introduced Code'}
          onClick={this.handleOpenAddProgrammingExpression}
          color={Button.ButtonColor.orange}
        />
        <FindProgrammingExpressionDialog
          isOpen={this.state.addProgrammingExpressionOpen}
          handleConfirm={this.handleCloseAddProgrammingExpression}
          handleClose={() =>
            this.setState({addProgrammingExpressionOpen: false})
          }
        />
      </div>
    );
  }
}

const styles = {
  search: {
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
    width: '100%',
    lineHeight: '30px'
  },
  dropdown: {
    width: '100%'
  }
};

export const UnconnectedProgrammingExpressionsEditor = ProgrammingExpressionsEditor;

export default connect(
  state => ({
    programmingExpressions: state.programmingExpressions,
    programmingEnvironments: state.programmingEnvironments
  }),
  {
    addProgrammingExpression,
    removeProgrammingExpression
  }
)(ProgrammingExpressionsEditor);
