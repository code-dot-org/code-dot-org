/**
 * @overview Component for displaying a data table.
 */
import AddTableRow from './AddTableRow';
import EditTableRow from './EditTableRow';
import ColumnHeader from './ColumnHeader';
import DataEntryError from './DataEntryError';
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
import {WarningType} from '../constants';

const MIN_TABLE_WIDTH = 600;
const MAX_ROWS_PER_PAGE = 500;

const INITIAL_STATE = {
  editingColumn: null,
  pendingAdd: false,
  // The old name of the column currently being renamed or deleted.
  pendingColumn: null,
  currentPage: 0,
  showError: false
};

class DataTable extends React.Component {
  static propTypes = {
    readOnly: PropTypes.bool,
    rowsPerPage: PropTypes.number,
    // from redux state
    tableColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
    tableName: PropTypes.string.isRequired,
    tableRecords: PropTypes.array.isRequired,

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

  showError = () => this.setState({showError: true});
  hideError = () => this.setState({showError: false});

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
    let i = this.props.tableColumns.length;
    while (this.props.tableColumns.includes(`column${i}`)) {
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
        err => {
          if (err.type === WarningType.CANNOT_CONVERT_COLUMN_TYPE) {
            this.props.onShowWarning(err.msg);
          } else {
            console.warn(err.msg ? err.msg : err);
          }
        }
      );
    }, 0);
  };

  onChangePageNumber = number => {
    this.setState({currentPage: number - 1});
  };

  getRowsForCurrentPage(rowsPerPage) {
    return this.props.tableRecords.slice(
      this.state.currentPage * rowsPerPage,
      (this.state.currentPage + 1) * rowsPerPage
    );
  }

  render() {
    let columnNames = [...this.props.tableColumns];
    let editingColumn = this.state.editingColumn;

    let rowsPerPage = this.props.rowsPerPage || MAX_ROWS_PER_PAGE;
    let numPages = Math.max(
      1,
      Math.ceil(this.props.tableRecords.length / rowsPerPage)
    );
    let rows = this.getRowsForCurrentPage(rowsPerPage);

    // Always show at least one column.
    if (columnNames.length === 1) {
      editingColumn = this.getNextColumnName();
      columnNames.push(editingColumn);
    }

    return (
      <div>
        <DataEntryError isVisible={this.state.showError} />
        <div style={{overflow: 'auto', height: 'calc(100vh - 300px)'}}>
          <table style={styles.table} className="uitest-data-table-content">
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
                    readOnly={this.props.readOnly}
                    renameColumn={this.renameColumn}
                  />
                ))}
                {!this.props.readOnly && (
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
                )}
                {!this.props.readOnly && (
                  <th style={dataStyles.headerCell}>Actions</th>
                )}
              </tr>

              {!this.props.readOnly && (
                <AddTableRow
                  tableName={this.props.tableName}
                  columnNames={columnNames}
                  showError={this.showError}
                  hideError={this.hideError}
                />
              )}

              {Object.keys(rows).map(id => (
                <EditTableRow
                  columnNames={columnNames}
                  tableName={this.props.tableName}
                  record={JSON.parse(rows[id])}
                  key={id}
                  readOnly={this.props.readOnly}
                  showError={this.showError}
                  hideError={this.hideError}
                />
              ))}
            </tbody>
          </table>
        </div>

        {numPages > 1 && (
          <div>
            <PaginationWrapper
              totalPages={numPages}
              currentPage={this.state.currentPage + 1}
              onChangePage={this.onChangePageNumber}
              label={msg.paginationLabel()}
            />
          </div>
        )}
      </div>
    );
  }
}

const styles = {
  addColumnHeader: [
    dataStyles.headerCell,
    {
      width: 19
    }
  ],
  table: {
    minWidth: MIN_TABLE_WIDTH
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

export default connect(
  state => ({
    tableColumns: state.data.tableColumns || [],
    tableRecords: state.data.tableRecords || [],
    tableName: state.data.tableName || ''
  }),
  dispatch => ({
    onShowWarning(warningMsg, warningTitle) {
      dispatch(showWarning(warningMsg, warningTitle));
    }
  })
)(Radium(DataTable));
