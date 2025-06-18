import {Attributes, Context, Link, SpanKind} from '@opentelemetry/api';
import {
  AlwaysOnSampler,
  type Sampler,
  SamplingDecision,
  type SamplingResult,
} from '@opentelemetry/sdk-trace-node';
import {SEMATTRS_HTTP_TARGET} from '@opentelemetry/semantic-conventions';

/**
 * FilteringTraceSampler is a custom OTEL Sampler that filters out spans based on specific patterns.
 * Some traces contain attributes that are noisy and end up increasing the amount of data being ingested by OTEL collectors.
 * Use this sampler to filter out traces that are not relevant for analysis.
 *
 * If traces should be sampled, the base sampler is subsequently used to determine if the trace should be recorded.
 */
export class FilteringTraceSampler implements Sampler {
  static readonly DEFAULT_IGNORE_PATTERNS = [
    /^\/_next\//,
    /^\/images\//,
    /(\/apps\/marketing\/src\/app)?\/api\/health_check(\/route)?/,
  ];

  private readonly baseSampler: Sampler;
  private readonly ignorePatterns: RegExp[];

  constructor(props: {base?: Sampler; ignorePatterns?: RegExp[]} = {}) {
    this.baseSampler = props.base ?? new AlwaysOnSampler();

    this.ignorePatterns =
      props.ignorePatterns || FilteringTraceSampler.DEFAULT_IGNORE_PATTERNS;
  }

  shouldSample(
    context: Context,
    traceId: string,
    spanName: string,
    spanKind: SpanKind,
    attributes: Attributes,
    links: Link[],
  ): SamplingResult {
    const nextRoute =
      this.getAttributeValue(attributes, 'next.route') ??
      this.getAttributeValue(attributes, SEMATTRS_HTTP_TARGET);

    if (
      this.isIgnoredRoute(nextRoute) ||
      this.getAttributeValue(attributes, 'next.span_type') ===
        'NextNodeServer.startResponse'
    ) {
      return {decision: SamplingDecision.NOT_RECORD};
    }

    return this.baseSampler.shouldSample(
      context,
      traceId,
      spanName,
      spanKind,
      attributes,
      links,
    );
  }

  private isIgnoredRoute(route?: string): boolean {
    if (!route) return false;
    return this.ignorePatterns.some(re => re.test(route));
  }

  private getAttributeValue(
    attributes: Attributes,
    attribute: string,
  ): string | undefined {
    const value = attributes[attribute];
    if (typeof value === 'string') return value;
    return undefined;
  }

  toString(): string {
    return 'Code.org Trace Sampler';
  }
}
