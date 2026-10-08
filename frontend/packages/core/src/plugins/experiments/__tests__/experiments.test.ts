/**
 * @vitest-environment jsdom
 */

import {afterEach, describe, expect, it} from 'vitest';

import {getEnabledExperiments} from '..';

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/`;
}

function clearCookie(name: string) {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

afterEach(() => {
  clearCookie('_experiments');
  clearCookie('_experiments_test');
  localStorage.clear();
  delete window.cookieEnvSuffix;
});

describe('getEnabledExperiments', () => {
  it('reports nothing when neither store has entries', () => {
    expect(getEnabledExperiments()).toEqual([]);
  });

  it('reads the localStorage list', () => {
    localStorage.setItem(
      'experimentsList',
      JSON.stringify([{key: 'one'}, {key: 'two'}]),
    );

    expect(getEnabledExperiments()).toEqual(['one', 'two']);
  });

  it('drops localStorage entries whose expiry has passed', () => {
    localStorage.setItem(
      'experimentsList',
      JSON.stringify([
        {key: 'live', expiration: Date.now() + 60_000},
        {key: 'stale', expiration: Date.now() - 60_000},
        {key: 'permanent'},
      ]),
    );

    expect(getEnabledExperiments()).toEqual(['live', 'permanent']);
  });

  it('reports a duplicated localStorage key once', () => {
    localStorage.setItem(
      'experimentsList',
      JSON.stringify([
        {key: 'twice', expiration: Date.now() + 60_000},
        {key: 'twice'},
        {key: 'other'},
      ]),
    );

    expect(getEnabledExperiments()).toEqual(['twice', 'other']);
  });

  it('reads the unsuffixed cookie when no environment suffix is rendered', () => {
    setCookie('_experiments', JSON.stringify(['from-cookie']));

    expect(getEnabledExperiments()).toEqual(['from-cookie']);
  });

  it('reads the suffixed cookie when the page renders a suffix', () => {
    window.cookieEnvSuffix = '_test';
    setCookie('_experiments_test', JSON.stringify(['suffixed']));
    setCookie('_experiments', JSON.stringify(['unsuffixed']));

    expect(getEnabledExperiments()).toEqual(['suffixed']);
  });

  it('lists cookie entries before localStorage entries', () => {
    setCookie('_experiments', JSON.stringify(['from-cookie']));
    localStorage.setItem(
      'experimentsList',
      JSON.stringify([{key: 'from-storage'}]),
    );

    expect(getEnabledExperiments()).toEqual(['from-cookie', 'from-storage']);
  });

  it('ignores a malformed cookie', () => {
    setCookie('_experiments', 'not-json{');

    expect(getEnabledExperiments()).toEqual([]);
  });

  it('ignores a malformed localStorage list', () => {
    localStorage.setItem('experimentsList', 'not-json{');

    expect(getEnabledExperiments()).toEqual([]);
  });
});
