import {Span, Context} from '@opentelemetry/api';

import SpanProcessor from '../SpanProcessor';

describe('SpanProcessor', () => {
  let spanProcessor: SpanProcessor;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSpan: any;
  let mockParentContext: Context;

  beforeEach(() => {
    spanProcessor = SpanProcessor.getInstance();
    mockSpan = {
      spanContext: jest.fn(() => ({traceId: 'test-trace-id'})),
      attributes: {},
      name: '',
      updateName: jest.fn(),
    } as unknown as Span;

    mockParentContext = {} as Context;
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Clear the map on after each test
    spanProcessor.onEnd(mockSpan);
  });

  it('should store the root span when a span starts', () => {
    spanProcessor.onStart(mockSpan, mockParentContext);

    const rootSpan = spanProcessor.getRootSpan('test-trace-id');
    expect(rootSpan).toBe(mockSpan);
  });

  it('should update the root span name if the span is a Next.js request handler', () => {
    mockSpan.attributes['next.span_type'] = 'BaseServer.handleRequest';
    mockSpan.name = 'GET /en-US/home';

    spanProcessor.onStart(mockSpan, mockParentContext);

    const rootSpan = spanProcessor.getRootSpan('test-trace-id');
    expect(rootSpan?.updateName).toHaveBeenCalledWith('GET /en-US/home');
  });

  it('should remove the root span when the span ends', () => {
    spanProcessor.onStart(mockSpan, mockParentContext);
    spanProcessor.onEnd(mockSpan);

    const rootSpan = spanProcessor.getRootSpan('test-trace-id');
    expect(rootSpan).toBeUndefined();
  });

  it('should filter out spans with the "next.bubble" attribute', () => {
    mockSpan.attributes['next.bubble'] = true;

    const spyOnEnd = jest.spyOn(spanProcessor, 'onEnd');
    spanProcessor.onEnd(mockSpan);

    expect(spyOnEnd).toHaveBeenCalled();
    expect(spanProcessor.getRootSpan('test-trace-id')).toBeUndefined();
  });

  it('should return undefined for non-existent trace IDs', () => {
    const rootSpan = spanProcessor.getRootSpan('non-existent-trace-id');
    expect(rootSpan).toBeUndefined();
  });
});
