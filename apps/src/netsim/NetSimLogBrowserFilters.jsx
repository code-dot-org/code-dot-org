/** @file Filtering controls for Log Browser modal */
import React from 'react';

const style = {
  clear: {
    clear: 'both'
  },
  logBrowserFilters: {
    marginBottom: '0.5em'
  },
  dropdown: {
    fontSize: 14
  }
};

/**
 * Filter controls for Log Browser Modal
 */
const NetSimLogBrowserFilters = React.createClass({
  propTypes: {
    i18n: React.PropTypes.objectOf(React.PropTypes.func).isRequired,
    canSetRouterLogMode: React.PropTypes.bool,
    isAllRouterLogMode: React.PropTypes.bool,
    setRouterLogMode: React.PropTypes.func.isRequired,
    localAddress: React.PropTypes.string,
    currentTrafficFilter: React.PropTypes.string.isRequired,
    setTrafficFilter: React.PropTypes.func.isRequired
  },

  render() {
    return (
      <div style={style.logBrowserFilters}>
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
});
export default NetSimLogBrowserFilters;

const RouterLogModeDropdown = React.createClass({
  propTypes: {
    i18n: React.PropTypes.objectOf(React.PropTypes.func).isRequired,
    isAllRouterLogMode: React.PropTypes.bool,
    setRouterLogMode: React.PropTypes.func.isRequired
  },

  onChange(event) {
    this.props.setRouterLogMode(event.target.value);
  },

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
});

const TrafficFilterDropdown = React.createClass({
  propTypes: {
    i18n: React.PropTypes.objectOf(React.PropTypes.func).isRequired,
    localAddress: React.PropTypes.string,
    currentTrafficFilter: React.PropTypes.string.isRequired,
    setTrafficFilter: React.PropTypes.func.isRequired
  },

  onChange(event) {
    this.props.setTrafficFilter(event.target.value);
  },

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
});
