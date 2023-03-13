import {Channel, NewChannel} from './types';

const rootUrl = '/v3/channels';

// TODO: what should we return if the request fails (404, 422, 500, etc)?
// maybe Promise<Channel | Response>?
export async function get(channelId: string): Promise<Channel> {
  const response = await fetch(`${rootUrl}/${channelId}`);
  return response.json();
}

export async function create(channel: NewChannel): Promise<Response> {
  return fetch(rootUrl, {
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
