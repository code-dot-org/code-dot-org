import {Channel} from './types';

const rootUrl = '/v3/channels';

export async function get(channelId: string): Promise<Response> {
  return fetch(`${rootUrl}/${channelId}`);
}

export async function update(channel: Channel): Promise<Response> {
  return fetch(`${rootUrl}/${channel.id}`, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    method: 'POST',
    body: JSON.stringify(channel)
  });
}
