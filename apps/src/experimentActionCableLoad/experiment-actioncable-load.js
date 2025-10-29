import {createConsumer} from '@rails/actioncable';
import _ from 'lodash';

import experiments from '@cdo/apps/util/experiments';

export const experimentActionCableLoad = function () {
  setTimeout(() => {
    if (experiments.isEnabled('actioncable-load-testing')) {
      testLoad();
    }
  }, 3000);
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
  }, 5 * 60 * 1000);
};

const logEvent = (eventName, connectionId) => {
  if (window.newrelic) {
    window.newrelic.recordCustomEvent(eventName, {connectionId});
  } else {
    console.log(
      `[NewRelic not found]: ${eventName}, {connectionId:${connectionId}}`
    );
  }
};
