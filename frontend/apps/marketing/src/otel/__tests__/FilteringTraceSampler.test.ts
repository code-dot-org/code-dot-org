import {Context, Link, SpanKind} from '@opentelemetry/api';
import {AlwaysOnSampler, SamplingDecision} from '@opentelemetry/sdk-trace-node';

import {FilteringTraceSampler} from '../FilteringTraceSampler';

describe('FilteringTraceSampler', () => {
  const mockContext = {} as Context;
  const mockTraceId = 'test-trace-id';
  const mockSpanName = 'test-span';
  const mockSpanKind = SpanKind.INTERNAL;
  const mockAttributes = {};
  const mockLinks: Link[] = [];

  it('should use the base sampler when no patterns match', () => {
    const baseSampler = new AlwaysOnSampler();
    const sampler = new FilteringTraceSampler({base: baseSampler});

    const result = sampler.shouldSample(
      mockContext,
      mockTraceId,
      mockSpanName,
      mockSpanKind,
      mockAttributes,
      mockLinks,
    );

    expect(result.decision).toBe(SamplingDecision.RECORD_AND_SAMPLED);
  });

  it('should not record spans matching default ignore patterns', () => {
    const sampler = new FilteringTraceSampler();

    const result = sampler.shouldSample(
      mockContext,
      mockTraceId,
      mockSpanName,
      mockSpanKind,
      {'next.route': '/api/health_check'},
      mockLinks,
    );

    expect(result.decision).toBe(SamplingDecision.NOT_RECORD);
  });

  it('should not record spans matching custom ignore patterns', () => {
    const customPattern = /^\/custom\//;
    const sampler = new FilteringTraceSampler({
      ignorePatterns: [customPattern],
    });

    const result = sampler.shouldSample(
      mockContext,
      mockTraceId,
      mockSpanName,
      mockSpanKind,
      {'next.route': '/custom/test'},
      mockLinks,
    );

    expect(result.decision).toBe(SamplingDecision.NOT_RECORD);
  });

  it('should record spans when no route attribute is present', () => {
    const sampler = new FilteringTraceSampler();

    const result = sampler.shouldSample(
      mockContext,
      mockTraceId,
      mockSpanName,
      mockSpanKind,
      {},
      mockLinks,
    );

    expect(result.decision).toBe(SamplingDecision.RECORD_AND_SAMPLED);
  });

  it('should return the correct string representation', () => {
    const sampler = new FilteringTraceSampler();
    expect(sampler.toString()).toBe('Code.org Trace Sampler');
  });
});
