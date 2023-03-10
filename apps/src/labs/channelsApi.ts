import {Channel, NewChannel} from './types';

const rootUrl = '/v3/channels';

// TODO: what should we return if the request fails (404, 422, 500, etc)?
// maybe Promise<Channel | Response>?
export async function get(channelId: string): Promise<Channel> {
  const response = await fetch(`${rootUrl}/${channelId}`);
  return response.json();
}

// TODO: do we need contentType header?
// TODO: add correct type for queryParams
export async function create(
  channel: NewChannel,
  queryParams: string
): Promise<Response> {
  return fetch(`${rootUrl}?${queryParams}`, {
    method: 'POST',
    body: JSON.stringify(channel)
  });
}

export async function update(channel: Channel): Promise<Response> {
  return fetch(`${rootUrl}/${channel.id}`, {
    method: 'POST',
    body: JSON.stringify(channel)
  });
}
