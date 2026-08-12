// The sources endpoints, with a version history that behaves like one.
//
// This used to keep a single `versionId` and bump it on every write, and
// synthesise the version LIST from it — one row, always the newest. Which meant
// a mocked lab could save all day and its Version History panel stayed empty
// except for "Current Version", restoring an old version did nothing at all,
// and a named version lost its name. All three read as bugs in the panel.
//
// So the store keeps what a version history actually is: an ordered list, and
// the sources each entry holds. Everything below is a small, honest model of
// the real endpoints rather than a stub that returns the right SHAPE.
//
// The one behaviour worth naming, because a stub would never guess it: the
// client decides whether a save makes a new version. It sends `replace=true`
// for an autosave inside its 15-minute window (the version is updated in place)
// and `replace=false` when the student asked for one (a new version is
// appended) — see `labs/base` SourcesStore. A mock that always appended would
// show a hundred rows a session; one that never did shows none.

import {http, HttpResponse} from 'msw';

import type {ProjectSourcesAny, ProjectVersion} from '../dashboard/sources';

import {getActiveFixture} from './registry';
import {readResource, writeResource} from './scenarioStore';

/** The version a scenario starts at — the fixture, before anything is saved. */
const INITIAL_VERSION = 'mock-v1';

/** One stored version. `isLatest` is computed on read, so it is not kept here. */
interface StoredVersion {
  versionId: string;
  lastModified: string;
  comment?: string;
}

function defaultSources(): ProjectSourcesAny {
  return {source: ''};
}

/** The fixture's own sources — what version one holds, and never changes. */
function fixtureSources(): ProjectSourcesAny {
  return getActiveFixture()?.sources ?? defaultSources();
}

/**
 * The version list, oldest first, seeded from the fixture on first touch.
 *
 * Lazily rather than at registration because a scenario's store is keyed by the
 * active `{labKey, tag}`, and that is not known until a request arrives.
 */
function versions(): StoredVersion[] {
  const stored = readResource<StoredVersion[]>('versions');
  if (stored?.length) {
    return stored;
  }
  const seeded: StoredVersion[] = [
    {versionId: INITIAL_VERSION, lastModified: new Date().toISOString()},
  ];
  writeResource('versions', seeded);
  writeResource('versionSources', {[INITIAL_VERSION]: fixtureSources()});
  return seeded;
}

function sourcesByVersion(): Record<string, ProjectSourcesAny> {
  return (
    readResource<Record<string, ProjectSourcesAny>>('versionSources') ?? {
      [INITIAL_VERSION]: fixtureSources(),
    }
  );
}

/** The newest version's id — what an unqualified read and write refer to. */
function activeVersion(): string {
  const list = versions();
  return list[list.length - 1]?.versionId ?? INITIAL_VERSION;
}

function sourcesAt(versionId: string): ProjectSourcesAny {
  return (
    sourcesByVersion()[versionId] ??
    // A version nothing was stored for is the fixture: it is the only content
    // that predates the store.
    fixtureSources()
  );
}

function nextVersionId(): string {
  // `mock-v1`, `mock-v2`, … so the list is meaningfully ordered without
  // depending on wall-clock time.
  const n = Number(activeVersion().replace(/\D+/g, '')) || 1;
  return `mock-v${n + 1}`;
}

/** Write `sources` as a new version, or over the newest one. */
function record(
  sources: ProjectSourcesAny,
  {replace}: {replace: boolean},
): StoredVersion {
  const list = versions();
  const byVersion = sourcesByVersion();
  const lastModified = new Date().toISOString();

  const entry: StoredVersion = replace
    ? {...list[list.length - 1], lastModified}
    : {versionId: nextVersionId(), lastModified};

  const next = replace ? [...list.slice(0, -1), entry] : [...list, entry];
  writeResource('versions', next);
  writeResource('versionSources', {...byVersion, [entry.versionId]: sources});
  // Kept in step for anything still reading these directly.
  writeResource('sources', sources);
  writeResource('versionId', entry.versionId);
  return entry;
}

/** Attach a comment to a version — what makes it a NAMED version in the panel. */
export function commentOnVersion(versionId: string, comment: string): void {
  const list = versions();
  writeResource(
    'versions',
    list.map(v => (v.versionId === versionId ? {...v, comment} : v)),
  );
}

export const sourcesHandlers = [
  // PUT /v3/sources/:channelId/restore?version=:versionId
  // Listed before the bare PUT so it wins the match.
  //
  // A restore is a WRITE: the old content becomes the newest version, so the
  // history keeps the fact that it happened and "undo the restore" is just
  // restoring the version before it. Returning the old id and changing nothing
  // — which this did — is a button that reports success and does nothing.
  http.put('*/v3/sources/:channelId/restore', ({request}) => {
    const wanted = new URL(request.url).searchParams.get('version');
    if (!wanted) {
      return HttpResponse.json({version_id: activeVersion()});
    }
    const entry = record(sourcesAt(wanted), {replace: false});
    return HttpResponse.json({version_id: entry.versionId});
  }),

  // GET /v3/sources/:channelId/:sourceFile/versions[?with_comments=true]
  http.get('*/v3/sources/:channelId/:sourceFile/versions', () => {
    const list = versions();
    const latest = list[list.length - 1]?.versionId;
    // Newest first, which is the order the panel renders them in.
    const payload: ProjectVersion[] = [...list].reverse().map(v => ({
      versionId: v.versionId,
      lastModified: v.lastModified,
      isLatest: v.versionId === latest,
      ...(v.comment ? {comment: v.comment} : {}),
    }));
    return HttpResponse.json(payload);
  }),

  // GET /v3/sources/:channelId/:sourceFile[?version=:versionId]
  http.get('*/v3/sources/:channelId/:sourceFile', ({request}) => {
    const wanted = new URL(request.url).searchParams.get('version');
    const versionId = wanted ?? activeVersion();
    return HttpResponse.json(sourcesAt(versionId), {
      headers: {'S3-Version-Id': versionId},
    });
  }),

  // PUT /v3/sources/:channelId[?...&replace=<bool>]
  http.put('*/v3/sources/:channelId', async ({request}) => {
    const body = (await request.json()) as ProjectSourcesAny;
    // Absent on a project's very first save, when the client has no version to
    // replace — that one appends, which is what seeds the history.
    const replace = new URL(request.url).searchParams.get('replace') === 'true';
    const entry = record(body, {replace});
    return HttpResponse.json({
      timestamp: entry.lastModified,
      versionId: entry.versionId,
    });
  }),
];
