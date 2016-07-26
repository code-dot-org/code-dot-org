/** @file Modal dialog for browsing any logs in the simulation. */
import React from 'react';
import orderBy from 'lodash/orderBy';
import {Table, sort} from 'reactabular';
import moment from 'moment';
import Dialog, {Title, Body} from '../templates/Dialog';
import Packet from './Packet';

// We want the table to scroll beyond this height
const MAX_TABLE_HEIGHT = 500;

const style = {
  clear: {
    clear: 'both'
  },
  scrollArea: {
    maxHeight: MAX_TABLE_HEIGHT,
    overflowY: 'auto'
  },
  logBrowserFilters: {
    marginBottom: '0.5em'
  },
  dropdown: {
    fontSize: 14
  }
};

const NetSimLogBrowser = React.createClass({
  propTypes: Object.assign({}, Dialog.propTypes, {
    i18n: React.PropTypes.objectOf(React.PropTypes.func).isRequired,
    canSetRouterLogMode: React.PropTypes.bool,
    isAllRouterLogMode: React.PropTypes.bool,
    setRouterLogMode: React.PropTypes.func.isRequired,
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
            setRouterLogMode={this.props.setRouterLogMode}
            localAddress={this.props.localAddress}
            currentTrafficFilter={this.props.currentTrafficFilter}
          />
          <div style={style.scrollArea}>
            {/* TODO: get table sticky headers working */}
            <LogTable
              headerFields={this.props.headerFields}
              logRows={this.props.logRows}
            />
          </div>
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
    setRouterLogMode: React.PropTypes.func.isRequired,
    localAddress: React.PropTypes.string,
    currentTrafficFilter: React.PropTypes.string.isRequired
  },

  render() {
    return (
      <div style={style.logBrowserFilters}>
        {this.props.canSetRouterLogMode &&
          <RouterLogModeDropdown
            i18n={this.props.i18n}
            isAllRouterLogMode={this.props.isAllRouterLogMode}
            setRouterLogMode={this.props.setRouterLogMode}
          />
        }
        {this.props.localAddress &&
          <TrafficFilterDropdown
            i18n={this.props.i18n}
            localAddress={this.props.localAddress}
            currentTrafficFilter={this.props.currentTrafficFilter}
          />
        }
        <div style={style.clear}/>
      </div>
    );
  }
});

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
    currentTrafficFilter: React.PropTypes.string.isRequired
  },

  render() {
    return (
        <select
          id="traffic-filter"
          className="pull-right"
          style={style.dropdown}
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
    logRows: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    headerFields: React.PropTypes.arrayOf(React.PropTypes.string).isRequired
  },

  getInitialState() {
    return {
      sortingColumns: {
        0: {direction: 'desc', position: 0}
      }
    };
  },

  render() {
    const headerFields = this.props.headerFields;

    // Define a sorting transform that can be applied to each column
    const sortable = sort.sort({
      // Point the transform to your rows. React state can work for this purpose
      // but you can use a state manager as well.
      getSortingColumns: () => this.state.sortingColumns || {},

      // The user requested sorting, adjust the sorting state accordingly.
      // This is a good chance to pass the request through a sorter.
      onSort: selectedColumn => {
        this.setState({
          sortingColumns: sort.byColumn({
            sortingColumns: this.state.sortingColumns,
            // Custom sortingOrder removes 'no-sort' from the cycle
            sortingOrder: {
              FIRST: 'asc',
              asc: 'desc',
              desc: 'asc'
            },
            selectedColumn
          })
        });
      }
    });

    const showToAddress = headerFields.indexOf(Packet.HeaderType.TO_ADDRESS) > -1;

    const showFromAddress = headerFields.indexOf(Packet.HeaderType.FROM_ADDRESS) > -1;

    const showPacketInfo = headerFields.indexOf(Packet.HeaderType.PACKET_INDEX) > -1 &&
        headerFields.indexOf(Packet.HeaderType.PACKET_COUNT) > -1;

    let columns = [
      {
        header: {label: 'Time', transforms: [sortable]},
        cell: {property: 'timestamp', format: timeFormatter}
      },
      {
        header: {label: 'Logged By', transforms: [sortable]},
        cell: {property: 'logged-by'}
      },
      {
        header: {label: 'Status', transforms: [sortable]},
        cell: {property: 'status'}
      },
    ];

    if (showFromAddress) {
      columns.push({
        header: {label: 'From', transforms: [sortable]},
        cell: {property: 'from-address'}
      });
    }

    if (showToAddress) {
      columns.push({
        header: {label: 'To', transforms: [sortable]},
        cell: {property: 'to-address'}
      });
    }

    if (showPacketInfo) {
      columns.push({
        header: {label: 'Packet', transforms: [sortable]},
        cell: {property: 'packet-info'}
      });
    }

    columns.push({
      header: {label: 'Message', transforms: [sortable]},
      cell: {property: 'message'}
    });

    const {logRows} = this.props;
    const {sortingColumns} = this.state;
    const sortedRows = sort.sorter({
      columns,
      sortingColumns,
      sort: orderBy
    })(logRows);

    return (
      <Table.Provider columns={columns}>
        <Table.Header/>
        <Table.Body
          rows={sortedRows}
          rowKey="uuid"
        />
      </Table.Provider>
    );
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
