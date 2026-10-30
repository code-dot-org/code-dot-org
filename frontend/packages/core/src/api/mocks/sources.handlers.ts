import {http, HttpResponse} from 'msw';

import type {ProjectSourcesAny, ProjectVersion} from '../dashboard/sources';

import {getActiveFixture} from './registry';
import {readResource, writeResource} from './scenarioStore';

const INITIAL_VERSION = 'mock-v1';

function defaultSources(): ProjectSourcesAny {
  return {source: ''};
}

function activeSources(): ProjectSourcesAny {
  return (
    readResource<ProjectSourcesAny>('sources') ??
    getActiveFixture()?.sources ??
    defaultSources()
  );
}

function activeVersion(): string {
  return readResource<string>('versionId') ?? INITIAL_VERSION;
}

function bumpVersion(current: string): string {
  // Mock IDs are `mock-v1`, `mock-v2`, … so the version list is meaningfully
  // ordered without depending on wall-clock time.
  const n = Number(current.replace(/\D+/g, '')) || 1;
  return `mock-v${n + 1}`;
}

export const sourcesHandlers = [
  // PUT /v3/sources/:channelId/restore?version=:versionId
  // Listed before the bare PUT so it wins the match.
  http.put('*/v3/sources/:channelId/restore', () => {
    return HttpResponse.json({version_id: activeVersion()});
  }),

  // GET /v3/sources/:channelId/:sourceFile/versions[?with_comments=true]
  http.get('*/v3/sources/:channelId/:sourceFile/versions', () => {
    const v: ProjectVersion = {
      versionId: activeVersion(),
      lastModified: new Date().toISOString(),
      isLatest: true,
    };
    return HttpResponse.json([v]);
  }),

  // GET /v3/sources/:channelId/:sourceFile
  http.get('*/v3/sources/:channelId/:sourceFile', () => {
    return HttpResponse.json(activeSources(), {
      headers: {'S3-Version-Id': activeVersion()},
    });
  }),

  // PUT /v3/sources/:channelId[?...]
  http.put('*/v3/sources/:channelId', async ({request}) => {
    const body = (await request.json()) as ProjectSourcesAny;
    writeResource('sources', body);
    const next = bumpVersion(activeVersion());
    writeResource('versionId', next);
    return HttpResponse.json({
      timestamp: new Date().toISOString(),
      versionId: next,
    });
  }),
];
