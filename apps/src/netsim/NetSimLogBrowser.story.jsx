import _ from 'lodash';
import React from 'react';
import NetSimLogBrowser from './NetSimLogBrowser';
import Packet from './Packet';
import {createUuid} from '@cdo/apps/utils';
import {withInfo} from '@storybook/addon-info';

const range = function (i) {
  return new Array(i).fill().map((_, i) => i);
};

const randInt = function (i) {
  return Math.floor(i * Math.random());
};

export default storybook => {
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
      'uuid': createUuid(),
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
    .add(
      'No filtering allowed',
      withInfo(`Here's what the dialog looks like with minimum settings.`)(() =>
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
    .add(
      'Student filters',
      withInfo(`Here's what the dialog looks like with filters and more columns.`)(() =>
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
    .add(
      `Teacher's View`,
      withInfo(`Here's what the teacher (or shard owner) gets to see`)(() =>
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
