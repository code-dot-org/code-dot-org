import {getNodeAutoInstrumentations} from '@opentelemetry/auto-instrumentations-node';
import {OTLPLogExporter} from '@opentelemetry/exporter-logs-otlp-proto';
import {OTLPMetricExporter} from '@opentelemetry/exporter-metrics-otlp-proto';
import {resourceFromAttributes} from '@opentelemetry/resources';
import {BatchLogRecordProcessor} from '@opentelemetry/sdk-logs';
import {PeriodicExportingMetricReader} from '@opentelemetry/sdk-metrics';
import {NodeSDK} from '@opentelemetry/sdk-node';
import {
  AlwaysOnSampler,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace-node';
import {ATTR_SERVICE_NAME} from '@opentelemetry/semantic-conventions';
import {FetchInstrumentation} from '@vercel/otel';
import {ClientRequest} from 'node:http';

import {FilteringTraceSampler} from '@/otel/FilteringTraceSampler';
import SpanProcessor from '@/otel/SpanProcessor';

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
    spanProcessors: [SpanProcessor.getInstance()],
    logRecordProcessors: [new BatchLogRecordProcessor(new OTLPLogExporter())],
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter(),
    }),
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
        '@opentelemetry/instrumentation-http': {
          enabled: true,
          // This gives your request spans a more meaningful name than `GET`
          // This sets the name to `GET code.org/xyz/123` instead of just `GET`
          requestHook: (span, request) => {
            const urlPath =
              request instanceof ClientRequest
                ? `${request.host}${request.path}`
                : request.url;

            if (urlPath) {
              span.updateName(`${request.method} ${urlPath}`);

              span.setAttribute('http.route', urlPath);
            }
          },
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
