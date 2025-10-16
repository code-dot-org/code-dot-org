import {SpanStatusCode, trace} from '@opentelemetry/api';
import {Instrumentation} from 'next';

import SpanProcessor from '@/otel/SpanProcessor';

if (process.env.NEXT_RUNTIME === 'nodejs') {
  await import('./instrumentation.node');
  await import('@opentelemetry/auto-instrumentations-node/register');
}

export async function register() {
  // Stubbed to enable opentelemetry instrumentation module BEFORE next.js itself loads
}

export const onRequestError: Instrumentation.onRequestError = async (
  err,
  request,
  context,
) => {
  if (!(err instanceof Error)) {
    console.error(
      'onRequestError was called with a non-Error object:',
      err,
      request,
      context,
    );
    return;
  }

  const traceId = trace.getActiveSpan()?.spanContext().traceId;

  if (traceId) {
    const spanProcessor = SpanProcessor.getInstance();
    const rootSpan = spanProcessor.getRootSpan(traceId);

    if (rootSpan) {
      rootSpan.recordException(err);

      rootSpan.setStatus({code: SpanStatusCode.ERROR});
      rootSpan.setAttributes({
        'otel.status_description': err.message,
        'error.group.message': err.message,
      });
    }
  }
};
