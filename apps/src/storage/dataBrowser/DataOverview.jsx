/**
 * @overview Component containing a link to edit key/value pairs, a list of
 * existing data tables with controls to edit/delete, and a control to add
 * a new data table.
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {DataView, WarningType} from '../constants';
import {changeView, showWarning} from '../redux/data';
import {storageBackend} from '../storage';

import DataBrowser from './DataBrowser';
import DataLibraryPane from './DataLibraryPane';
import {refreshCurrentDataView} from './loadDataForView';

import style from './data-overview.module.scss';

class DataOverview extends React.Component {
  static propTypes = {
    // from redux state
    tableListMap: PropTypes.object.isRequired,
    view: PropTypes.oneOf(Object.keys(DataView)),

    // from redux dispatch
    onShowWarning: PropTypes.func.isRequired,
    onViewChange: PropTypes.func.isRequired,
  };

  onTableAdd = tableName => {
    storageBackend().createTable(
      tableName,
      () => {
        refreshCurrentDataView();
        this.props.onViewChange(DataView.TABLE, tableName);
      },
      error => {
        if (
          error.type &&
          (error.type === WarningType.MAX_TABLES_EXCEEDED ||
            error.type === WarningType.TABLE_NAME_INVALID ||
            error.type === WarningType.TABLE_RENAMED ||
            error.type === WarningType.DUPLICATE_TABLE_NAME)
        ) {
          this.props.onShowWarning(error.msg);
        } else {
          console.warn(error.msg ? error.msg : error);
        }
      }
    );
  };

  render() {
    return (
      <div
        id="data-library-container"
        className={classNames(
          style.container,
          (this.props.view === DataView.OVERVIEW ||
            this.props.view === DataView.PROPERTIES) &&
            style.containerDisplay
        )}
      >
        <DataLibraryPane />
        <div id="data-browser" className={style.dataBrowser}>
          <DataBrowser onTableAdd={this.onTableAdd} />
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({
    view: state.data.view,
    tableListMap: state.data.tableListMap || {},
  }),
  dispatch => ({
    onShowWarning(warningMsg, warningTitle) {
      dispatch(showWarning(warningMsg, warningTitle));
    },
    onViewChange(view, tableName) {
      dispatch(changeView(view, tableName));
    },
  })
)(DataOverview);
