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
  return HttpClient.post(
    `${rootUrl}/${channel.id}`,
    JSON.stringify(channel),
    false,
    {
      'Content-Type': 'application/json; charset=UTF-8',
    }
  );
}

export async function publish(channel: Channel): Promise<Response> {
  return HttpClient.post(
    `${rootUrl}/${channel.id}/publish/${channel.projectType}`,
    '',
    false
  );
}

export async function unpublish(channel: Channel): Promise<Response> {
  return HttpClient.post(`${rootUrl}/${channel.id}/unpublish`, '', false);
}
