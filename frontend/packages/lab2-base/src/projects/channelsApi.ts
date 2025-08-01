/**
 * API for getting and updating channels via the code.org dashboard. A channel contains
 * metadata about a project.
 */

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
    method: 'POST',
    body: JSON.stringify(channel),
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    },
  });
}

export async function publish(channel: Channel): Promise<Response> {
  return fetch(`${rootUrl}/${channel.id}/publish/${channel.projectType}`, {
    method: 'POST',
    body: '',
  });
}

export async function unpublish(channel: Channel): Promise<Response> {
  return fetch(`${rootUrl}/${channel.id}/unpublish`, {
    method: 'POST',
    body: '',
  });
}

export async function fetchAbuseScore(channelId: string): Promise<number> {
  const response = await fetch(`${rootUrl}/${channelId}/abuse`);
  const json = await response.json();
  const value: {abuse_score: number} = json;
  return value.abuse_score;
}

export async function fetchSharingDisabled(
  channelId: string
): Promise<boolean> {
  const response = await fetch(`${rootUrl}/${channelId}/sharing_disabled`);
  const json = await response.json();
  const value: {sharing_disabled: boolean} = json;
  return value.sharing_disabled;
}
