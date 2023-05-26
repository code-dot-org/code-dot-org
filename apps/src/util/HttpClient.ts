import {
  AUTHENTICITY_TOKEN_HEADER,
  getAuthenticityToken,
} from './AuthenticityTokenStore';

/**
 * Get a JSON response from the given endpoint and
 * return it as the specified type. Can also perform
 * response validation if provided a validator function.
 */
export async function getJson<ResponseType>(
  endpoint: string,
  init?: RequestInit,
  validator?: ResponseValidator<ResponseType>
): Promise<GetResponse<ResponseType>> {
  const response = await fetch(endpoint, init);
  if (!response.ok) {
    throw new Error(response.status + ' ' + response.statusText);
  }

  const json = await response.json();
  let value = json;

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
export async function post(
  endpoint: string,
  body: string,
  useAuthenticityToken = false,
  headers: Record<string, string> = {}
): Promise<Response> {
  if (useAuthenticityToken) {
    const token = await getAuthenticityToken();
    headers[AUTHENTICITY_TOKEN_HEADER] = token;
  }

  return fetch(endpoint, {
    method: 'POST',
    body,
    headers,
  });
}

export type ResponseValidator<ResponseType> = (
  bodyJson: Record<string, unknown>
) => ResponseType;

export type GetResponse<ResponseType> = {
  value: ResponseType;
  response: Response;
};
