import {
  SpanProcessor,
  ReadableSpan,
  BatchSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import {SpanExporter} from '@opentelemetry/sdk-trace-base/build/src/export/SpanExporter';

/**
 * This OTEL Span Processor filters out OTEL spans that should not be sent.
 *
 * Traces contain one or more spans, which this processor can filter specific spans within a trace.
 *
 * See: https://opentelemetry.io/docs/languages/js/instrumentation/#picking-the-right-span-processor
 */
class FilterSpanProcessor extends BatchSpanProcessor implements SpanProcessor {
  constructor(_exporter: SpanExporter) {
    super(_exporter);
  }

  onEnd(span: ReadableSpan): void {
    if (span.attributes['next.bubble']) {
      // Filter out spans with the 'next.bubble' attribute
      // See: https://github.com/vercel/next.js/issues/67737
      return;
    }
    super.onEnd(span);
  }
}

export default FilterSpanProcessor;
