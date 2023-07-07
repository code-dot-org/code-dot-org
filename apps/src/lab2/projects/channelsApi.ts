/**
 * API for getting and updating channels via the code.org dashboard. A channel contains
 * metadata about a project.
 */

import HttpClient from '@cdo/apps/util/HttpClient';
import {Channel} from '../types';

const rootUrl = '/v3/channels';

export async function get(channelId: string): Promise<Channel> {
  const {value} = await HttpClient.fetchJson<Channel>(
    `${rootUrl}/${channelId}`
  );
  return value;
}

export async function update(channel: Channel): Promise<Response> {
  return fetch(`${rootUrl}/${channel.id}`, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    method: 'POST',
    body: JSON.stringify(channel),
  });
}
