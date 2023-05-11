/**
 * @overview Component for detailed view of a data table.
 */
import TableControls from './TableControls';
import {DataView, WarningType} from '../constants';
import DataTable from './DataTable';
import FirebaseStorage from '../firebaseStorage';
import FontAwesome from '../../templates/FontAwesome';
import PropTypes from 'prop-types';
import React from 'react';
import {changeView, showWarning, tableType} from '../redux/data';
import dataStyles from './data-styles.module.scss';
import {connect} from 'react-redux';
import TableDescription from './TableDescription';
import classNames from 'classnames';
import style from './data-table-view.module.scss';
import msg from '@cdo/locale';

const INITIAL_STATE = {
  showDebugView: false,
};

class DataTableView extends React.Component {
  static propTypes = {
    // from redux state
    isRtl: PropTypes.bool.isRequired,
    tableColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
    tableName: PropTypes.string.isRequired,
    tableListMap: PropTypes.object.isRequired,
    tableRecords: PropTypes.array.isRequired,
    view: PropTypes.oneOf(Object.keys(DataView)),
    libraryManifest: PropTypes.object.isRequired,

    // from redux dispatch
    onShowWarning: PropTypes.func.isRequired,
    onViewChange: PropTypes.func.isRequired,
  };

  state = {...INITIAL_STATE};

  UNSAFE_componentWillReceiveProps(nextProps) {
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
    const {
      view,
      tableListMap,
      tableName,
      onViewChange,
      libraryManifest,
      isRtl,
    } = this.props;
    const visible = DataView.TABLE === view;
    const debugDataStyle = {
      ...{
        display: this.state.showDebugView ? '' : 'none',
      },
    };
    const readOnly = tableListMap[tableName] === tableType.SHARED;

    return (
      <div
        id="dataTable"
        className={classNames(
          style.container,
          visible ? '' : style.containerHidden
        )}
      >
        <div className={style.viewHeader}>
          <span className={style.backLink}>
            <a
              id="tableBackToOverview"
              className={dataStyles.link}
              onClick={() => onViewChange(DataView.OVERVIEW)}
            >
              <FontAwesome icon="arrow-circle-left" />
              &nbsp;{msg.backToData()}
            </a>
          </span>
          <span className={isRtl ? style.debugLinkRtl : style.debugLink}>
            <a
              id="uitest-tableDebugLink"
              className={dataStyles.link}
              onClick={this.toggleDebugView}
            >
              {this.state.showDebugView
                ? msg.dataTableTableView()
                : msg.dataTableDebugView()}
            </a>
          </span>
        </div>
        <TableControls
          isRtl={isRtl}
          clearTable={this.clearTable}
          importCsv={this.importCsv}
          exportCsv={this.exportCsv}
          tableName={tableName}
          readOnly={readOnly}
        />
        {libraryManifest.tables && (
          <TableDescription
            tableName={tableName}
            libraryTables={libraryManifest.tables}
          />
        )}
        <div className={style.debugData} style={debugDataStyle}>
          {this.getTableJson()}
        </div>
        {!this.state.showDebugView && <DataTable readOnly={readOnly} />}
      </div>
    );
  }
}

export const UnconnectedDataTableView = DataTableView;
export default connect(
  state => ({
    isRtl: state.isRtl,
    view: state.data.view,
    tableColumns: state.data.tableColumns || [],
    tableRecords: state.data.tableRecords || [],
    tableName: state.data.tableName || '',
    tableListMap: state.data.tableListMap || {},
    libraryManifest: state.data.libraryManifest || {},
  }),
  dispatch => ({
    onShowWarning(warningMsg, warningTitle) {
      dispatch(showWarning(warningMsg, warningTitle));
    },
    onViewChange(view) {
      dispatch(changeView(view));
    },
  })
)(DataTableView);
