/** @file Modal dialog for browsing any logs in the simulation. */
import _ from 'lodash';
import React from 'react';
import Dialog, {Title, Body} from '../templates/Dialog';
import Packet from './Packet';
import NetSimLogBrowserFilters from './NetSimLogBrowserFilters';
import NetSimLogBrowserTable from './NetSimLogBrowserTable';

// We want the table to scroll beyond this height
const MAX_TABLE_HEIGHT = 500;

const style = {
  scrollArea: {
    maxHeight: MAX_TABLE_HEIGHT,
    overflowY: 'auto'
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
    setTrafficFilter: React.PropTypes.func.isRequired,
    headerFields: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    logRows: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    senderNames: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    renderedRowLimit: React.PropTypes.number,
    teacherView: React.PropTypes.bool
  }),

  getDefaultProps() {
    return {
      isAllRouterLogMode: true,
      currentTrafficFilter: 'none'
    };
  },

  dialogTitle() {
    const {i18n, teacherView, isAllRouterLogMode, currentTrafficFilter} = this.props;
    if (teacherView) {
      return i18n.logBrowserHeader_teacherView();
    }

    let header = isAllRouterLogMode ?
      i18n.logBrowserHeader_all() : i18n.logBrowserHeader_mine();

    const match = /^(from|to|with) ([\d\.]+)/.exec(currentTrafficFilter);
    if (match) {
      if ('from' === match[1]) {
        header += i18n.logBrowserHeader_trafficFromAddress({
          address: match[2]
        });
      } else if ('to' === match[1]) {
        header += i18n.logBrowserHeader_trafficToAddress({
          address: match[2]
        });
      } else if ('with' === match[1]) {
        header += i18n.logBrowserHeader_trafficToAndFromAddress({
          address: match[2]
        });
      }
    }
    return header;
  },

  getInitialState() {
    return {
      currentSentByFilter: 'none'
    };
  },

  setSentByFilter(newFilter) {
    this.setState({ currentSentByFilter: newFilter});
  },

  render() {
    return (
      <Dialog fullWidth {...this.props}>
        <Title>{this.dialogTitle()}</Title>
        <Body>
          <NetSimLogBrowserFilters
            i18n={this.props.i18n}
            canSetRouterLogMode={this.props.canSetRouterLogMode}
            isAllRouterLogMode={this.props.isAllRouterLogMode}
            setRouterLogMode={this.props.setRouterLogMode}
            localAddress={this.props.localAddress}
            currentTrafficFilter={this.props.currentTrafficFilter}
            setTrafficFilter={this.props.setTrafficFilter}
            currentSentByFilter={this.state.currentSentByFilter}
            setSentByFilter={this.setSentByFilter}
            teacherView={this.props.teacherView}
            senderNames={this.props.senderNames}
          />
          <div style={style.scrollArea}>
            {/* TODO: get table sticky headers working */}
            <NetSimLogBrowserTable
              headerFields={this.props.headerFields}
              logRows={this.props.logRows}
              renderedRowLimit={this.props.renderedRowLimit}
              teacherView={this.props.teacherView}
              currentSentByFilter={this.state.currentSentByFilter}
            />
          </div>
        </Body>
      </Dialog>
    );
  }
});
export default NetSimLogBrowser;

if (BUILD_STYLEGUIDE) {
  const range = function (i) {
    return new Array(i).fill().map((_, i) => i);
  };

  const randInt = function (i) {
    return Math.floor(i * Math.random());
  };

  NetSimLogBrowser.styleGuideExamples = storybook => {
    const i18n = {
      logBrowserHeader_toggleMine: () => 'show my routers',
      logBrowserHeader_toggleAll: () => 'show all routers',
      logBrowserHeader_showAllTraffic: () => 'show all traffic',
      logBrowserHeader_showMyTraffic: () => 'show my traffic',
      logBrowserHeader_showTrafficFromMe: () => 'show traffic from me',
      logBrowserHeader_showTrafficToMe: () => 'show traffic to me',
      logBrowserHeader_all: () => 'All Router Logs',
      logBrowserHeader_mine: () => 'My Router Logs',
      logBrowserHeader_trafficFromAddress: ({address}) => ` - Traffic From ${address}`,
      logBrowserHeader_trafficToAddress: ({address}) => ` - Traffic To ${address}`,
      logBrowserHeader_trafficToAndFromAddress: ({address}) => ` - Traffic To and From ${address}`,
      logBrowserHeader_sentByAnyone: () => 'sent by anyone',
      logBrowserHeader_sentByName: ({name}) => `sent by ${name}`,
      logBrowserHeader_teacherView: () => 'Teacher View'
    };

    const simplePacket = [];
    const fancyPacket = [
      Packet.HeaderType.TO_ADDRESS,
      Packet.HeaderType.FROM_ADDRESS,
      Packet.HeaderType.PACKET_INDEX,
      Packet.HeaderType.PACKET_COUNT
    ];

    const lipsumWords = `Lorem ipsum dolor sit amet,
        consectetur adipiscing elit. Nam leo elit, tristique ac hendrerit vitae,
        porta quis diam. Cras sit amet diam dapibus, ullamcorper nibh vitae,
        luctus nisl. Curabitur fermentum accumsan commodo. Donec nec eros a
        lorem tincidunt sodales ac sit amet odio. Duis eget ornare ante.`.split(/\s+/g);

    const sampleData = new range(100).map(() => {
      const routerNum = 1 + randInt(10);
      const packetCount = 1 + randInt(4);
      const packetNum = 1 + randInt(packetCount);
      return {
        'timestamp': Date.now() - randInt(600000),
        'sent-by': lipsumWords[randInt(lipsumWords.length)],
        'logged-by': `Router ${routerNum}`,
        'status': Math.random() < 0.8 ? 'Success' : 'Dropped',
        'from-address': `${routerNum}.${1 + randInt(13)}`,
        'to-address': `${routerNum}.${1 + randInt(13)}`,
        'packet-info': `${packetNum} of ${packetCount}`,
        'message': range(randInt(20))
            .map(() => lipsumWords[randInt(lipsumWords.length)])
            .join(' ')
      };
    });

    const senderNames = _.uniq(sampleData.map(row => row['sent-by']));

    return storybook
        .storiesOf('NetSimLogBrowser', module)
        .addWithInfo(
            'No filtering allowed',
            `Here's what the dialog looks like with minimum settings.`,
            () => (
              <div id="netsim">
                <NetSimLogBrowser
                  isOpen
                  i18n={i18n}
                  setRouterLogMode={() => null}
                  setTrafficFilter={() => null}
                  headerFields={simplePacket}
                  logRows={sampleData}
                  senderNames={senderNames}
                />
              </div>
            ))
        .addWithInfo(
            'Student filters',
            `Here's what the dialog looks like with filters and more columns.`,
            () => (
              <div id="netsim">
                <NetSimLogBrowser
                  isOpen
                  i18n={i18n}
                  canSetRouterLogMode
                  isAllRouterLogMode
                  localAddress="1.15"
                  currentTrafficFilter="all"
                  setRouterLogMode={() => null}
                  setTrafficFilter={() => null}
                  headerFields={fancyPacket}
                  logRows={sampleData}
                  senderNames={senderNames}
                />
              </div>
            ))
      .addWithInfo(
        `Teacher's View`,
        `Here's what the teacher (or shard owner) gets to see`,
        () => (
          <div id="netsim">
            <NetSimLogBrowser
              isOpen
              i18n={i18n}
              isAllRouterLogMode
              currentTrafficFilter="all"
              setRouterLogMode={() => null}
              setTrafficFilter={() => null}
              headerFields={simplePacket}
              logRows={sampleData}
              senderNames={senderNames}
              teacherView
            />
          </div>
        ));
  };
}
