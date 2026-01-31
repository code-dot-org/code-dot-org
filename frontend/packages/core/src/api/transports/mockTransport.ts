// src/api/transports/mockTransport.ts
import {
  ApiError,
  type Transport,
  type RequestOptions,
  type ApiResponse,
  type ResponseMeta,
  type HttpMethod,
} from './types';

export type MockHandlerResult =
  | unknown
  | {data: unknown; meta?: Partial<ResponseMeta>};

export type MockHandler = (
  req: RequestOptions,
) => MockHandlerResult | Promise<MockHandlerResult>;

export type MockRoute = {
  method: HttpMethod;
  url: string | RegExp;
  handler: MockHandler;
};

export function createMockTransport(opts: {
  routes: MockRoute[];
  baseUrl?: string;
  latencyMs?: number | {min: number; max: number};
}): Transport {
  const {routes, baseUrl, latencyMs = 0} = opts;

  function normalize(url: string): string {
    if (!baseUrl) return url;
    const b = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return url.startsWith(b) ? url.slice(b.length) || '/' : url;
  }

  async function maybeSleep() {
    const ms =
      typeof latencyMs === 'number'
        ? latencyMs
        : Math.floor(
            latencyMs.min + Math.random() * (latencyMs.max - latencyMs.min),
          );
    if (ms > 0) await new Promise(r => setTimeout(r, ms));
  }

  return {
    async requestWithMeta<T>(req: RequestOptions): Promise<ApiResponse<T>> {
      await maybeSleep();

      const normalizedUrl = normalize(req.url);

      const route = routes.find(r => {
        if (r.method !== req.method) return false;
        return typeof r.url === 'string'
          ? r.url === normalizedUrl
          : r.url.test(normalizedUrl);
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

      // Allow handler to return either plain data or {data, meta}
      const {data, meta} =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result && typeof result === 'object' && 'data' in (result as any)
          ? (result as {data: unknown; meta?: Partial<ResponseMeta>})
          : {data: result, meta: undefined};

      const mergedMeta: ResponseMeta = {
        status: meta?.status ?? 200,
        url: meta?.url ?? normalizedUrl,
        headers: Object.fromEntries(
          Object.entries(meta?.headers ?? {}).map(([k, v]) => [
            k.toLowerCase(),
            v,
          ]),
        ),
      };

      return {data: data as T, meta: mergedMeta};
    },

    async request<T>(req: RequestOptions): Promise<T> {
      const {data} = await this.requestWithMeta<T>(req);
      return data;
    },
  };
}
