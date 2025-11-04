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

let echoCount;
let hasTimedOut;
let echoTimestamps;

const testLoad = function () {
  echoCount = 0;
  hasTimedOut = false;
  echoTimestamps = new Map();
  const consumer = createConsumer('/cable');

  const connectionId = _.random(1000000000000);

  const repeatInterval = DCDO.get('actioncable-repeat-interval', 1000);
  const isRepeat = DCDO.get('actioncable-repeat', true);
  const disconnectTimeout = DCDO.get(
    'actioncable-disconnect-timeout',
    30 * 1000
  );
  const echoTimeout = DCDO.get('actioncable-echo-timeout', 5 * 1000);

  logEvent('ActionCableLoadTestingConnecting', connectionId);

  const channel = consumer.subscriptions.create(
    'LoadTestingExperimentChannel',
    {
      connected() {
        logEvent('ActionCableLoadTestingConnected', connectionId);

        setTimeout(() => {
          if (channel) {
            channel.echo(connectionId);
          }
        }, 1000);
      },
      received(data) {
        if (data?.connectionId === connectionId) {
          const receivedTime = performance.now();
          const sentTime = echoTimestamps.get(data?.echoCount);
          const roundTripTime = sentTime
            ? _.floor(receivedTime - sentTime)
            : null;

          logEvent('ActionCableLoadTestingReceived', connectionId, {
            echoCount: data?.echoCount,
            roundTripTimeMs: roundTripTime,
          });

          if (sentTime) {
            echoTimestamps.delete(data?.echoCount);
          }
        }

        if (hasTimedOut) {
          if (echoTimestamps.size === 0) {
            consumer.disconnect();
            logEvent('ActionCableLoadTestingUnsubscribed', connectionId, {
              from: 'timed-out-after-received',
            });
          }
          return;
        }

        if (!!channel && isRepeat) {
          setTimeout(() => {
            channel.echo(connectionId);
          }, repeatInterval);
        }
      },
      echo(connectionId) {
        const sendTime = performance.now();
        echoTimestamps.set(echoCount, sendTime);
        this.perform('echo', {connectionId, echoCount});
        logEvent('ActionCableLoadTestingEchoSent', connectionId, {echoCount});
        const currentEchoCount = echoCount;

        // Set a timeout for the echo response.
        // If we don't get a response in time, log a timeout event and clean up.
        setTimeout(() => {
          if (!echoTimestamps.has(currentEchoCount)) {
            return;
          }

          logEvent('ActionCableLoadTestingEchoTimeout', connectionId, {
            echoCount: currentEchoCount,
          });
          echoTimestamps.delete(currentEchoCount);

          if (isRepeat && !hasTimedOut) {
            channel.echo(connectionId);
          }
          if (echoTimestamps.size === 0 && hasTimedOut) {
            consumer.disconnect();
            logEvent('ActionCableLoadTestingUnsubscribed', connectionId, {
              from: 'after-timeout',
            });
          }
        }, echoTimeout);
        echoCount++;
      },
    }
  );

  setTimeout(() => {
    hasTimedOut = true;
    if (!isRepeat && echoTimestamps.size === 0) {
      consumer.disconnect();

      logEvent('ActionCableLoadTestingUnsubscribed', connectionId, {
        from: 'single-echo-complete',
      });
    }
  }, disconnectTimeout);
};

const logEvent = (eventName, connectionId, metadata = {}) => {
  if (window.newrelic) {
    window.newrelic.recordCustomEvent(eventName, {connectionId, ...metadata});
  } else {
    console.log(
      `[NewRelic not found]: ${eventName}, {connectionId:${connectionId}, ${JSON.stringify(
        metadata
      )}}`
    );
  }
};
