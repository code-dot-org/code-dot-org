/**
 * @overview Component for detailed view of a data table.
 */
import TableControls from './TableControls';
import {DataView, WarningType} from '../constants';
import DataTable from './DataTable';
import FirebaseStorage from '../firebaseStorage';
import FontAwesome from '../../templates/FontAwesome';
import PropTypes from 'prop-types';
import Radium from 'radium';
import React from 'react';
import {changeView, showWarning, tableType} from '../redux/data';
import * as dataStyles from './dataStyles';
import color from '../../util/color';
import {connect} from 'react-redux';

const MIN_TABLE_WIDTH = 600;

const styles = {
  addColumnHeader: [
    dataStyles.headerCell,
    {
      width: 19
    }
  ],
  container: {
    flexDirection: 'column',
    height: '99%',
    minWidth: MIN_TABLE_WIDTH,
    maxWidth: '99%',
    paddingLeft: 8
  },
  table: {
    minWidth: MIN_TABLE_WIDTH
  },
  pagination: {
    float: 'right',
    display: 'inline',
    marginTop: 10
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
  showDebugView: false
};

class DataTableView extends React.Component {
  static propTypes = {
    // from redux state
    tableColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
    tableName: PropTypes.string.isRequired,
    tableListMap: PropTypes.object.isRequired,
    tableRecords: PropTypes.array.isRequired,
    view: PropTypes.oneOf(Object.keys(DataView)),

    // from redux dispatch
    onShowWarning: PropTypes.func.isRequired,
    onViewChange: PropTypes.func.isRequired
  };

  state = {...INITIAL_STATE};

  componentWillReceiveProps(nextProps) {
    // Forget about new columns or editing columns when switching between tables.
    if (this.props.tableName !== nextProps.tableName) {
      this.setState(INITIAL_STATE);
    }
  }

  importCsv = (csvData, onComplete) => {
    FirebaseStorage.importCsv(
      this.props.tableName,
      csvData,
      () => {
        this.setState(INITIAL_STATE);
        onComplete();
      },
      err => {
        if (err.type === WarningType.IMPORT_FAILED) {
          this.props.onShowWarning(err.msg);
        } else {
          console.warn(err.msg ? err.msg : err);
        }
        onComplete();
      }
    );
  };

  exportCsv = () => {
    const isSharedTable =
      this.props.tableListMap[this.props.tableName] === tableType.SHARED;
    const tableName = encodeURIComponent(this.props.tableName);
    const channelId = isSharedTable ? 'shared' : Applab.channelId;
    location.href = `/v3/export-firebase-tables/${channelId}/${tableName}`;
  };

  /** Delete all rows, but preserve the columns. */
  clearTable = () => {
    FirebaseStorage.clearTable(
      this.props.tableName,
      () => {},
      msg => console.warn(msg)
    );
  };

  toggleDebugView = () => {
    const showDebugView = !this.state.showDebugView;
    this.setState({showDebugView});
  };

  getTableJson() {
    const records = [];
    this.props.tableRecords.forEach(record => records.push(JSON.parse(record)));
    return JSON.stringify(records, null, 2);
  }

  render() {
    const visible = DataView.TABLE === this.props.view;
    const containerStyle = [
      styles.container,
      {
        display: visible ? '' : 'none'
      }
    ];
    const debugDataStyle = [
      dataStyles.debugData,
      {
        display: this.state.showDebugView ? '' : 'none'
      }
    ];
    const readOnly =
      this.props.tableListMap[this.props.tableName] === tableType.SHARED;

    return (
      <div id="dataTable" style={containerStyle} className="inline-flex">
        <div style={dataStyles.viewHeader}>
          <span style={dataStyles.backLink}>
            <a
              id="tableBackToOverview"
              style={dataStyles.link}
              onClick={() => this.props.onViewChange(DataView.OVERVIEW)}
            >
              <FontAwesome icon="arrow-circle-left" />
              &nbsp;Back to data
            </a>
          </span>
          <span style={dataStyles.debugLink}>
            <a
              id="uitest-tableDebugLink"
              style={dataStyles.link}
              onClick={this.toggleDebugView}
            >
              {this.state.showDebugView ? 'Table view' : 'Debug view'}
            </a>
          </span>
        </div>
        <TableControls
          clearTable={this.clearTable}
          importCsv={this.importCsv}
          exportCsv={this.exportCsv}
          tableName={this.props.tableName}
          readOnly={readOnly}
        />
        <div style={debugDataStyle}>{this.getTableJson()}</div>
        {!this.state.showDebugView && <DataTable readOnly={readOnly} />}
      </div>
    );
  }
}

export const UnconnectedDataTableView = DataTableView;
export default connect(
  state => ({
    view: state.data.view,
    tableColumns: state.data.tableColumns || [],
    tableRecords: state.data.tableRecords || [],
    tableName: state.data.tableName || '',
    tableListMap: state.data.tableListMap || {}
  }),
  dispatch => ({
    onShowWarning(warningMsg, warningTitle) {
      dispatch(showWarning(warningMsg, warningTitle));
    },
    onViewChange(view) {
      dispatch(changeView(view));
    }
  })
)(Radium(DataTableView));
