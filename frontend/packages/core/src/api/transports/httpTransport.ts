import {
  ApiError,
  type Transport,
  type RequestOptions,
  type ApiResponse,
  type ResponseMeta,
} from './types';
import {buildUrl} from './url';

export function createHttpTransport(opts: {
  baseUrl?: string;
  credentials?: RequestCredentials;
  defaultHeaders?: Record<string, string>;
  getCsrfToken?: () => string | null;
}): Transport {
  const {
    baseUrl,
    credentials = 'same-origin',
    defaultHeaders,
    getCsrfToken,
  } = opts;

  async function doFetch(
    req: RequestOptions,
  ): Promise<{res: Response; url: string}> {
    const url = buildUrl(baseUrl, req);

    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...defaultHeaders,
      ...req.headers,
    };

    const isFormData =
      typeof FormData !== 'undefined' && req.body instanceof FormData;
    const hasBody = req.body !== undefined && req.body !== null;

    if (hasBody && !isFormData) headers['Content-Type'] ||= 'application/json';

    if (req.method !== 'GET') {
      const token = getCsrfToken?.();
      if (token) headers['X-CSRF-Token'] = token;
    }

    const res = await fetch(url, {
      method: req.method,
      credentials,
      headers,
      body: hasBody
        ? isFormData
          ? (req.body as FormData)
          : JSON.stringify(req.body)
        : undefined,
      signal: req.signal,
    });

    return {res, url};
  }

  async function parseResponse(
    res: Response,
    blob?: boolean,
  ): Promise<unknown> {
    const contentType = res.headers.get('content-type') ?? '';
    const isJson = contentType.includes('application/json');

    if (res.status === 204) return undefined;

    try {
      return blob
        ? await res.blob()
        : isJson
          ? await res.json()
          : await res.text();
    } catch {
      return undefined;
    }
  }

  function extractMeta(res: Response, url: string): ResponseMeta {
    const headers: Record<string, string> = {};
    res.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });
    return {status: res.status, headers, url};
  }

  return {
    async requestWithMeta<T>(
      req: RequestOptions,
      blob?: boolean,
    ): Promise<ApiResponse<T>> {
      const {res, url} = await doFetch(req);
      const meta = extractMeta(res, url);
      const payload = await parseResponse(res, blob);

      if (!res.ok) {
        throw new ApiError(
          `Request failed: ${req.method} ${url} -> ${res.status}`,
          {
            status: res.status,
            statusText: res.statusText,
            type: res.type,
            url,
            method: req.method,
            headers: res.headers,
          },
        );
      }

      return {data: payload as T, meta};
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
