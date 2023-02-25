import {Source} from './types';
import {SOURCE_FILE} from './constants';

const rootUrl = (channelId: string) =>
  `/v3/sources/${channelId}/${SOURCE_FILE}`;

// TODO: what should we return if the request fails (404, 422, 500, etc)?
// maybe Promise<Source | Response>?
export async function get(channelId: string): Promise<Source> {
  const response = await fetch(rootUrl(channelId));
  return response.json();
}

export async function put(
  channelId: string,
  source: Source
): Promise<Response> {
  return fetch(rootUrl(channelId), {
    method: 'PUT',
    body: JSON.stringify(source)
  });
}
