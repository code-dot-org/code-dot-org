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
import experiments from '../../util/experiments';

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
    height: '100%',
    minWidth: MIN_TABLE_WIDTH,
    maxWidth: '100%',
    paddingLeft: experiments.isEnabled(experiments.APPLAB_DATASETS)
      ? '8px'
      : '0px'
  },
  table: {
    minWidth: MIN_TABLE_WIDTH
  },
  tableWrapper: {
    flexGrow: 1,
    overflow: 'scroll'
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
    // "if all of the keys are integers, and more than half of the keys between 0 and
    // the maximum key in the object have non-empty values, then Firebase will render
    // it as an array."
    // https://firebase.googleblog.com/2014/04/best-practices-arrays-in-firebase.html
    tableRecords: PropTypes.oneOfType([PropTypes.object, PropTypes.array])
      .isRequired,
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
    // Cast Array to Object
    const tableRecords = Object.assign({}, this.props.tableRecords);
    for (const id in tableRecords) {
      records.push(JSON.parse(tableRecords[id]));
    }
    return JSON.stringify(records, null, 2);
  }

  render() {
    if (this.props.view !== DataView.TABLE) {
      return null;
    }
    const debugDataStyle = [
      dataStyles.debugData,
      {
        display: this.state.showDebugView ? '' : 'none'
      }
    ];
    const readOnly =
      this.props.tableListMap[this.props.tableName] === tableType.SHARED;

    return (
      <div id="dataTable" style={styles.container} className="inline-flex">
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

export default connect(
  state => ({
    view: state.data.view,
    tableColumns: state.data.tableColumns || [],
    tableRecords: state.data.tableRecords || {},
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
