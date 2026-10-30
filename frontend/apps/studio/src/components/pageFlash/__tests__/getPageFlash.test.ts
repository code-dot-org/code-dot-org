/**
 * @vitest-environment jsdom
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

function stampMeta(content: string) {
  const meta = document.createElement('meta');
  meta.name = 'page-flash';
  meta.content = content;
  document.head.appendChild(meta);
}

// The reader memoizes per module instance, so each test imports a fresh one.
async function importGetPageFlash() {
  const {getPageFlash} = await import('../getPageFlash');
  return getPageFlash;
}

describe('getPageFlash', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    document.head.innerHTML = '';
  });

  it('should return the entries in order when the meta is present', async () => {
    stampMeta(
      JSON.stringify([
        {type: 'notice', message: 'Linked'},
        {type: 'alert', message: 'Failed'},
      ]),
    );

    expect((await importGetPageFlash())()).toEqual([
      {type: 'notice', message: 'Linked'},
      {type: 'alert', message: 'Failed'},
    ]);
  });

  it('should return an empty list when the meta is absent', async () => {
    expect((await importGetPageFlash())()).toEqual([]);
  });

  it('should return an empty list when the content is not JSON', async () => {
    stampMeta('not json');

    expect((await importGetPageFlash())()).toEqual([]);
  });

  it('should return an empty list when the JSON is not an array', async () => {
    stampMeta('{"type":"notice","message":"Linked"}');

    expect((await importGetPageFlash())()).toEqual([]);
  });

  it('should drop an entry when its type is unknown or its message is not a string', async () => {
    stampMeta(
      JSON.stringify([
        {type: 'warning', message: 'Careful'},
        {type: 'notice', message: 42},
        {type: 'info', message: 'FYI'},
        null,
      ]),
    );

    expect((await importGetPageFlash())()).toEqual([
      {type: 'info', message: 'FYI'},
    ]);
  });

  it('should read the DOM once when called twice', async () => {
    stampMeta(JSON.stringify([{type: 'notice', message: 'Linked'}]));
    const getPageFlash = await importGetPageFlash();
    const querySelector = vi.spyOn(document, 'querySelector');

    const first = getPageFlash();
    const second = getPageFlash();

    expect(querySelector).toHaveBeenCalledTimes(1);
    expect(second).toBe(first);
  });
});
