import {
  AUTHENTICITY_TOKEN_HEADER,
  getAuthenticityToken,
} from './AuthenticityTokenStore';

export type ResponseValidator<ResponseType> = (
  bodyJson: Record<string, unknown>
) => ResponseType;

export type GetResponse<ResponseType> = {
  value: ResponseType;
  response: Response;
};

/**
 * Error thrown by these functions when the response is not ok, which includes a
 * reference to the response object.
 */
export class NetworkError extends Error {
  constructor(message: string, public response: Response) {
    super(message);
    this.name = 'NetworkError';

    // Needed for TypeScript to register this class correctly in ES5
    // https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, NetworkError.prototype);
  }

  getDetails() {
    const headers: {[key: string]: string} = {};
    this.response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    return {
      status: this.response.status,
      statusText: this.response.statusText,
      url: this.response.url,
      type: this.response.type,
      headers,
    };
  }
}

/**
 * Get a JSON response from the given endpoint and
 * return it as the specified type. Can also perform
 * response validation if provided a validator function.
 */
async function fetchJson<ResponseType>(
  endpoint: string,
  init?: RequestInit,
  validator?: ResponseValidator<ResponseType>
): Promise<GetResponse<ResponseType>> {
  const response = await fetch(endpoint, init);
  if (!response.ok) {
    throw new NetworkError(
      response.status + ' ' + response.statusText,
      response
    );
  }

  const json = await response.json();
  let value: ResponseType = json;

  if (validator) {
    value = validator(json);
  }

  return {
    value,
    response,
  };
}

/**
 * POST to the given endpoint. Adds the Rails authenticity
 * token if useAuthenticityToken is true.
 */
async function post(
  endpoint: string,
  body: string,
  useAuthenticityToken = false,
  headers: Record<string, string> = {}
): Promise<Response> {
  if (useAuthenticityToken) {
    const token = await getAuthenticityToken();
    headers[AUTHENTICITY_TOKEN_HEADER] = token;
  }
  const response = await fetch(endpoint, {
    method: 'POST',
    body,
    headers,
  });
  if (!response.ok) {
    throw new NetworkError(
      response.status + ' ' + response.statusText,
      response
    );
  }

  return response;
}

export default {
  fetchJson,
  post,
};
