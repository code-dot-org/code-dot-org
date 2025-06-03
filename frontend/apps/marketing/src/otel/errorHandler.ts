import NewRelicAgent from '@/providers/newrelic/agent';
export function handleError(error: Error, errorTraceId: string) {
  console.error(error, errorTraceId);

  NewRelicAgent.then(agent => {
    if (agent) {
      agent.noticeError(error, {errorTraceId});
    }
  });
}
