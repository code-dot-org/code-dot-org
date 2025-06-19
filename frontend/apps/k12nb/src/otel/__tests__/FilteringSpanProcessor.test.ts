import {ReadableSpan} from '@opentelemetry/sdk-trace-base';
import {SpanExporter} from '@opentelemetry/sdk-trace-base/build/src/export/SpanExporter';

import FilterSpanProcessor from '../FilteringSpanProcessor';

const DEFAULT_MOCK_SPAN: ReadableSpan = {
  attributes: {},
  spanContext: jest.fn().mockReturnValue({}),
} as unknown as ReadableSpan;

describe('FilterSpanProcessor', () => {
  let mockExporter: jest.Mocked<SpanExporter>;
  let processor: FilterSpanProcessor;

  beforeEach(() => {
    mockExporter = {
      export: jest.fn(),
      shutdown: jest.fn(),
    };
    processor = new FilterSpanProcessor(mockExporter);
  });

  it('should call super.onEnd for spans without "next.bubble" attribute', () => {
    const mockSpan: ReadableSpan = DEFAULT_MOCK_SPAN;
    const superOnEndSpy = jest.spyOn(
      Object.getPrototypeOf(FilterSpanProcessor.prototype),
      'onEnd',
    );

    processor.onEnd(mockSpan);

    expect(superOnEndSpy).toHaveBeenCalledWith(mockSpan);
    superOnEndSpy.mockRestore();
  });

  it('should not call super.onEnd for spans with "next.bubble" attribute', () => {
    const mockSpan: ReadableSpan = {
      ...DEFAULT_MOCK_SPAN,
      attributes: {'next.bubble': true},
    } as unknown as ReadableSpan;

    const superOnEndSpy = jest.spyOn(
      Object.getPrototypeOf(FilterSpanProcessor.prototype),
      'onEnd',
    );

    processor.onEnd(mockSpan);

    expect(superOnEndSpy).not.toHaveBeenCalled();
    superOnEndSpy.mockRestore();
  });

  it("should call the exporter's shutdown method when processor is shut down", async () => {
    await processor.shutdown();
    expect(mockExporter.shutdown).toHaveBeenCalled();
  });

  it('should not pass spans to the exporter if they have "next.bubble" attribute', () => {
    const mockSpan: ReadableSpan = {
      ...DEFAULT_MOCK_SPAN,
      attributes: {'next.bubble': true},
    } as unknown as ReadableSpan;

    processor.onEnd(mockSpan);

    expect(mockExporter.export).not.toHaveBeenCalled();
  });
});
