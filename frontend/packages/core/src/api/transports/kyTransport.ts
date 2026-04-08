import ky, {type Options as KyOptions, type KyInstance, HTTPError} from 'ky';
import {
  ApiError,
  type Transport,
  type RequestOptions,
  type ApiResponse,
  type ResponseMeta,
} from './types';

export function createKyTransport(opts: {
  baseUrl?: string;
  credentials?: RequestCredentials;
  defaultHeaders?: Record<string, string>;
  getCsrfToken?: () => string | null;
  kyOptions?: KyOptions;
}): Transport {
  const {
    baseUrl,
    credentials = 'same-origin',
    defaultHeaders,
    getCsrfToken,
    kyOptions,
  } = opts;

  const instance: KyInstance = ky.create({
    prefixUrl: baseUrl || undefined,
    credentials,
    headers: defaultHeaders,
    retry: 0,
    ...kyOptions,
  });

  function buildSearchParams(
    query?: RequestOptions['query'],
  ): URLSearchParams | undefined {
    if (!query) return undefined;
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null) continue;
      params.set(k, String(v));
    }
    return params;
  }

  function extractMeta(res: Response, url: string): ResponseMeta {
    const headers: Record<string, string> = {};
    res.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });
    return {status: res.status, headers, url};
  }

  async function toApiError(
    error: HTTPError,
    req: RequestOptions,
  ): Promise<ApiError> {
    const res = error.response;
    return new ApiError(
      `Request failed: ${req.method} ${res.url} -> ${res.status}`,
      {
        status: res.status,
        statusText: res.statusText,
        type: res.type,
        url: res.url,
        method: req.method,
        headers: res.headers,
      },
    );
  }

  async function doRequest(
    req: RequestOptions,
    blob?: boolean,
  ): Promise<ApiResponse<unknown>> {
    const headers: Record<string, string> = {...req.headers};

    const isFormData =
      typeof FormData !== 'undefined' && req.body instanceof FormData;
    const hasBody = req.body !== undefined && req.body !== null;

    if (hasBody && !isFormData) headers['Content-Type'] ||= 'application/json';

    if (req.method !== 'GET') {
      const token = getCsrfToken?.();
      if (token) headers['X-CSRF-Token'] = token;
    }

    const isAbsolute = req.url.startsWith('http');
    // Strip leading slash — ky joins prefixUrl + input and a leading slash
    // would make it relative to the origin, bypassing prefixUrl.
    const input = isAbsolute
      ? req.url
      : req.url.startsWith('/')
        ? req.url.slice(1)
        : req.url;

    const kyOpts: KyOptions = {
      method: req.method,
      headers,
      searchParams: buildSearchParams(req.query),
      signal: req.signal,
      ...(hasBody &&
        (isFormData ? {body: req.body as FormData} : {json: req.body})),
    };

    try {
      // ky throws when prefixUrl is set and input is an absolute URL,
      // so bypass the instance for cross-domain requests.
      const res = isAbsolute
        ? await ky(input, kyOpts)
        : await instance(input, kyOpts);
      const meta = extractMeta(res, res.url);

      let data: unknown;
      if (res.status === 204) {
        data = undefined;
      } else if (blob) {
        data = await res.blob();
      } else {
        const contentType = res.headers.get('content-type') ?? '';
        data = contentType.includes('application/json')
          ? await res.json()
          : await res.text();
      }

      return {data, meta};
    } catch (error) {
      if (error instanceof HTTPError) {
        throw await toApiError(error, req);
      }
      throw error;
    }
  }

  return {
    async requestWithMeta<T>(
      req: RequestOptions,
      blob?: boolean,
    ): Promise<ApiResponse<T>> {
      const result = await doRequest(req, blob);
      return result as ApiResponse<T>;
    },

    async request<T>(req: RequestOptions): Promise<T> {
      const {data} = await this.requestWithMeta<T>(req);
      return data;
    },

    async requestBlob(req: RequestOptions): Promise<Blob> {
      const {data} = await this.requestWithMeta<Blob>(req, true);
      return data;
    },
  };
}
