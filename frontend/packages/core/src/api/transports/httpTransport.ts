import {ApiError, type Transport, type RequestOptions} from './types';
import {buildUrl} from './url';

export type HttpTransportOptions = {
  baseUrl?: string; // e.g. "/api" or "https://example.com"
  credentials?: RequestCredentials; // default "same-origin"
  defaultHeaders?: Record<string, string>;
  // Optional hooks for Rails specifics
  getCsrfToken?: () => string | null; // read from <meta name="csrf-token" ...> etc
  onUnauthorized?: (err: ApiError) => void; // e.g. redirect to sign in
};

export function createHttpTransport(
  opts: HttpTransportOptions = {},
): Transport {
  const {
    baseUrl,
    credentials = 'same-origin',
    defaultHeaders,
    getCsrfToken,
    onUnauthorized,
  } = opts;

  return {
    async request<TResponse>(req: RequestOptions): Promise<TResponse> {
      const url = buildUrl(baseUrl, req);

      const headers: Record<string, string> = {
        Accept: 'application/json',
        ...defaultHeaders,
        ...req.headers,
      };

      // Assume JSON for non-FormData bodies
      const isFormData =
        typeof FormData !== 'undefined' && req.body instanceof FormData;
      const hasBody = req.body !== undefined && req.body !== null;

      if (hasBody && !isFormData) {
        headers['Content-Type'] ||= 'application/json';
      }

      // Rails CSRF token for non-GET requests (if same-origin)
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

      // Parse response (JSON preferred, but don’t crash if empty)
      const contentType = res.headers.get('content-type') ?? '';
      const isJson = contentType.includes('application/json');

      let payload: unknown = undefined;
      if (res.status !== 204) {
        try {
          payload = isJson ? await res.json() : await res.text();
        } catch {
          payload = undefined;
        }
      }

      if (!res.ok) {
        const err = new ApiError(
          `Request failed: ${req.method} ${url} -> ${res.status}`,
          res.status,
          url,
          req.method,
          payload,
        );

        if (res.status === 401) onUnauthorized?.(err);
        throw err;
      }

      return payload as TResponse;
    },
  };
}
