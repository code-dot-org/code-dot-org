/** @file Modal dialog for browsing any logs in the simulation. */
import React from 'react';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import moment from 'moment';
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
  propTypes: Object.assign({}, Dialog.propTypes, {
    i18n: React.PropTypes.objectOf(React.PropTypes.func).isRequired,
    canSetRouterLogMode: React.PropTypes.bool,
    isAllRouterLogMode: React.PropTypes.bool,
    localAddress: React.PropTypes.string,
    currentTrafficFilter: React.PropTypes.string.isRequired,
    headerFields: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    logRows: React.PropTypes.arrayOf(React.PropTypes.object).isRequired
  }),

  getDefaultProps() {
    return {
      isAllRouterLogMode: true,
      currentTrafficFilter: 'none'
    };
  },

  render() {
    return (
      <Dialog fullWidth {...this.props}>
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
            logRows={this.props.logRows}
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

// TODO: Define NetSimLogRow type
const LogTable = React.createClass({
  propTypes: {
    logRows: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    headerFields: React.PropTypes.arrayOf(React.PropTypes.string).isRequired
  },

  render() {
    const headerFields = this.props.headerFields;

    const showToAddress = headerFields.indexOf(Packet.HeaderType.TO_ADDRESS) > -1;

    const showFromAddress = headerFields.indexOf(Packet.HeaderType.FROM_ADDRESS) > -1;

    const showPacketInfo = headerFields.indexOf(Packet.HeaderType.PACKET_INDEX) > -1 &&
        headerFields.indexOf(Packet.HeaderType.PACKET_COUNT) > -1;

    let columns = [
      <TableHeaderColumn
        isKey
        key="timestamp"
        dataField="timestamp"
        dataSort
        dataFormat={timeFormatter}
      >
        Time
      </TableHeaderColumn>,
      <TableHeaderColumn
        key="logged-by"
        dataField="logged-by"
        dataSort
      >
        Logged By
      </TableHeaderColumn>,
      <TableHeaderColumn
        key="status"
        dataField="status"
      >
        Status
      </TableHeaderColumn>
    ];
    if (showFromAddress) {
      columns.push(
        <TableHeaderColumn
          key="from-address"
          dataField="from-address"
        >
          From
        </TableHeaderColumn>
      );
    }
    if (showToAddress) {
      columns.push(
        <TableHeaderColumn
          key="to-address"
          dataField="to-address"
        >
          To
        </TableHeaderColumn>
      );
    }
    if (showPacketInfo) {
      columns.push(
        <TableHeaderColumn
          key="packet-info"
          dataField="packet-info"
        >
          Packet
        </TableHeaderColumn>
      );
    }
    columns.push(
      <TableHeaderColumn
        key="message"
        dataField="message"
      >
        Message
      </TableHeaderColumn>
    );

    return (
      <BootstrapTable
        data={this.props.logRows}
        striped={true}
        hover={true}
        children={columns}
      />);
  }
});

function timeFormatter(timestamp) {
  return moment(timestamp).format('h:mm:ss.SSS A');
}

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

    const sampleData = [
      {
        'timestamp': Date.now(),
        'logged-by': 'Router 1', // TODO: Make this a Node
        'status': 'Dropped',
        'from-address': '10.1',
        'to-address': '10.15',
        'packet-info': '100',
        'message': 'GET myhostname'
      }, {
        'timestamp': Date.now() - 400,
        'logged-by': 'Router 1', // TODO: Make this a Node
        'status': 'Success',
        'from-address': '10.1',
        'to-address': '10.15',
        'packet-info': '100',
        'message': 'What?'
      }, {
        'timestamp': Date.now() - 1000,
        'logged-by': 'Router 1', // TODO: Make this a Node
        'status': 'Success',
        'from-address': '10.15',
        'to-address': '10.1',
        'packet-info': '100',
        'message': 'Send that again!'
      }
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
                  logRows={sampleData}
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
                  logRows={sampleData}
                />
            ));
  };
}
