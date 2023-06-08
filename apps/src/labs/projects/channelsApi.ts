/**
 * API for getting and updating channels via the code.org dashboard. A channel contains
 * metadata about a project.
 */

import HttpClient from '@cdo/apps/util/HttpClient';
import {Channel} from '../types';

const rootUrl = '/v3/channels';

export async function get(channelId: string): Promise<Channel> {
  return (await HttpClient.fetchJson<Channel>(`${rootUrl}/${channelId}`)).value;
}

export async function update(channel: Channel): Promise<Response> {
  return HttpClient.post(
    `${rootUrl}/${channel.id}`,
    JSON.stringify(channel),
    false,
    {
      'Content-Type': 'application/json; charset=utf-8',
    }
  );
}
