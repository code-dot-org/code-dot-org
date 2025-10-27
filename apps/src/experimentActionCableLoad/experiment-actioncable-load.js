import {createConsumer} from '@rails/actioncable';
import _ from 'lodash';

import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
// import experiments from '@cdo/apps/util/experiments';

import {PLATFORMS} from '../metrics/AnalyticsConstants';

export const experimentActionCableLoad = function () {
  console.log('actioncable testing before experiment');
  // if (experiments.isEnabled('actioncable-load-testing')) {
  setTimeout(testLoad, 3000);
  // }
};

const testLoad = function () {
  const consumer = createConsumer('/cable');

  const connectionId = _.random(10000);

  analyticsReporter.sendEvent(
    'ActionCableLoadTestingConnecting',
    {connectionId},
    PLATFORMS.BOTH
  );

  const channel = consumer.subscriptions.create(
    'LoadTestingExperimentChannel',
    {
      connected() {
        analyticsReporter.sendEvent(
          'ActionCableLoadTestingConnected',
          {connectionId},
          PLATFORMS.BOTH
        );

        setTimeout(() => {
          channel.echo(connectionId);
        }, 1000);
      },
      received(data) {
        console.log('actioncable', {received: data, expected: connectionId});
        if (data?.connectionId === connectionId) {
          analyticsReporter.sendEvent(
            'ActionCableLoadTestingReceived',
            {connectionId},
            PLATFORMS.BOTH
          );
        }

        // setTimeout(() => {
        //   channel.close();
        // }, 10000);
      },
      echo(connectionId) {
        this.perform('echo', {connectionId});

        analyticsReporter.sendEvent(
          'ActionCableLoadTestingEchoSent',
          {connectionId},
          PLATFORMS.BOTH
        );
      },
    }
  );
};
