/**
 * @overview Component for displaying a data table.
 */
import AddTableRow from './AddTableRow';
import EditTableRow from './EditTableRow';
import ColumnHeader from './ColumnHeader';
import FirebaseStorage from '../firebaseStorage';
import FontAwesome from '../../templates/FontAwesome';
import PropTypes from 'prop-types';
import Radium from 'radium';
import React from 'react';
import {showWarning} from '../redux/data';
import * as dataStyles from './dataStyles';
import color from '../../util/color';
import {connect} from 'react-redux';
import PaginationWrapper from '../../templates/PaginationWrapper';
import msg from '@cdo/locale';

const MIN_TABLE_WIDTH = 600;
const MAX_ROWS_PER_PAGE = 500;

const styles = {
  addColumnHeader: [
    dataStyles.headerCell,
    {
      width: 19
    }
  ],
  table: {
    minWidth: MIN_TABLE_WIDTH,
    overflow: 'scroll'
  },
  pagination: {
    overflow: 'auto'
  },
  plusIcon: {
    alignItems: 'center',
    borderRadius: 2,
    backgroundColor: 'white',
    color: color.teal,
    cursor: 'pointer',
    display: 'inline-flex',
    height: 18,
    justifyContent: 'center',
    width: 18
  }
};

const INITIAL_STATE = {
  editingColumn: null,
  pendingAdd: false,
  // The old name of the column currently being renamed or deleted.
  pendingColumn: null,
  currentPage: 0
};

class DataTable extends React.Component {
  static propTypes = {
    getColumnNames: PropTypes.func.isRequired,
    // from redux state
    tableColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
    tableName: PropTypes.string.isRequired,
    // "if all of the keys are integers, and more than half of the keys between 0 and
    // the maximum key in the object have non-empty values, then Firebase will render
    // it as an array."
    // https://firebase.googleblog.com/2014/04/best-practices-arrays-in-firebase.html
    tableRecords: PropTypes.oneOfType([PropTypes.object, PropTypes.array])
      .isRequired,

    // from redux dispatch
    onShowWarning: PropTypes.func.isRequired
  };

  state = {...INITIAL_STATE};

  componentWillReceiveProps(nextProps) {
    // Forget about new columns or editing columns when switching between tables.
    if (this.props.tableName !== nextProps.tableName) {
      this.setState(INITIAL_STATE);
    }
  }

  addColumn = () => {
    const columnName = this.getNextColumnName();
    this.setState({pendingAdd: true});
    // Show the spinner icon before updating the data.
    setTimeout(() => {
      FirebaseStorage.addColumn(
        this.props.tableName,
        columnName,
        () => {
          this.setState({
            editingColumn: columnName,
            pendingAdd: false
          });
        },
        msg => {
          console.warn(msg);
          this.resetColumnState();
        }
      );
    }, 0);
  };

  deleteColumn = columnToRemove => {
    this.setState({
      pendingColumn: columnToRemove
    });
    // Show the spinner icon before updating the data.
    setTimeout(() => {
      FirebaseStorage.deleteColumn(
        this.props.tableName,
        columnToRemove,
        this.resetColumnState,
        error => {
          console.warn(error);
          this.resetColumnState();
        }
      );
    }, 0);
  };

  /**
   * @param {string|null} columnName Column to edit, or null to not edit any column.
   */
  editColumn = columnName => this.setState({editingColumn: columnName});

  renameColumn = (oldName, newName) => {
    this.setState({
      editingColumn: null,
      pendingColumn: oldName
    });
    // Show the spinner icon before updating the data.
    setTimeout(() => {
      if (this.props.tableName) {
        FirebaseStorage.renameColumn(
          this.props.tableName,
          oldName,
          newName,
          this.resetColumnState,
          error => {
            console.warn(error);
            this.resetColumnState();
          }
        );
      } else {
        // We've navigated away before the column could be renamed.
        this.resetColumnState();
      }
    }, 0);
  };

  resetColumnState = () => {
    this.setState({
      editingColumn: null,
      pendingAdd: false,
      pendingColumn: null
    });
  };

  getNextColumnName() {
    const names = this.props.getColumnNames(
      this.props.tableRecords,
      this.props.tableColumns
    );
    let i = names.length;
    while (names.includes(`column${i}`)) {
      i++;
    }
    return `column${i}`;
  }

  coerceColumn = (columnName, columnType) => {
    this.setState({
      editingColumn: null,
      pendingColumn: columnName
    });
    // Show the spinner icon before updating the data.
    setTimeout(() => {
      FirebaseStorage.coerceColumn(
        this.props.tableName,
        columnName,
        columnType,
        this.resetColumnState,
        msg => {
          if (String(msg).includes('Not all values in column')) {
            this.props.onShowWarning(msg);
          } else {
            console.warn(msg);
          }
        }
      );
    }, 0);
  };

  onChangePageNumber = number => {
    this.setState({currentPage: number - 1});
  };

  getRowsForCurrentPage() {
    if (this.props.tableRecords['slice']) {
      return this.props.tableRecords.slice(
        this.state.currentPage * MAX_ROWS_PER_PAGE,
        (this.state.currentPage + 1) * MAX_ROWS_PER_PAGE
      );
    }
    return this.props.tableRecords;
  }

  render() {
    let columnNames = this.props.getColumnNames(
      this.props.tableRecords,
      this.props.tableColumns
    );
    let editingColumn = this.state.editingColumn;

    let numPages = Math.max(
      1,
      Math.ceil(Object.keys(this.props.tableRecords).length / MAX_ROWS_PER_PAGE)
    );
    let rows = this.getRowsForCurrentPage();

    // Always show at least one column.
    if (columnNames.length === 1) {
      editingColumn = this.getNextColumnName();
      columnNames.push(editingColumn);
    }

    return (
      <div>
        <div style={styles.pagination}>
          <PaginationWrapper
            totalPages={numPages}
            currentPage={this.state.currentPage + 1}
            onChangePage={this.onChangePageNumber}
            label={msg.paginationLabel()}
          />
        </div>
        <table style={styles.table}>
          <tbody>
            <tr>
              {columnNames.map(columnName => (
                <ColumnHeader
                  key={columnName}
                  coerceColumn={this.coerceColumn}
                  columnName={columnName}
                  columnNames={columnNames}
                  deleteColumn={this.deleteColumn}
                  editColumn={this.editColumn}
                  /* hide gear icon if an operation is pending on another column */
                  isEditable={
                    columnName !== 'id' &&
                    !(
                      this.state.pendingColumn &&
                      this.state.pendingColumn !== columnName
                    ) &&
                    !this.state.pendingAdd
                  }
                  isEditing={editingColumn === columnName}
                  isPending={this.state.pendingColumn === columnName}
                  renameColumn={this.renameColumn}
                />
              ))}
              <th style={styles.addColumnHeader}>
                {this.state.pendingAdd ? (
                  <FontAwesome icon="spinner" className="fa-spin" />
                ) : (
                  <FontAwesome
                    id="addColumnButton"
                    icon="plus"
                    style={styles.plusIcon}
                    onClick={this.addColumn}
                  />
                )}
              </th>
              <th style={dataStyles.headerCell}>Actions</th>
            </tr>

            <AddTableRow
              tableName={this.props.tableName}
              columnNames={columnNames}
            />

            {Object.keys(rows).map(id => (
              <EditTableRow
                columnNames={columnNames}
                tableName={this.props.tableName}
                record={JSON.parse(rows[id])}
                key={id}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default connect(
  state => ({
    tableColumns: state.data.tableColumns || [],
    tableRecords: state.data.tableRecords || {},
    tableName: state.data.tableName || ''
  }),
  dispatch => ({
    onShowWarning(warningMsg, warningTitle) {
      dispatch(showWarning(warningMsg, warningTitle));
    }
  })
)(Radium(DataTable));
