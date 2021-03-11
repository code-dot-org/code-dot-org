import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {programmingExpressionShape} from '@cdo/apps/lib/levelbuilder/shapes';
import color from '@cdo/apps/util/color';
import SearchBox from './SearchBox';
import Dialog from '@cdo/apps/templates/Dialog';
import {connect} from 'react-redux';
import {
  addProgrammingExpression,
  removeProgrammingExpression
} from '@cdo/apps/lib/levelbuilder/lesson-editor/programmingExpressionsEditorRedux';
import * as Table from 'reactabular-table';
import {lessonEditorTableStyles} from './TableConstants';

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
    width: '50%',
    lineHeight: '30px'
  }
};

class ProgrammingExpressionsEditor extends Component {
  static propTypes = {
    // Provided by redux
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
      programmingEnvironmentId: null
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
        property: 'programming_environment',
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

  constructProgrammingExpressionOption = programmingExpression => ({
    value: programmingExpression.key,
    label: `${programmingExpression.name} - ${
      programmingExpression.programmingEnvironmentName
    }`,
    programmingExpression
  });

  afterProgrammingExpressionSave = programmingExpression => {
    this.props.addProgrammingExpression(programmingExpression);
  };

  constructSearchOptions = json => {
    const programmingExpressionKeysAdded = this.props.programmingExpressions.map(
      programmingExpression => programmingExpression.key
    );
    const programmingExpressions = json
      .map(programmingExpression =>
        this.constructProgrammingExpressionOption(programmingExpression)
      )
      .filter(
        programmingExpression =>
          programmingExpressionKeysAdded.indexOf(
            programmingExpression.value
          ) === -1
      );
    return {options: programmingExpressions};
  };

  handleRemoveProgrammingExpressionDialogClose = () => {
    this.setState({
      confirmRemovalDialogOpen: false,
      programmingExpressionForRemoval: null
    });
  };

  handleRemoveProgrammingExpressionConfirm = () => {
    this.props.removeProgrammingExpression(
      this.state.programmingExpressionForRemoval.key
    );
    this.handleRemoveProgrammingExpressionDialogClose();
  };

  render() {
    const columns = this.getColumns();
    return (
      <div>
        {this.state.confirmRemovalDialogOpen && (
          <Dialog
            body={`Are you sure you want to remove the programming expression "${
              this.state.programmingExpressionForRemoval.word
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
        <div style={styles.search}>
          <label>
            <strong>Select a programming expression to add</strong>
          </label>
          <SearchBox
            onSearchSelect={e =>
              this.props.addProgrammingExpression(e.programmingExpression)
            }
            additionalQueryParams={{
              programmingEnvironmentId: this.state.programmingEnvironmentId
            }}
            searchUrl={'programmingexpressionsearch'}
            constructOptions={this.constructSearchOptions}
          />
        </div>
        <Table.Provider columns={columns} style={{width: '100%'}}>
          <Table.Header />
          <Table.Body rows={this.props.programmingExpressions} rowKey="key" />
        </Table.Provider>
      </div>
    );
  }
}

export const UnconnectedProgrammingExpressionsEditor = ProgrammingExpressionsEditor;

export default connect(
  state => ({
    programmingExpressions: state.programmingExpressions
  }),
  {
    addProgrammingExpression,
    removeProgrammingExpression
  }
)(ProgrammingExpressionsEditor);
