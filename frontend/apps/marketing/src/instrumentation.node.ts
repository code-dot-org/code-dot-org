import {getNodeAutoInstrumentations} from '@opentelemetry/auto-instrumentations-node';
import {OTLPLogExporter} from '@opentelemetry/exporter-logs-otlp-proto';
import {OTLPTraceExporter} from '@opentelemetry/exporter-trace-otlp-proto';
import {resourceFromAttributes} from '@opentelemetry/resources';
import {BatchLogRecordProcessor} from '@opentelemetry/sdk-logs';
import {NodeSDK} from '@opentelemetry/sdk-node';
import {
  AlwaysOnSampler,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace-node';
import {ATTR_SERVICE_NAME} from '@opentelemetry/semantic-conventions';
import {FetchInstrumentation} from '@vercel/otel';

import FilteringSpanProcessor from '@/otel/FilteringSpanProcessor';
import {FilteringTraceSampler} from '@/otel/FilteringTraceSampler';

/**
 * If debugging OpenTelemetry, uncomment the following lines to enable console logs
 *
 // import {diag, DiagConsoleLogger, DiagLogLevel} from '@opentelemetry/api';
 // diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
 */

// Register OpenTelemetry for the marketing app
// See: https://nextjs.org/docs/app/guides/opentelemetry
if (process.env.NEXT_PUBLIC_INSTRUMENTATION_ENABLED === 'true') {
  console.debug(
    `Sending OpenTelemetry traces to ${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}`,
  );

  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: '@code-dot-org/marketing',
    }),
    spanProcessors: [new FilteringSpanProcessor(new OTLPTraceExporter())],
    logRecordProcessors: [new BatchLogRecordProcessor(new OTLPLogExporter())],
    sampler: new FilteringTraceSampler({
      base:
        process.env.NODE_ENV === 'production'
          ? new TraceIdRatioBasedSampler(0.1) // 10% of traces in production mode
          : new AlwaysOnSampler(),
    }),
    instrumentations: [
      getNodeAutoInstrumentations({
        // Disable some noisy auto instrumentations
        '@opentelemetry/instrumentation-fs': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-net': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-dns': {
          enabled: false,
        },
        // Rely on the Next.js incoming request instrumentation
        '@opentelemetry/instrumentation-http': {
          enabled: true,
          disableIncomingRequestInstrumentation: true,
        },
      }),
      new FetchInstrumentation(),
    ],
  });
  sdk.start();
} else {
  console.debug(
    'NEXT_PUBLIC_INSTRUMENTATION_ENABLED not set, skipping OpenTelemetry instrumentation',
  );
}

// Convert Next.js console logs to pino format. This must be done after the pino instrumentation is loaded.
await import('next-logger');
