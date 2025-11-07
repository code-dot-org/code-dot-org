import {createConsumer} from '@rails/actioncable';
import _ from 'lodash';

import DCDO from '@cdo/apps/dcdo';
import experiments from '@cdo/apps/util/experiments';

export const experimentActionCableLoad = function () {
  setTimeout(() => {
    if (experiments.isEnabled('actioncable-load-testing')) {
      testLoad();
    }
  }, 3000);
};

const testLoad = function () {
  let sentEchoCount = 0;
  let hasTimedOut = false;
  let sentEchoTimestamps = new Map();

  const consumer = createConsumer('/cable');

  const connectionId = _.random(1000000000000);

  const repeatInterval = DCDO.get('actioncable-repeat-interval', 10 * 1000);
  const isRepeat = DCDO.get('actioncable-repeat', false);
  const disconnectTimeout = DCDO.get(
    'actioncable-disconnect-timeout',
    30 * 1000
  );

  // After disconnectTimeout milliseconds, unsubscribe and disconnect
  setTimeout(() => {
    hasTimedOut = true;
    try {
      logEvent('ActionCableLoadTestingUnsubscribing', connectionId);
      consumer.disconnect();
      logEvent('ActionCableLoadTestingUnsubscribed', connectionId, {
        success: true,
      });
    } catch (e) {
      logEvent('ActionCableLoadTestingUnsubscribed', connectionId, {
        success: false,
        errorMessage: String(e),
      });

      // try to disconnect again in 10s:
      setTimeout(() => {
        consumer.disconnect();
      }, 10000);
    }
  }, disconnectTimeout);

  logEvent('ActionCableLoadTestingConnecting', connectionId);

  const channel = consumer.subscriptions.create(
    'LoadTestingExperimentChannel',
    {
      connected() {
        logEvent('ActionCableLoadTestingConnected', connectionId);
        channel.sendEcho(connectionId);
      },
      received({connectionId: receivedConnectionId, sentEchoCount}) {
        if (receivedConnectionId !== connectionId) return;

        const receivedTime = performance.now();
        const sentTime = sentEchoTimestamps.get(sentEchoCount);
        if (sentTime) sentEchoTimestamps.delete(sentEchoCount);
        const roundTripTime = sentTime
          ? _.floor(receivedTime - sentTime)
          : null;

        logEvent('ActionCableLoadTestingReceived', connectionId, {
          sentEchoCount: sentEchoCount,
          roundTripTimeMs: roundTripTime,
        });

        if (isRepeat) {
          setTimeout(() => channel.sendEcho(connectionId), repeatInterval);
        }
      },
      sendEcho(connectionId) {
        if (hasTimedOut) return;
        sentEchoTimestamps.set(sentEchoCount, performance.now());
        this.perform('echo', {connectionId, sentEchoCount});
        logEvent('ActionCableLoadTestingEchoSent', connectionId, {
          sentEchoCount,
        });
        sentEchoCount++;
      },
    }
  );
};

const logEvent = (eventName, connectionId, metadata = {}) => {
  const msg = {connectionId, ...metadata};
  if (window.newrelic) {
    window.newrelic.recordCustomEvent(eventName, msg);
  } else {
    console.log(`[NewRelic not found]: ${eventName}`, msg);
  }
};
