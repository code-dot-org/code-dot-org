import {afterEach, describe, expect, it, vi} from 'vitest';

import {consent, DEFAULT_STATE, pushConsentState} from '../store';
import type {ConsentState} from '../types';

const unsubscribes: Array<() => void> = [];

function subscribe(listener: (state: ConsentState) => void): () => void {
  const unsubscribe = consent.subscribe(listener);
  unsubscribes.push(unsubscribe);
  return unsubscribe;
}

afterEach(() => {
  unsubscribes.splice(0).forEach(unsubscribe => unsubscribe());
  pushConsentState(DEFAULT_STATE);
});

describe('consent store', () => {
  it('current() starts at the strictly-necessary-only default', () => {
    expect(consent.current()).toBe(DEFAULT_STATE);
  });

  it('first push notifies subscribers', () => {
    const listener = vi.fn();
    subscribe(listener);

    const next: ConsentState = {categories: new Set(['performance'])};
    pushConsentState(next);

    expect(listener).toHaveBeenCalledWith(next);
    expect(consent.current()).toBe(next);
  });

  it('does not notify when the pushed categories are unchanged', () => {
    const listener = vi.fn();
    subscribe(listener);

    pushConsentState({categories: new Set(['strictly-necessary'])});

    expect(listener).not.toHaveBeenCalled();
    expect(consent.current()).toBe(DEFAULT_STATE);
  });

  it('notifies once per distinct push, not on a repeated identical push', () => {
    const listener = vi.fn();
    subscribe(listener);

    const next: ConsentState = {categories: new Set(['performance'])};
    pushConsentState(next);
    pushConsentState({categories: new Set(['performance'])});

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('stops notifying an unsubscribed listener', () => {
    const listener = vi.fn();
    const unsubscribe = subscribe(listener);
    unsubscribe();

    pushConsentState({categories: new Set(['performance'])});

    expect(listener).not.toHaveBeenCalled();
  });

  it('unsubscribe is idempotent and scoped to its own registration', () => {
    const listener = vi.fn();
    const unsubscribeFirst = subscribe(listener);
    subscribe(listener);

    unsubscribeFirst();
    unsubscribeFirst();

    pushConsentState({categories: new Set(['performance'])});

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('fans out to multiple subscribers', () => {
    const listenerA = vi.fn();
    const listenerB = vi.fn();
    subscribe(listenerA);
    subscribe(listenerB);

    const next: ConsentState = {categories: new Set(['performance'])};
    pushConsentState(next);

    expect(listenerA).toHaveBeenCalledWith(next);
    expect(listenerB).toHaveBeenCalledWith(next);
  });
});
