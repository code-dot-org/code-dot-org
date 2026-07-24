/**
 * API for getting and updating channels via the code.org dashboard. A channel contains
 * metadata about a project.
 */

import HttpClient from '@cdo/apps/util/HttpClient';

import {Channel} from '../types';

const rootUrl = '/v3/channels';

export type ShareFailureType = 'email' | 'phone' | 'address' | 'profanity';

export interface ShareFailure {
  type: ShareFailureType;
  // The offending text. Omitted by the server for profanity failures.
  content?: string;
}

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

export async function fetchAbuseScore(channelId: string): Promise<number> {
  const {value} = await HttpClient.fetchJson<{abuse_score: number}>(
    `${rootUrl}/${channelId}/abuse`
  );
  return value.abuse_score;
}

export async function fetchSharingDisabled(
  channelId: string
): Promise<boolean> {
  const {value} = await HttpClient.fetchJson<{sharing_disabled: boolean}>(
    `${rootUrl}/${channelId}/sharing_disabled`
  );
  return value.sharing_disabled;
}

export async function fetchPrivacyProfanityViolation(
  channelId: string
): Promise<boolean> {
  // The server responds with 0 (not false) when there is no violation.
  const {value} = await HttpClient.fetchJson<{has_violation: boolean | number}>(
    `${rootUrl}/${channelId}/privacy-profanity`
  );
  return !!value.has_violation;
}

export async function fetchShareFailure(
  channelId: string
): Promise<ShareFailure | null> {
  const {value} = await HttpClient.fetchJson<{
    share_failure: ShareFailure | false;
  }>(`${rootUrl}/${channelId}/share-failure`);
  return value.share_failure || null;
}

export async function fetchIsTeacherOfProjectOwner(
  channelId: string
): Promise<boolean> {
  const {value} = await HttpClient.fetchJson<{
    is_teacher_of_project_owner: boolean;
  }>(`${rootUrl}/${channelId}/is_teacher_of_project_owner`);
  return value.is_teacher_of_project_owner;
}
