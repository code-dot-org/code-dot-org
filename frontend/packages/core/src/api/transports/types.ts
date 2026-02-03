export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type RequestOptions = {
  method: HttpMethod;
  url: string;
  query?: Record<string, string | number | boolean | null | undefined>;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

export type ResponseMeta = {
  status: number;
  /** Header names normalized to lowercase for easier lookup */
  headers: Record<string, string>;
  /** Final resolved URL (useful when baseUrl/proxy rewrites) */
  url: string;
};

export type ApiResponse<T> = {
  data: T;
  meta: ResponseMeta;
};

export interface Transport {
  /** Convenience for “just give me the data” */
  request<TResponse>(req: RequestOptions): Promise<TResponse>;

  /** Convenience for “just give me the blob” */
  requestBlob(req: RequestOptions): Promise<Blob>;

  /** For endpoints that depend on headers/status/etc */
  requestWithMeta<TResponse>(
    req: RequestOptions,
    blob?: boolean,
  ): Promise<ApiResponse<TResponse>>;
}

export interface ApiErrorDetails {
  /** HTTP Status of response */
  status: number;
  /** Any human-readable status text reported */
  statusText?: string;
  /** URL of the request */
  url: string;
  /** Method uses (GET, POST) */
  method: HttpMethod;
  /** Type of response (basic, cors, etc) */
  type?: string;
  /** Response headers, if any */
  headers: Record<string, string>;
}

/** A structured error so callers can inspect status / payload. */
export class ApiError extends Error {
  readonly status: number;
  readonly statusText?: string;
  readonly url: string;
  readonly method: HttpMethod;
  readonly type?: string;
  readonly details?: unknown;
  readonly headers?: Headers;
  name = 'ApiError' as const;

  constructor(
    message: string,
    details: {
      status: number;
      statusText?: string;
      type?: string;
      url: string;
      method: HttpMethod;
      headers?: Headers;
    },
  ) {
    super(message);

    this.status = details.status;
    this.statusText = details.statusText;
    this.type = details.type;
    this.url = details.url;
    this.method = details.method;
    this.headers = details.headers;
  }

  getDetails(): ApiErrorDetails {
    // Convert Headers() to a hash
    const headers = (
      Array.from(this.headers || new Headers()) as [string, string][]
    ).reduce(
      (a, b) => {
        a[b[0]] = b[1];
        return a;
      },
      {} as Record<string, string>,
    );

    return {
      status: this.status,
      statusText: this.statusText,
      url: this.url,
      type: this.type,
      method: this.method,
      headers,
    };
  }
}
