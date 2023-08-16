import {
  AUTHENTICITY_TOKEN_HEADER,
  getAuthenticityToken,
} from './AuthenticityTokenStore';

export type ResponseValidator<ResponseType> = (
  bodyJson: object
) => ResponseType;

export type GetResponse<ResponseType> = {
  value: ResponseType;
  response: Response;
};

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
    throw new Error(response.status + ' ' + response.statusText);
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
    throw new Error(response.status + ' ' + response.statusText);
  }

  return response;
}

export default {
  fetchJson,
  post,
};
