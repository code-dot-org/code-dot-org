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

  /** For endpoints that depend on headers/status/etc */
  requestWithMeta<TResponse>(
    req: RequestOptions,
  ): Promise<ApiResponse<TResponse>>;
}

/** A structured error so callers can inspect status / payload. */
export class ApiError extends Error {
  readonly status: number;
  readonly url: string;
  readonly method: HttpMethod;
  readonly details?: unknown;
  name = 'ApiError' as const;

  constructor(
    message: string,
    status: number,
    url: string,
    method: HttpMethod,
    details?: unknown,
  ) {
    super(message);

    this.status = status;
    this.url = url;
    this.method = method;
    this.details = details;
  }
}
