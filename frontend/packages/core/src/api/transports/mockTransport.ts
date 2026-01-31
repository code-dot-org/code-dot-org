import {
  ApiError,
  type Transport,
  type RequestOptions,
  type HttpMethod,
} from './types';
import {toReplayKey} from './url';

export type MockHandler = (req: RequestOptions) => unknown | Promise<unknown>;

export type MockRoute = {
  method: HttpMethod;
  /** Exact match or regex. Prefer regex for params. */
  url: string | RegExp;
  handler: MockHandler;
};

export type MockTransportOptions = {
  routes: MockRoute[];
  baseUrl?: string; // if you want to strip a prefix
  latencyMs?: number | {min: number; max: number};
  /** e.g. 0.05 to throw random errors */
  errorRate?: number;
  /** deterministic seed behavior could be added later */
};

export function createMockTransport(opts: MockTransportOptions): Transport {
  const {routes, baseUrl, latencyMs = 0, errorRate = 0} = opts;

  return {
    async request<TResponse>(req: RequestOptions): Promise<TResponse> {
      maybeSleep(latencyMs);

      if (errorRate > 0 && Math.random() < errorRate) {
        throw new ApiError(
          `Mock error injected for ${toReplayKey(req)}`,
          500,
          req.url,
          req.method,
        );
      }

      const normalizedUrl = normalize(req.url, baseUrl);

      const route = routes.find(r => {
        if (r.method !== req.method) return false;
        if (typeof r.url === 'string') return r.url === normalizedUrl;
        return r.url.test(normalizedUrl);
      });

      if (!route) {
        throw new ApiError(
          `No mock route for ${req.method} ${normalizedUrl}`,
          404,
          normalizedUrl,
          req.method,
        );
      }

      const result = await route.handler({...req, url: normalizedUrl});
      return result as TResponse;
    },
  };
}

function normalize(url: string, baseUrl?: string): string {
  // If caller passes "/api/foo" and baseUrl is "/api", normalize to "/foo"
  if (!baseUrl) return url;
  const b = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return url.startsWith(b) ? url.slice(b.length) || '/' : url;
}

async function maybeSleep(latency: number | {min: number; max: number}) {
  const ms =
    typeof latency === 'number'
      ? latency
      : Math.floor(latency.min + Math.random() * (latency.max - latency.min));
  if (ms <= 0) return;
  await new Promise(r => setTimeout(r, ms));
}
