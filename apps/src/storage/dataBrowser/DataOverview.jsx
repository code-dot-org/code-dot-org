/**
 * @overview Component containing a link to edit key/value pairs, a list of
 * existing data tables with controls to edit/delete, and a control to add
 * a new data table.
 */
import AddTableListRow from './AddTableListRow';
import {DataView} from '../constants';
import EditLink from './EditLink';
import EditTableListRow from './EditTableListRow';
import FirebaseStorage from '../firebaseStorage';
import PropTypes from 'prop-types';
import Radium from 'radium';
import React from 'react';
import msg from '@cdo/locale';
import {changeView, showWarning} from '../redux/data';
import {connect} from 'react-redux';
import * as dataStyles from './dataStyles';
import DataBrowser from './DataBrowser';
import DataLibraryPane from './DataLibraryPane';
import experiments from '../../util/experiments';
import color from '../../util/color';

const tableWidth = 400;
const buttonColumnWidth = 90;

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
          typeof error === 'string' &&
          (error.includes('maximum number of tables') ||
            error.includes('The table name is invalid') ||
            error.includes('The table was renamed'))
        ) {
          this.props.onShowWarning(error);
        } else {
          console.warn(error);
        }
      }
    );
  };

  render() {
    const visible = DataView.OVERVIEW === this.props.view;

    if (experiments.isEnabled(experiments.APPLAB_DATASETS)) {
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
    } else {
      return (
        <div id="dataOverview" style={{display: visible ? 'block' : 'none'}}>
          <h4>Data</h4>

          <h5>{msg.dataTabExplanation()}</h5>
          <br />
          <p>{msg.keyValueCaption()}</p>
          <table style={styles.table}>
            <tbody>
              <tr style={dataStyles.row}>
                <td style={dataStyles.cell}>
                  <EditLink
                    name={msg.keyValuePairLink()}
                    onClick={() => this.props.onViewChange(DataView.PROPERTIES)}
                  />
                </td>
              </tr>
            </tbody>
          </table>

          <br />
          <p>{msg.dataTableCaption()}</p>
          <table style={styles.table}>
            <colgroup>
              <col width={tableWidth - buttonColumnWidth} />
              <col width={buttonColumnWidth} />
            </colgroup>
            <tbody>
              {Object.keys(this.props.tableListMap).map(tableName => (
                <EditTableListRow
                  key={tableName}
                  tableName={tableName}
                  onViewChange={this.props.onViewChange}
                />
              ))}
              <AddTableListRow onTableAdd={this.onTableAdd} />
            </tbody>
          </table>
        </div>
      );
    }
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
