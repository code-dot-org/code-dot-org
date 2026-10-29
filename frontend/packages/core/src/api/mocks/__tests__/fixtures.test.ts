// End-to-end coverage for the generic mock fixtures: register routes for a
// scenario, then drive real `fetch` against the MSW node server and assert the
// dispatcher serves them (and falls through to the default handlers when it
// shouldn't).

import {afterAll, afterEach, beforeAll, describe, expect, it} from 'vitest';

import {
  clearActiveScenario,
  clearMockFixtures,
  registerMockFixture,
  setActiveScenario,
} from '../index';
import {mockServer} from '../server';

beforeAll(() => mockServer.listen({onUnhandledRequest: 'error'}));
afterEach(() => {
  mockServer.resetHandlers();
  clearMockFixtures();
  clearActiveScenario();
});
afterAll(() => mockServer.close());

const get = (path: string) => fetch(`https://studio.code.org${path}`);

describe('registerMockFixture', () => {
  it('serves a static body for the active scenario', async () => {
    registerMockFixture(
      {labKey: 'demo', tag: 'a'},
      {path: '*/api/widget', respond: {ok: true}},
    );
    setActiveScenario({labKey: 'demo', tag: 'a'});

    const res = await get('/api/widget');
    expect(await res.json()).toEqual({ok: true});
  });

  it('passes path params and request to a function responder', async () => {
    registerMockFixture(
      {labKey: 'demo', tag: 'a'},
      {
        method: 'post',
        path: '*/api/echo/:id',
        respond: async ({params, request}) => ({
          id: params.id,
          body: await request.json(),
        }),
      },
    );
    setActiveScenario({labKey: 'demo', tag: 'a'});

    const res = await fetch('https://studio.code.org/api/echo/42', {
      method: 'POST',
      body: JSON.stringify({hello: 'world'}),
    });
    expect(await res.json()).toEqual({id: '42', body: {hello: 'world'}});
  });

  it('isolates routes by scenario', async () => {
    // Override a path that has a default handler, so a non-match falls through
    // to the known default ({}) rather than escaping to the real network.
    registerMockFixture(
      {labKey: 'demo', tag: 'a'},
      {path: '*/levels/:id/level_properties', respond: {seen: true}},
    );

    // Active under tag 'a': the override wins.
    setActiveScenario({labKey: 'demo', tag: 'a'});
    expect(await (await get('/levels/1/level_properties')).json()).toEqual({
      seen: true,
    });

    // Active under tag 'b': the route is invisible, default handler answers.
    setActiveScenario({labKey: 'demo', tag: 'b'});
    expect(await (await get('/levels/1/level_properties')).json()).toEqual({});
  });

  it('falls through to the default handler when no route matches', async () => {
    // A route for an unrelated path leaves the default levels handler in place.
    registerMockFixture(
      {labKey: 'demo', tag: 'a'},
      {path: '*/api/unrelated', respond: {}},
    );
    setActiveScenario({labKey: 'demo', tag: 'a'});

    const res = await get('/levels/1/level_properties');
    expect(res.ok).toBe(true);
    expect(await res.json()).toEqual({});
  });

  it('a function responder may decline (undefined) and fall through', async () => {
    registerMockFixture(
      {labKey: 'demo', tag: 'a'},
      {path: '*/levels/:id/level_properties', respond: () => undefined},
    );
    setActiveScenario({labKey: 'demo', tag: 'a'});

    // The responder returns undefined, so the default levels handler answers.
    const res = await get('/levels/1/level_properties');
    expect(await res.json()).toEqual({});
  });

  it('serves a global (scope-less) route across scenarios', async () => {
    registerMockFixture({path: '*/api/me', respond: {id: 7}});

    // No scenario active.
    expect(await (await get('/api/me')).json()).toEqual({id: 7});

    // Any scenario active.
    setActiveScenario({labKey: 'demo', tag: 'a'});
    expect(await (await get('/api/me')).json()).toEqual({id: 7});

    setActiveScenario({labKey: 'other', tag: 'z'});
    expect(await (await get('/api/me')).json()).toEqual({id: 7});
  });

  it('lets a scenario route shadow a global one', async () => {
    registerMockFixture({path: '*/api/me', respond: {id: 7}});
    registerMockFixture(
      {labKey: 'demo', tag: 'a'},
      {path: '*/api/me', respond: {id: 1, signedOut: true}},
    );

    // Scenario 'a' overrides; other scenarios still see the global default.
    setActiveScenario({labKey: 'demo', tag: 'a'});
    expect(await (await get('/api/me')).json()).toEqual({
      id: 1,
      signedOut: true,
    });

    setActiveScenario({labKey: 'demo', tag: 'b'});
    expect(await (await get('/api/me')).json()).toEqual({id: 7});
  });

  it('clears a lab’s routes so the default handler answers again', async () => {
    registerMockFixture(
      {labKey: 'demo', tag: 'a'},
      {path: '*/levels/:id/level_properties', respond: {seen: true}},
    );
    clearMockFixtures({labKey: 'demo'});
    setActiveScenario({labKey: 'demo', tag: 'a'});

    // Route gone: the default levels handler answers with {}.
    expect(await (await get('/levels/1/level_properties')).json()).toEqual({});
  });
});
