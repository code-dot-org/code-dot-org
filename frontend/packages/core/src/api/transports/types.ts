export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type RequestOptions = {
  method: HttpMethod;
  url: string; // can be absolute or relative (transport decides)
  query?: Record<string, string | number | boolean | null | undefined>;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

export interface Transport {
  request<TResponse>(req: RequestOptions): Promise<TResponse>;
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
