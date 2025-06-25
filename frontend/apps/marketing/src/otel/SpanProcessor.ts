import {Context} from '@opentelemetry/api';
import {OTLPTraceExporter} from '@opentelemetry/exporter-trace-otlp-proto';
import {
  BatchSpanProcessor,
  ReadableSpan,
  Span,
  SpanProcessor as BaseSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import {SpanExporter} from '@opentelemetry/sdk-trace-base/build/src/export/SpanExporter';

/**
 * This OTEL Span Processor tracks the reference to the root span for a given trace and filters out OTEL spans that
 * should not be sent.
 *
 * Tracking the root span is important for New Relic as errors are only tracked by New Relic if the root span itself
 * contains an error. In OpenTelemetry, a child span can error without the root span being aware of it. Therefore, when
 * an error occurs, the root span is updated to report the exception and set error attributes.
 *
 * Traces contain one or more spans, which this processor can process within a trace.
 *
 * See: https://opentelemetry.io/docs/languages/js/instrumentation/#picking-the-right-span-processor
 */
class SpanProcessor extends BatchSpanProcessor implements BaseSpanProcessor {
  private rootSpans = new Set<ReadableSpan>();
  private traces = new Map<string, Span>();
  private static instance: SpanProcessor;

  constructor(_exporter: SpanExporter) {
    super(_exporter);
  }

  static getInstance() {
    if (SpanProcessor.instance) {
      return SpanProcessor.instance;
    }

    SpanProcessor.instance = new SpanProcessor(new OTLPTraceExporter());

    return SpanProcessor.instance;
  }

  /**
   * When a span starts, we store the root span of the trace so that we can later update its attributes.
   * This is needed specifically so that New Relic can track errors as New Relic only considers errors in the root span.
   * This functionality can be removed or disabled if not using OpenTelemetry processors that require root span attributes.
   * @param span The OpenTelemetry span that has started
   * @param parentContext The parent context of the span
   */
  onStart(span: Span, parentContext: Context) {
    const traceId = span.spanContext().traceId;

    if (!this.traces.has(traceId)) {
      this.rootSpans.add(span);
      this.traces.set(traceId, span);
    }

    // If the span is a Next.js request handler, we update the root span name to match the request handler name.
    // This will change the auto instrumentation span name from 'GET' to the Next.js span name
    // Example: GET -> GET /en-US/home
    if (span.attributes['next.span_type'] === 'BaseServer.handleRequest') {
      const rootSpan = this.traces.get(traceId);

      if (rootSpan) {
        rootSpan.updateName(span.name);
      }
    }

    super.onStart(span, parentContext);
  }

  onEnd(span: ReadableSpan): void {
    const isRootSpan = this.rootSpans.has(span);

    if (isRootSpan) {
      this.rootSpans.delete(span);
      this.traces.delete(span.spanContext().traceId);
    }

    if (span.attributes['next.bubble']) {
      //  out spans with the 'next.bubble' attribute
      // See: https://github.com/vercel/next.js/issues/67737
      return;
    }
    super.onEnd(span);
  }

  getRootSpan(traceId: string): Span | undefined {
    return this.traces.get(traceId);
  }
}

export default SpanProcessor;
