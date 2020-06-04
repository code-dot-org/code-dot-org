/**
 * @overview Component containing a link to edit key/value pairs, a list of
 * existing data tables with controls to edit/delete, and a control to add
 * a new data table.
 */
import {DataView, WarningType} from '../constants';
import FirebaseStorage from '../firebaseStorage';
import PropTypes from 'prop-types';
import Radium from 'radium';
import React from 'react';
import {changeView, showWarning} from '../redux/data';
import {connect} from 'react-redux';
import DataBrowser from './DataBrowser';
import DataLibraryPane from './DataLibraryPane';
import color from '../../util/color';

const tableWidth = 400;

const styles = {
  table: {
    width: tableWidth,
    marginTop: 10,
    marginBottom: 10
  },
  container: {
    position: 'absolute',
    width: '100%',
    top: 0,
    bottom: 0,
    backgroundColor: color.white
  },
  dataBrowser: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 270,
    right: 0,
    padding: 10
  }
};

class DataOverview extends React.Component {
  static propTypes = {
    // from redux state
    tableListMap: PropTypes.object.isRequired,
    view: PropTypes.oneOf(Object.keys(DataView)),

    // from redux dispatch
    onShowWarning: PropTypes.func.isRequired,
    onViewChange: PropTypes.func.isRequired
  };

  onTableAdd = tableName => {
    FirebaseStorage.createTable(
      tableName,
      () => this.props.onViewChange(DataView.TABLE, tableName),
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
    styles.container.display =
      this.props.view === DataView.OVERVIEW ||
      this.props.view === DataView.PROPERTIES
        ? 'block'
        : 'none';
    return (
      <div id="data-library-container" style={styles.container}>
        <DataLibraryPane />
        <div id="data-browser" style={styles.dataBrowser}>
          <DataBrowser onTableAdd={this.onTableAdd} />
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({
    view: state.data.view,
    tableListMap: state.data.tableListMap || {}
  }),
  dispatch => ({
    onShowWarning(warningMsg, warningTitle) {
      dispatch(showWarning(warningMsg, warningTitle));
    },
    onViewChange(view, tableName) {
      dispatch(changeView(view, tableName));
    }
  })
)(Radium(DataOverview));
