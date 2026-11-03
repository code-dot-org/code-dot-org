import {fetchMetadata} from '@cdo/apps/ailab/engine/jsonReaderWrapper';

const METADATA = {card: {description: 'Animals'}};

describe('fetchMetadata', () => {
  const realFetch = global.fetch;
  afterEach(() => (global.fetch = realFetch));

  test('resolves with the metadata once the download completes', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ok: true, json: () => Promise.resolve(METADATA)})
    );

    expect(await fetchMetadata('animals.json')).toEqual({
      ok: true,
      metadata: METADATA,
    });
  });

  test('resolves a failure when the server refuses', async () => {
    global.fetch = jest.fn(() => Promise.resolve({ok: false}));

    expect(await fetchMetadata('missing.json')).toEqual({
      ok: false,
      reason: 'loadFailed',
    });
  });

  test('resolves a failure when the request is blocked', async () => {
    global.fetch = jest.fn(() => Promise.reject(new TypeError('blocked')));

    expect(await fetchMetadata('blocked.json')).toEqual({
      ok: false,
      reason: 'loadFailed',
    });
  });

  test('resolves a failure when the body is not JSON', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.reject(new SyntaxError('Unexpected token <')),
      })
    );

    expect(await fetchMetadata('blocked-page.json')).toEqual({
      ok: false,
      reason: 'loadFailed',
    });
  });
});
