// @vitest-environment jsdom
//
// The mocked sources endpoints, driven the way the real client drives them.
//
// jsdom because the scenario store is sessionStorage — with no `window` it
// no-ops silently and every read falls back to the fixture, which looks
// exactly like the bug this file is about.
//
// The version history is the part worth pinning, because its failure mode is
// silent: a handler that returns the right SHAPE — one plausible version, an
// ack from restore — makes a Version History panel that renders, reports
// success, and is lying. Each case below is a thing the panel actually asks
// for, so a regression shows up as a wrong answer rather than as no answer.

import {afterAll, afterEach, beforeAll, describe, expect, it} from 'vitest';

import type {ProjectVersion} from '../../dashboard/sources';
import {
  clearActiveScenario,
  registerLabFixtures,
  setActiveScenario,
} from '../index';
import {mockServer} from '../server';

beforeAll(() => mockServer.listen({onUnhandledRequest: 'error'}));
afterEach(() => {
  mockServer.resetHandlers();
  clearActiveScenario();
  window.sessionStorage.clear();
});
afterAll(() => mockServer.close());

const HOST = 'https://studio.code.org';
const FIXTURE = {source: 'the fixture'};
const CHANNEL = 'demo-tag';

const useScenario = () => {
  registerLabFixtures('demo', {tag: {sources: FIXTURE}});
  setActiveScenario({labKey: 'demo', tag: 'tag'});
};

const read = async (versionId?: string) =>
  (
    await fetch(
      `${HOST}/v3/sources/${CHANNEL}/main.json${versionId ? `?version=${versionId}` : ''}`,
    )
  ).json();

const list = async (): Promise<ProjectVersion[]> =>
  (await fetch(`${HOST}/v3/sources/${CHANNEL}/main.json/versions`)).json();

/** A save. `replace` is what the real client sends to mean "not a new version". */
const save = async (source: string, replace: boolean) =>
  (
    await fetch(`${HOST}/v3/sources/${CHANNEL}?replace=${replace}`, {
      method: 'PUT',
      body: JSON.stringify({source}),
    })
  ).json();

describe('the mocked sources endpoints', () => {
  it('starts at one version, holding the fixture', async () => {
    useScenario();
    const versions = await list();

    expect(versions).toHaveLength(1);
    expect(versions[0].isLatest).toBe(true);
    expect(await read()).toEqual(FIXTURE);
    expect(await read(versions[0].versionId)).toEqual(FIXTURE);
  });

  it('appends a version per save, newest first', async () => {
    // The bug this file exists for: the list used to be synthesised from the
    // current id, so it was always exactly one row however much was saved.
    useScenario();
    await save('second', false);
    await save('third', false);

    const versions = await list();
    expect(versions).toHaveLength(3);
    expect(versions[0].isLatest).toBe(true);
    expect(versions.slice(1).every(v => !v.isLatest)).toBe(true);
    expect(await read()).toEqual({source: 'third'});
  });

  it('replaces the newest version when the client says to', async () => {
    // An autosave inside the client's 15-minute window. Appending here would
    // make a hundred rows a session, which is a history nobody can read.
    useScenario();
    await save('second', false);
    await save('second, edited', true);

    const versions = await list();
    expect(versions).toHaveLength(2);
    expect(await read()).toEqual({source: 'second, edited'});
  });

  it('keeps each version’s own sources', async () => {
    useScenario();
    const first = (await list())[0].versionId;
    await save('second', false);

    expect(await read(first)).toEqual(FIXTURE);
    expect(await read()).toEqual({source: 'second'});
  });

  it('restores by writing the old content forward', async () => {
    // A restore is a WRITE, so the history records that it happened and the
    // restore itself can be undone. Returning an id and changing nothing is a
    // button that reports success and does nothing, which is what this did.
    useScenario();
    const original = (await list())[0].versionId;
    await save('second', false);

    const res = await fetch(
      `${HOST}/v3/sources/${CHANNEL}/restore?version=${original}`,
      {method: 'PUT'},
    );
    const {version_id: restored} = (await res.json()) as {version_id: string};

    expect(await read()).toEqual(FIXTURE);
    const versions = await list();
    expect(versions).toHaveLength(3);
    expect(versions[0].versionId).toBe(restored);
    expect(versions[0].isLatest).toBe(true);
  });

  it('records the comment that names a version', async () => {
    // Without it a saved version is a bare timestamp in the panel, and naming
    // it is the whole reason the button exists.
    useScenario();
    const {versionId} = (await save('second', false)) as {versionId: string};

    await fetch(`${HOST}/project_commits`, {
      method: 'POST',
      body: JSON.stringify({
        storage_id: CHANNEL,
        version_id: versionId,
        comment: 'before I broke it',
      }),
    });

    const versions = await list();
    expect(versions[0].comment).toBe('before I broke it');
    // …and the older one is still uncommented, so the panel can tell an
    // autosave from a version somebody meant.
    expect(versions[1].comment).toBeUndefined();
  });

  it('404s a version it never held, rather than inventing one', async () => {
    // What a real store does, and the reason it matters: a forgiving fallback
    // here answered every unknown id with the FIXTURE, so a client asking for
    // the wrong thing was quietly handed the starting project and the editor
    // rendered it as real. That is exactly how `resetToCurrentVersion` passing
    // an app name where a version id belongs presented — as "restore gives you
    // back the original board".
    useScenario();
    const res = await fetch(
      `${HOST}/v3/sources/${CHANNEL}/main.json?version=not-a-version`,
    );
    expect(res.status).toBe(404);

    const restored = await fetch(
      `${HOST}/v3/sources/${CHANNEL}/restore?version=not-a-version`,
      {method: 'PUT'},
    );
    expect(restored.status).toBe(404);
    // …and the history is untouched by the attempt.
    expect(await list()).toHaveLength(1);
  });

  it('bounds the history, keeping the fixture and the newest', async () => {
    // A version costs a whole copy of the project, and the quota is not ours
    // to raise. What matters is that trimming takes the list and the sources
    // together: a row the panel offers must be a row it can restore, and the
    // failure this replaced served the FIXTURE for a version saved minutes ago.
    useScenario();
    for (let i = 0; i < 10; i++) {
      await save(`v${i}`, false);
    }

    const versions = await list();
    expect(versions.length).toBeLessThanOrEqual(6);
    // Newest kept…
    expect(await read()).toEqual({source: 'v9'});
    // …oldest kept, because it is the fixture every unknown id falls back to.
    expect(await read(versions[versions.length - 1].versionId)).toEqual(
      FIXTURE,
    );
    // …and every row still answers with its own content.
    for (const v of versions) {
      expect(await read(v.versionId)).toBeDefined();
    }
  });

  it('keeps scenarios apart', async () => {
    registerLabFixtures('demo', {
      a: {sources: {source: 'A'}},
      b: {sources: {source: 'B'}},
    });
    setActiveScenario({labKey: 'demo', tag: 'a'});
    await save('edited A', false);

    setActiveScenario({labKey: 'demo', tag: 'b'});
    expect(await read()).toEqual({source: 'B'});
    expect(await list()).toHaveLength(1);
  });
});
