import PropTypes from 'prop-types';
import Radium from 'radium';
import React from 'react';
import color from '../../util/color';
import msg from '@cdo/locale';
import AddTableListRow from './AddTableListRow';
import EditTableListRow from './EditTableListRow';
import EditKeyRow from './EditKeyRow';
import AddKeyRow from './AddKeyRow';
import * as dataStyles from './dataStyles';
import {connect} from 'react-redux';
import {changeView, showWarning} from '../redux/data';
import {DataView} from '../constants';

const tableWidth = 400;
const buttonColumnWidth = 124;
const tabHeight = 35;
const borderColor = color.lighter_gray;
const bgColor = color.lightest_gray;
const baseTabStyle = {
  borderColor: borderColor,
  borderStyle: 'solid',
  boxSizing: 'border-box',
  height: tabHeight,
  padding: '0 10px'
};
const styles = {
  activeTab: Object.assign({}, baseTabStyle, {
    backgroundColor: bgColor,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    float: 'left'
  }),
  inactiveTab: Object.assign({}, baseTabStyle, {
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 0,
    float: 'left'
  }),
  // This tab should fill the remaining horizontal space.
  emptyTab: Object.assign({}, baseTabStyle, {
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 1,
    borderLeftWidth: 0,
    width: '100%'
  }),
  workspaceDescription: {
    height: 28,
    overflow: 'hidden'
  },
  workspaceDescriptionText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  workspaceTabs: {
    borderColor: borderColor,
    borderStyle: 'solid',
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 1
  },
  tabLabel: {
    lineHeight: tabHeight + 'px',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
    userSelect: 'none'
  },
  workspaceBody: {
    height: 'calc(100% - 83px)',
    padding: '10px 10px 10px 0',
    borderColor: borderColor,
    borderStyle: 'solid',
    borderTopWidth: 0,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    backgroundColor: bgColor
  },
  activeBody: {
    height: '100%',
    overflowY: 'auto',
    padding: '10px',
    width: '100%'
  },
  inactiveBody: {
    display: 'none',
    height: '100%',
    overflowY: 'auto'
  }
};

class DataBrowser extends React.Component {
  static propTypes = {
    onTableAdd: PropTypes.func.isRequired,
    // from redux state
    tableListMap: PropTypes.object.isRequired,
    view: PropTypes.oneOf(Object.keys(DataView)),
    keyValueData: PropTypes.oneOfType([PropTypes.object, PropTypes.array])
      .isRequired,

    // from redux dispatch
    onShowWarning: PropTypes.func.isRequired,
    onViewChange: PropTypes.func.isRequired
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
        <div id="dataBrowserTabs" style={styles.workspaceTabs}>
          <div
            id="dataTablesTab"
            style={
              this.state.selectedTab === TabType.DATA_TABLES
                ? styles.activeTab
                : styles.inactiveTab
            }
            onClick={this.handleTabClick.bind(this, TabType.DATA_TABLES)}
          >
            <span style={styles.tabLabel}>{msg.dataTableHeader()}</span>
          </div>
          <div
            id="keyValuePairsTab"
            style={
              this.state.selectedTab === TabType.KEY_VALUE_PAIRS
                ? styles.activeTab
                : styles.inactiveTab
            }
            onClick={this.handleTabClick.bind(this, TabType.KEY_VALUE_PAIRS)}
          >
            <span style={styles.tabLabel}>{msg.keyValuePairsHeader()}</span>
          </div>
          <div id="emptyTab" style={styles.emptyTab} />
        </div>
        <div id="dataBrowserBody" style={styles.workspaceBody}>
          <div
            id="dataTablesBody"
            style={
              this.state.selectedTab === TabType.DATA_TABLES
                ? styles.activeBody
                : styles.inactiveBody
            }
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
                  <th style={dataStyles.headerCell}>
                    {msg.dataTableNamePlaceholder()}
                  </th>
                  <th style={dataStyles.headerCell}>{msg.actions()}</th>
                </tr>
                {Object.keys(this.props.tableListMap).map(tableName => (
                  <EditTableListRow
                    key={tableName}
                    tableName={tableName}
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
            style={
              this.state.selectedTab === TabType.KEY_VALUE_PAIRS
                ? styles.activeBody
                : styles.inactiveBody
            }
          >
            <table>
              <tbody>
                <tr>
                  <th style={dataStyles.headerCell}>Key</th>
                  <th style={dataStyles.headerCell}>Value</th>
                  <th style={dataStyles.headerCell}>Actions</th>
                </tr>

                <AddKeyRow onShowWarning={this.props.onShowWarning} />

                {Object.keys(this.props.keyValueData).map(key => (
                  <EditKeyRow
                    key={key}
                    keyName={key}
                    value={JSON.parse(this.props.keyValueData[key])}
                  />
                ))}
              </tbody>
            </table>
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
  KEY_VALUE_PAIRS: 'keyValuePairs'
};
DataBrowser.TabType = TabType;

export default connect(
  state => ({
    view: state.data.view,
    tableListMap: state.data.tableListMap || {},
    keyValueData: state.data.keyValueData || {}
  }),
  dispatch => ({
    onShowWarning(warningMsg, warningTitle) {
      dispatch(showWarning(warningMsg, warningTitle));
    },
    onViewChange(view, tableName) {
      dispatch(changeView(view, tableName));
    }
  })
)(Radium(DataBrowser));
