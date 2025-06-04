import {Honeybadger} from '@honeybadger-io/react';

import NewRelicAgent from '@/providers/newrelic/agent';
export function handleError(error: Error, errorTraceId: string | undefined) {
  console.error(error, errorTraceId);
  console.debug(
    `Error ${errorTraceId} received ${error?.message}, ${error?.stack}`,
  );

  NewRelicAgent.then(agent => {
    if (agent) {
      agent.noticeError(error, {errorTraceId});
    }
  });

  Honeybadger.setContext({errorTraceId});
  Honeybadger.notify(error);
}
