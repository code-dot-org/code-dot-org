import {http, HttpResponse} from 'msw';

import type {ProjectSourcesAny, ProjectVersion} from '../dashboard/sources';

import {getActiveFixture} from './registry';
import {readResource, writeResource} from './scenarioStore';

const INITIAL_VERSION = 'mock-v1';

/**
 * One stored version: the sources as they were, plus when they were written.
 * Mock IDs are `mock-v1`, `mock-v2`, … so the list is meaningfully ordered
 * without depending on wall-clock time.
 */
interface StoredVersion {
  versionId: string;
  lastModified: string;
  sources: ProjectSourcesAny;
}

function defaultSources(): ProjectSourcesAny {
  return {source: ''};
}

/**
 * The version history, oldest first. Seeded on first read from the active
 * fixture's sources, so a scenario starts with exactly one version holding the
 * project it ships with.
 */
function versions(): StoredVersion[] {
  const stored = readResource<StoredVersion[]>('versions');
  if (stored?.length) {
    return stored;
  }
  const seed: StoredVersion[] = [
    {
      versionId: INITIAL_VERSION,
      lastModified: new Date().toISOString(),
      sources: getActiveFixture()?.sources ?? defaultSources(),
    },
  ];
  writeResource('versions', seed);
  return seed;
}

function latest(): StoredVersion {
  const all = versions();
  return all[all.length - 1];
}

function nextVersionId(current: string): string {
  const n = Number(current.replace(/\D+/g, '')) || 1;
  return `mock-v${n + 1}`;
}

export const sourcesHandlers = [
  // PUT /v3/sources/:channelId/restore?version=:versionId
  // Listed before the bare PUT so it wins the match. Restoring appends a new
  // version holding the old content, like the real backend — the history is
  // append-only, so restoring never drops the versions made after the target.
  http.put('*/v3/sources/:channelId/restore', ({request}) => {
    const requested = new URL(request.url).searchParams.get('version');
    const all = versions();
    const target = all.find(v => v.versionId === requested);
    if (!target) {
      return HttpResponse.json({version_id: latest().versionId});
    }
    const restored: StoredVersion = {
      versionId: nextVersionId(all[all.length - 1].versionId),
      lastModified: new Date().toISOString(),
      sources: target.sources,
    };
    writeResource('versions', [...all, restored]);
    return HttpResponse.json({version_id: restored.versionId});
  }),

  // GET /v3/sources/:channelId/:sourceFile/versions[?with_comments=true]
  // Newest first, matching the real API's ordering.
  http.get('*/v3/sources/:channelId/:sourceFile/versions', () => {
    const all = versions();
    const list: ProjectVersion[] = all
      .map((version, index) => ({
        versionId: version.versionId,
        lastModified: version.lastModified,
        isLatest: index === all.length - 1,
      }))
      .reverse();
    return HttpResponse.json(list);
  }),

  // GET /v3/sources/:channelId/:sourceFile[?version=:versionId]
  http.get('*/v3/sources/:channelId/:sourceFile', ({request}) => {
    const requested = new URL(request.url).searchParams.get('version');
    const version =
      (requested && versions().find(v => v.versionId === requested)) ||
      latest();
    return HttpResponse.json(version.sources, {
      headers: {'S3-Version-Id': version.versionId},
    });
  }),

  // PUT /v3/sources/:channelId[?replace=true&...]
  // Honors the client's `replace` flag: the ProjectManager replaces the current
  // version for saves inside its new-version interval and asks for a new one
  // otherwise, so the history grows the way it does against the real backend.
  http.put('*/v3/sources/:channelId', async ({request}) => {
    const body = (await request.json()) as ProjectSourcesAny;
    const replace = new URL(request.url).searchParams.get('replace') === 'true';
    const all = versions();
    const lastModified = new Date().toISOString();

    if (replace) {
      const current = all[all.length - 1];
      const updated = {...current, sources: body, lastModified};
      writeResource('versions', [...all.slice(0, -1), updated]);
      return HttpResponse.json({
        timestamp: lastModified,
        versionId: updated.versionId,
      });
    }

    const created: StoredVersion = {
      versionId: nextVersionId(all[all.length - 1].versionId),
      lastModified,
      sources: body,
    };
    writeResource('versions', [...all, created]);
    return HttpResponse.json({
      timestamp: lastModified,
      versionId: created.versionId,
    });
  }),
];
