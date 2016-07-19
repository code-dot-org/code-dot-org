/** @file Modal dialog for browsing any logs in the simulation. */
import React from 'react';
import Dialog, {Title, Body} from '../templates/Dialog';
import Packet from './Packet';

const styles = {
  table: {
    width: '100%'
  },
  th: {
    fontSize: '12pt'
  },
  tdNoLogsToShow: {
    textAlign: 'center',
    fontStyle: 'italic'
  }
};

const NetSimLogBrowser = React.createClass({
  propTypes: {
    i18n: React.PropTypes.objectOf(React.PropTypes.func).isRequired,
    hideBackdrop: React.PropTypes.bool,
    canSetRouterLogMode: React.PropTypes.bool,
    isAllRouterLogMode: React.PropTypes.bool,
    localAddress: React.PropTypes.string,
    currentTrafficFilter: React.PropTypes.string.isRequired,
    headerFields: React.PropTypes.arrayOf(React.PropTypes.string).isRequired
  },

  getDefaultProps() {
    return {
      isAllRouterLogMode: true,
      currentTrafficFilter: 'none'
    };
  },

  render() {
    return (
      <Dialog
          isOpen
          fullWidth
      >
        <Title>Log Browser</Title>
        <Body>
          <LogBrowserFilters
              i18n={this.props.i18n}
              canSetRouterLogMode={this.props.canSetRouterLogMode}
              isAllRouterLogMode={this.props.isAllRouterLogMode}
              localAddress={this.props.localAddress}
              currentTrafficFilter={this.props.currentTrafficFilter}
          />
          <LogTable
              headerFields={this.props.headerFields}
          />
        </Body>
      </Dialog>
    );
  }
});
export default NetSimLogBrowser;

const LogBrowserFilters = React.createClass({
  propTypes: {
    i18n: React.PropTypes.objectOf(React.PropTypes.func).isRequired,
    canSetRouterLogMode: React.PropTypes.bool,
    isAllRouterLogMode: React.PropTypes.bool,
    localAddress: React.PropTypes.string,
    currentTrafficFilter: React.PropTypes.string.isRequired
  },

  render() {
    return (
      <div>
        {this.props.canSetRouterLogMode &&
          <RouterLogModeDropdown
              i18n={this.props.i18n}
              isAllRouterLogMode={this.props.isAllRouterLogMode}
          />
        }
        {this.props.localAddress &&
          <TrafficFilterDropdown
              i18n={this.props.i18n}
              localAddress={this.props.localAddress}
              currentTrafficFilter={this.props.currentTrafficFilter}
          />
        }
      </div>
    );
  }
});

const RouterLogModeDropdown = React.createClass({
  propTypes: {
    i18n: React.PropTypes.objectOf(React.PropTypes.func).isRequired,
    isAllRouterLogMode: React.PropTypes.bool
  },

  render() {
    return (
      <select
          id="routerlog-mode"
          className="pull-right"
          value={this.props.isAllRouterLogMode ? 'all' : 'mine'}
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
    currentTrafficFilter: React.PropTypes.string.isRequired
  },

  render() {
    return (
        <select
            id="traffic-filter"
            className="pull-right"
            value={this.props.currentTrafficFilter}
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

const LogTable = React.createClass({
  propTypes: {
    headerFields: React.PropTypes.arrayOf(React.PropTypes.string).isRequired
  },

  render() {
    const headerFields = this.props.headerFields;

    /** @type {boolean} */
    var showToAddress = headerFields.indexOf(Packet.HeaderType.TO_ADDRESS) > -1;

    /** @type {boolean} */
    var showFromAddress = headerFields.indexOf(Packet.HeaderType.FROM_ADDRESS) > -1;

    /** @type {boolean} */
    var showPacketInfo = headerFields.indexOf(Packet.HeaderType.PACKET_INDEX) > -1 &&
        headerFields.indexOf(Packet.HeaderType.PACKET_COUNT) > -1;

    const columnCount = 4 +
        (showToAddress ? 1 : 0) +
        (showFromAddress ? 1 : 0) +
        (showPacketInfo ? 1 : 0);

    // Maybe just use this thing?
    // https://facebook.github.io/fixed-data-table/
    return (
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Time</th>
            <th style={styles.th}>Logged By</th>
            <th style={styles.th}>Status</th>
            {showFromAddress && <th style={styles.th}>From</th>}
            {showToAddress && <th style={styles.th}>To</th>}
            {showPacketInfo && <th style={styles.th}>Packet</th>}
            <th style={styles.th}>Message</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={styles.tdNoLogsToShow} colSpan={columnCount}>
              No logs to display (TODO: LOCALIZE)
            </td>
          </tr>
        </tbody>
      </table>
    );
  }
});

if (BUILD_STYLEGUIDE) {
  NetSimLogBrowser.styleGuideExamples = storybook => {
    const i18n = {
      logBrowserHeader_toggleMine: () => 'show my routers',
      logBrowserHeader_toggleAll: () => 'show all routers',
      logBrowserHeader_showAllTraffic: () => 'show all traffic',
      logBrowserHeader_showMyTraffic: () => 'show my traffic',
      logBrowserHeader_showTrafficFromMe: () => 'show traffic from me',
      logBrowserHeader_showTrafficToMe: () => 'show traffic to me'
    };

    const simplePacket = [];
    const fancyPacket = [
      Packet.HeaderType.TO_ADDRESS,
      Packet.HeaderType.FROM_ADDRESS,
      Packet.HeaderType.PACKET_INDEX,
      Packet.HeaderType.PACKET_COUNT
    ];

    return storybook
        .storiesOf('NetSimLogBrowser', module)
        .addWithInfo(
            'No filtering allowed',
            `Here's what the dialog looks like with minimum settings.`,
            () => (
                <NetSimLogBrowser
                    i18n={i18n}
                    headerFields={simplePacket}
                />
            ))
        .addWithInfo(
            'Student filters',
            `Here's what the dialog looks like with minimum settings.`,
            () => (
                <NetSimLogBrowser
                    i18n={i18n}
                    canSetRouterLogMode
                    isAllRouterLogMode
                    localAddress="1.15"
                    currentTrafficFilter="all"
                    headerFields={fancyPacket}
                />
            ));
  };
}
