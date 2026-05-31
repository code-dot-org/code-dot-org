import {http, HttpResponse} from 'msw';

import type {Channel} from '../dashboard/channels';
import {ProjectTypes, type ProjectType} from '../dashboard/projects';

import {getActiveFixture} from './registry';
import {getActiveScenario} from './scenario';
import {readResource, writeResource} from './scenarioStore';

function isProjectType(value: string): value is ProjectType {
  return (ProjectTypes as readonly string[]).includes(value);
}

/**
 * Build a sensible Channel from the channelId when no fixture is registered.
 * The lab key (when it matches a known project type) seeds `projectType`.
 */
function defaultChannel(channelId: string): Channel {
  const now = new Date().toISOString();
  const labKey = getActiveScenario()?.labKey ?? '';
  return {
    id: channelId,
    name: `Mock ${labKey || 'project'} (${channelId})`,
    isOwner: true,
    projectType: isProjectType(labKey) ? labKey : 'unknown',
    publishedAt: null,
    createdAt: now,
    updatedAt: now,
    frozen: null,
  };
}

/**
 * Active channel = stored override (latest write-through) ∥ fixture.channel
 * ∥ `defaultChannel(channelId)`.
 */
function activeChannel(channelId: string): Channel {
  return (
    readResource<Channel>('channel') ??
    getActiveFixture()?.channel ??
    defaultChannel(channelId)
  );
}

export const channelsHandlers = [
  // GET /v3/channels/:channelId
  http.get('*/v3/channels/:channelId', ({params}) => {
    return HttpResponse.json(activeChannel(params.channelId as string));
  }),

  // POST /v3/channels/:channelId — update
  http.post('*/v3/channels/:channelId', async ({params, request}) => {
    const update = (await request.json()) as Partial<Channel>;
    const channelId = params.channelId as string;
    const merged: Channel = {
      ...activeChannel(channelId),
      ...update,
      id: channelId,
      updatedAt: new Date().toISOString(),
    };
    writeResource('channel', merged);
    return HttpResponse.json(merged);
  }),

  // POST /v3/channels/:channelId/publish/:projectType
  http.post('*/v3/channels/:channelId/publish/:projectType', ({params}) => {
    const channelId = params.channelId as string;
    const updated: Channel = {
      ...activeChannel(channelId),
      publishedAt: new Date().toISOString(),
    };
    writeResource('channel', updated);
    return HttpResponse.json(updated);
  }),

  // POST /v3/channels/:channelId/unpublish
  http.post('*/v3/channels/:channelId/unpublish', ({params}) => {
    const channelId = params.channelId as string;
    const updated: Channel = {
      ...activeChannel(channelId),
      publishedAt: null,
    };
    writeResource('channel', updated);
    return HttpResponse.json(updated);
  }),

  // GET /v3/channels/:channelId/abuse
  http.get('*/v3/channels/:channelId/abuse', () => {
    const abuseScore = readResource<number>('abuse_score') ?? 0;
    return HttpResponse.json({abuse_score: abuseScore});
  }),

  // POST /v3/channels/:channelId/abuse/delete
  http.post('*/v3/channels/:channelId/abuse/delete', () => {
    writeResource('abuse_score', 0);
    return HttpResponse.json({});
  }),

  // GET /v3/channels/:channelId/sharing_disabled
  http.get('*/v3/channels/:channelId/sharing_disabled', () => {
    return HttpResponse.json({sharing_disabled: false});
  }),

  // GET /v3/channels/:channelId/is_teacher_of_project_owner
  http.get('*/v3/channels/:channelId/is_teacher_of_project_owner', () => {
    return HttpResponse.json({is_teacher_of_project_owner: false});
  }),
];
