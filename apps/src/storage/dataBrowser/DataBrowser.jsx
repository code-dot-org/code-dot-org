import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import msg from '@cdo/locale';

import {DataView} from '../constants';
import {changeView, showWarning} from '../redux/data';

import AddTableListRow from './AddTableListRow';
import EditTableListRow from './EditTableListRow';
import KVPairs from './KVPairs';

import style from './data-browser.module.scss';
import dataStyles from './data-styles.module.scss';

const tableWidth = 400;
const buttonColumnWidth = 124;

class DataBrowser extends React.Component {
  static propTypes = {
    onTableAdd: PropTypes.func.isRequired,
    // from redux state
    tableListMap: PropTypes.object.isRequired,
    view: PropTypes.oneOf(Object.keys(DataView)),

    // from redux dispatch
    onShowWarning: PropTypes.func.isRequired,
    onViewChange: PropTypes.func.isRequired,
  };

  state = {selectedTab: TabType.DATA_TABLES};

  handleTabClick = newTab => {
    this.setState({selectedTab: newTab});
    if (newTab === TabType.DATA_TABLES) {
      this.props.onViewChange(DataView.OVERVIEW);
    }
    if (newTab === TabType.KEY_VALUE_PAIRS) {
      this.props.onViewChange(DataView.PROPERTIES);
    }
  };

  render() {
    return (
      <div style={{height: '100%'}}>
        <div id="dataBrowserTabs" className={style.workspaceTabs}>
          <div
            id="dataTablesTab"
            className={classNames(
              style.tab,
              this.state.selectedTab === TabType.DATA_TABLES
                ? style.tabActive
                : style.tabInactive
            )}
            onClick={this.handleTabClick.bind(this, TabType.DATA_TABLES)}
          >
            <span className={style.tabLabel}>{msg.dataTableHeader()}</span>
          </div>
          <div
            id="keyValuePairsTab"
            className={classNames(
              style.tab,
              this.state.selectedTab === TabType.KEY_VALUE_PAIRS
                ? style.tabActive
                : style.tabInactive
            )}
            onClick={this.handleTabClick.bind(this, TabType.KEY_VALUE_PAIRS)}
          >
            <span className={style.tabLabel}>{msg.keyValuePairsHeader()}</span>
          </div>
          <div
            id="emptyTab"
            className={classNames(style.tab, style.tabEmpty)}
          />
        </div>
        <div id="dataBrowserBody" className={style.workspaceBody}>
          <div
            id="dataTablesBody"
            className={classNames(
              this.state.selectedTab === TabType.DATA_TABLES
                ? style.activeBody
                : style.inactiveBody
            )}
          >
            <span> {msg.createTableHeader()} </span>
            <table>
              <colgroup>
                <col width={tableWidth - buttonColumnWidth} />
                <col width={buttonColumnWidth} />
              </colgroup>
              <tbody>
                <AddTableListRow onTableAdd={this.props.onTableAdd} />
              </tbody>
            </table>
            <br />
            <table>
              <colgroup>
                <col width={tableWidth - buttonColumnWidth} />
                <col width={buttonColumnWidth} />
              </colgroup>
              <tbody>
                <tr>
                  <th className={dataStyles.headerCell}>
                    {msg.dataTableNamePlaceholder()}
                  </th>
                  <th className={dataStyles.headerCell}>{msg.actions()}</th>
                </tr>
                {Object.keys(this.props.tableListMap).map(tableName => (
                  <EditTableListRow
                    key={tableName}
                    tableName={tableName}
                    tableType={this.props.tableListMap[tableName]}
                    onViewChange={() =>
                      this.props.onViewChange(DataView.TABLE, tableName)
                    }
                  />
                ))}
              </tbody>
            </table>
          </div>
          <div
            id="keyValuePairsBody"
            className={classNames(
              this.state.selectedTab === TabType.KEY_VALUE_PAIRS
                ? style.activeBody
                : style.inactiveBody
            )}
          >
            <KVPairs />
          </div>
        </div>
      </div>
    );
  }
}

/**
 * @readonly
 * @enum {string}
 */
const TabType = {
  DATA_TABLES: 'dataTables',
  KEY_VALUE_PAIRS: 'keyValuePairs',
};
DataBrowser.TabType = TabType;

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
)(DataBrowser);
