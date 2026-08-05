/**
 * @vitest-environment jsdom
 */

import {afterEach, describe, expect, it, vi} from 'vitest';

import {connectOneTrust, parseActiveGroups} from '..';
import {DEFAULT_STATE} from '@/plugins/consent/store';
import * as Observability from '@/plugins/observability';

vi.mock('@/plugins/observability', () => ({recordError: vi.fn()}));

const NO_OP = () => {};

afterEach(() => {
  delete window.oneTrustPromise;
  delete window.OneTrust;
  delete window.OnetrustActiveGroups;
  delete window.OptanonWrapper;
  vi.clearAllMocks();
});

describe('parseActiveGroups', () => {
  it('maps known groups, ignoring surrounding commas and whitespace', () => {
    const state = parseActiveGroups(',C0001,C0002,');
    expect(state.categories).toEqual(
      new Set(['strictly-necessary', 'performance']),
    );
  });

  it('drops unknown groups', () => {
    const state = parseActiveGroups('C0002,C9999');
    expect(state.categories).toEqual(
      new Set(['strictly-necessary', 'performance']),
    );
  });

  it('always includes strictly-necessary, even when C0001 is absent', () => {
    const state = parseActiveGroups(',C0002,');
    expect(state.categories).toEqual(
      new Set(['strictly-necessary', 'performance']),
    );
  });

  it('returns DEFAULT_STATE for undefined', () => {
    expect(parseActiveGroups(undefined)).toBe(DEFAULT_STATE);
  });

  it('returns DEFAULT_STATE for an empty string', () => {
    expect(parseActiveGroups('')).toBe(DEFAULT_STATE);
  });
});

describe('connectOneTrust settlement', () => {
  it('settles synchronously when the page carries no CMP', () => {
    const settle = vi.fn();
    connectOneTrust(NO_OP, settle);

    expect(settle).toHaveBeenCalledTimes(1);
  });

  it('does not settle until the OneTrust promise resolves', async () => {
    let resolveOneTrust: (value: undefined) => void = NO_OP;
    window.oneTrustPromise = new Promise(resolve => {
      resolveOneTrust = resolve;
    });

    const settle = vi.fn();
    connectOneTrust(NO_OP, settle);
    await Promise.resolve();
    expect(settle).not.toHaveBeenCalled();

    resolveOneTrust(undefined);
    await vi.waitFor(() => expect(settle).toHaveBeenCalledTimes(1));
  });

  it('settles when the promise rejects, so consumers are not blocked forever', async () => {
    window.oneTrustPromise = Promise.reject(new Error('blocked'));

    const settle = vi.fn();
    connectOneTrust(NO_OP, settle);

    await vi.waitFor(() => expect(settle).toHaveBeenCalledTimes(1));
  });
});

describe('connectOneTrust', () => {
  it('never pushes and injects no scripts when there is no oneTrustPromise', async () => {
    const push = vi.fn();
    connectOneTrust(push, NO_OP);

    await Promise.resolve();

    expect(push).not.toHaveBeenCalled();
    expect(document.querySelectorAll('script')).toHaveLength(0);
  });

  it('pushes the parsed initial state once the promise resolves', async () => {
    const onConsentChanged = vi.fn();
    window.oneTrustPromise = Promise.resolve({
      OnConsentChanged: onConsentChanged,
    });
    window.OnetrustActiveGroups = 'C0001,C0002';

    const push = vi.fn();
    connectOneTrust(push, NO_OP);
    await window.oneTrustPromise;

    expect(document.querySelectorAll('script')).toHaveLength(0);
    expect(push).toHaveBeenCalledWith({
      categories: new Set(['strictly-necessary', 'performance']),
    });
  });

  it('delivers mid-session changes via OnConsentChanged', async () => {
    let capturedCallback: (() => void) | undefined;
    window.oneTrustPromise = Promise.resolve({
      OnConsentChanged: cb => {
        capturedCallback = cb;
      },
    });
    window.OnetrustActiveGroups = 'C0001';

    const push = vi.fn();
    connectOneTrust(push, NO_OP);
    await window.oneTrustPromise;

    window.OnetrustActiveGroups = 'C0001,C0003';
    capturedCallback?.();

    expect(push).toHaveBeenCalledWith({
      categories: new Set(['strictly-necessary', 'functional']),
    });
  });

  it('pushes the default state when the promise resolves without OneTrust', async () => {
    window.oneTrustPromise = Promise.resolve(undefined);

    const push = vi.fn();
    connectOneTrust(push, NO_OP);
    await window.oneTrustPromise;
    await Promise.resolve();

    expect(push).toHaveBeenCalledWith(DEFAULT_STATE);
  });

  it('registers OnConsentChanged even when the initial push throws', async () => {
    let capturedCallback: (() => void) | undefined;
    window.oneTrustPromise = Promise.resolve({
      OnConsentChanged: (cb: () => void) => {
        capturedCallback = cb;
      },
    });
    window.OnetrustActiveGroups = 'C0001';

    const push = vi.fn<(state: unknown) => void>(() => {
      throw new Error('subscriber blew up');
    });
    connectOneTrust(push, NO_OP);
    await window.oneTrustPromise;
    await Promise.resolve();

    push.mockImplementation(() => {});
    window.OnetrustActiveGroups = 'C0001,C0003';
    capturedCallback?.();

    expect(push).toHaveBeenCalledTimes(2);
    expect(Observability.recordError).toHaveBeenCalled();
  });

  it('reports a rejecting promise via observability without pushing', async () => {
    const blocked = new Error('blocked');
    window.oneTrustPromise = Promise.reject(blocked);

    const push = vi.fn();
    expect(() => connectOneTrust(push, NO_OP)).not.toThrow();

    await new Promise(resolve => setTimeout(resolve, 0));

    expect(push).not.toHaveBeenCalled();
    expect(Observability.recordError).toHaveBeenCalledWith(blocked);
  });
});
