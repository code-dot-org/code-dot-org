import NewRelicAgent from '@/providers/newrelic/agent';
export function handleError(error: Error, errorTraceId: string) {
  console.error(error, errorTraceId);
  console.debug(
    `Error ${errorTraceId} received ${error.message}, ${error.stack}`,
  );

  NewRelicAgent.then(agent => {
    if (agent) {
      agent.noticeError(error, {errorTraceId});
    }
  });
}
