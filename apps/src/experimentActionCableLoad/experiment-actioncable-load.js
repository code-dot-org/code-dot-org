import {createConsumer} from '@rails/actioncable';
import _ from 'lodash';

import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import experiments from '@cdo/apps/util/experiments';

import {PLATFORMS} from '../metrics/AnalyticsConstants';

export const experimentActionCableLoad = function () {
  if (experiments.isEnabled('actioncable-load-testing')) {
    setTimeout(testLoad, 3000);
  }
};

const testLoad = function () {
  const consumer = createConsumer('/cable');

  const connectionId = _.random(10000);

  logEvent('ActionCableLoadTestingConnecting', connectionId);

  const channel = consumer.subscriptions.create(
    'LoadTestingExperimentChannel',
    {
      connected() {
        logEvent('ActionCableLoadTestingConnected', connectionId);

        setTimeout(() => {
          channel.echo(connectionId);
        }, 1000);
      },
      received(data) {
        if (data?.connectionId === connectionId) {
          logEvent('ActionCableLoadTestingReceived', connectionId);
        }
      },
      echo(connectionId) {
        this.perform('echo', {connectionId});

        logEvent('ActionCableLoadTestingEchoSent', connectionId);
      },
    }
  );

  setTimeout(() => {
    consumer.disconnect();

    logEvent('ActionCableLoadTestingUnsubscribed', connectionId);
  }, 20000);
};

const logEvent = (eventName, connectionId) =>
  analyticsReporter.sendEvent(eventName, {connectionId}, PLATFORMS.BOTH);
