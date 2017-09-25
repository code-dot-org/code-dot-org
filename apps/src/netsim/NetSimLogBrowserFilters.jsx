/** @file Filtering controls for Log Browser modal */
import React, {PropTypes} from 'react';

const style = {
  clear: {
    clear: 'both'
  },
  logBrowserFilters: {
    marginBottom: 12
  },
  dropdown: {
    margin: '5px 5px 0 5px',
    padding: 0,
    height: 22,
    lineHeight: 20,
    verticalAlign: 'middle',
    fontSize: 14
  }
};

/**
 * Filter controls for Log Browser Modal
 */
export default class NetSimLogBrowserFilters extends React.Component {
  static propTypes = {
    i18n: PropTypes.objectOf(PropTypes.func).isRequired,
    canSetRouterLogMode: PropTypes.bool,
    isAllRouterLogMode: PropTypes.bool,
    setRouterLogMode: PropTypes.func.isRequired,
    localAddress: PropTypes.string,
    currentTrafficFilter: PropTypes.string.isRequired,
    setTrafficFilter: PropTypes.func.isRequired,
    currentSentByFilter: PropTypes.string.isRequired,
    setSentByFilter: PropTypes.func.isRequired,
    teacherView: PropTypes.bool,
    senderNames: PropTypes.arrayOf(PropTypes.string).isRequired
  };

  render() {
    return (
      <div style={style.logBrowserFilters}>
        {this.props.teacherView &&
          <SentByDropdown
            i18n={this.props.i18n}
            currentSentByFilter={this.props.currentSentByFilter}
            setSentByFilter={this.props.setSentByFilter}
            senderNames={this.props.senderNames}
          />}
        {this.props.canSetRouterLogMode &&
          <RouterLogModeDropdown
            i18n={this.props.i18n}
            isAllRouterLogMode={this.props.isAllRouterLogMode}
            setRouterLogMode={this.props.setRouterLogMode}
          />}
        {this.props.localAddress &&
          <TrafficFilterDropdown
            i18n={this.props.i18n}
            localAddress={this.props.localAddress}
            currentTrafficFilter={this.props.currentTrafficFilter}
            setTrafficFilter={this.props.setTrafficFilter}
          />}
        <div style={style.clear}/>
      </div>
    );
  }
}

class RouterLogModeDropdown extends React.Component {
  static propTypes = {
    i18n: PropTypes.objectOf(PropTypes.func).isRequired,
    isAllRouterLogMode: PropTypes.bool,
    setRouterLogMode: PropTypes.func.isRequired
  };

  onChange = (event) => this.props.setRouterLogMode(event.target.value);

  render() {
    return (
      <select
        id="routerlog-mode"
        className="pull-right"
        style={style.dropdown}
        value={this.props.isAllRouterLogMode ? 'all' : 'mine'}
        onChange={this.onChange}
      >
        <option value="mine">
          {this.props.i18n.logBrowserHeader_toggleMine()}
        </option>
        <option value="all">
          {this.props.i18n.logBrowserHeader_toggleAll()}
        </option>
      </select>
    );
  }
}

class TrafficFilterDropdown extends React.Component {
  static propTypes = {
    i18n: PropTypes.objectOf(PropTypes.func).isRequired,
    localAddress: PropTypes.string,
    currentTrafficFilter: PropTypes.string.isRequired,
    setTrafficFilter: PropTypes.func.isRequired
  };

  onChange = (event) => this.props.setTrafficFilter(event.target.value);

  render() {
    return (
      <select
        id="traffic-filter"
        className="pull-right"
        style={style.dropdown}
        value={this.props.currentTrafficFilter}
        onChange={this.onChange}
      >
        <option value="none">
          {this.props.i18n.logBrowserHeader_showAllTraffic()}
        </option>
        <option value={`with ${this.props.localAddress}`}>
          {this.props.i18n.logBrowserHeader_showMyTraffic()}
        </option>
        <option value={`from ${this.props.localAddress}`}>
          {this.props.i18n.logBrowserHeader_showTrafficFromMe()}
        </option>
        <option value={`to ${this.props.localAddress}`}>
          {this.props.i18n.logBrowserHeader_showTrafficToMe()}
        </option>
      </select>
    );
  }
}

export class SentByDropdown extends React.Component {
  static propTypes = {
    i18n: PropTypes.objectOf(PropTypes.func).isRequired,
    currentSentByFilter: PropTypes.string.isRequired,
    setSentByFilter: PropTypes.func.isRequired,
    senderNames: PropTypes.arrayOf(PropTypes.string).isRequired
  };

  onChange = (event) => this.props.setSentByFilter(event.target.value);

  render() {
    return (
      <select
        className="pull-right"
        style={style.dropdown}
        value={this.props.currentSentByFilter}
        onChange={this.onChange}
      >
        <option value="none">
          {this.props.i18n.logBrowserHeader_sentByAnyone()}
        </option>
        {this.props.senderNames
          .sort((a, b) => a.localeCompare(b))
          .map(name => (
            <option value={`by ${name}`} key={name}>
              {this.props.i18n.logBrowserHeader_sentByName({name})}
            </option>
          ))}
      </select>
    );
  }
}
