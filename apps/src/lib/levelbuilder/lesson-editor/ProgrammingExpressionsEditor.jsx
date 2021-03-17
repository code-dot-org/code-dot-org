import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {
  programmingExpressionShape,
  programmingEnvironmentShape
} from '@cdo/apps/lib/levelbuilder/shapes';
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
    width: '100%',
    lineHeight: '30px'
  },
  dropdown: {
    width: '100%'
  }
};

class ProgrammingExpressionsEditor extends Component {
  static propTypes = {
    programmingEnvironments: PropTypes.arrayOf(programmingEnvironmentShape)
      .isRequired,

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
      programmingEnvironmentId: 0
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

  constructProgrammingExpressionOption = programmingExpression => ({
    value: programmingExpression.id,
    label: `${programmingExpression.name} - ${
      programmingExpression.programmingEnvironmentName
    } - ${programmingExpression.category}`,
    programmingExpression
  });

  constructSearchOptions = json => {
    const programmingExpressionKeysAdded = this.props.programmingExpressions.map(
      programmingExpression => programmingExpression.id
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
      this.state.programmingExpressionForRemoval.id
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
        <div style={styles.search}>
          <label>
            <strong>Select an IDE</strong>
          </label>
          <select
            style={styles.dropdown}
            value={this.state.programmingEnvironmentId}
            onChange={e =>
              this.setState({programmingEnvironmentId: e.target.value})
            }
          >
            <option key={'empty-option'} value={0} />
            {this.props.programmingEnvironments.map(environment => (
              <option key={environment.id} value={environment.id}>
                {environment.name}
              </option>
            ))}
          </select>
        </div>
        <div style={styles.search}>
          <label>
            <strong>Select a programming expression to add</strong>
          </label>
          <SearchBox
            onSearchSelect={e =>
              this.props.addProgrammingExpression(e.programmingExpression)
            }
            additionalQueryParams={
              this.state.programmingEnvironmentId > 0
                ? {
                    programmingEnvironmentId: this.state
                      .programmingEnvironmentId
                  }
                : {}
            }
            searchUrl={'programmingexpressionsearch'}
            constructOptions={this.constructSearchOptions}
          />
        </div>
        <Table.Provider columns={columns} style={{width: '100%'}}>
          <Table.Header />
          <Table.Body rows={this.props.programmingExpressions} rowKey="id" />
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
