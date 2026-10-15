/**
 * @vitest-environment jsdom
 */

import {act, renderHook} from '@testing-library/react';
import {afterEach, describe, expect, it} from 'vitest';

import {DEFAULT_STATE, pushConsentState} from '../store';
import type {ConsentState} from '../types';
import {useConsent} from '../useConsent';

// act(): this hook runs before RTL's auto-cleanup unmount (same-level
// afterEach hooks run in reverse registration order), so the reset can
// re-render a still-mounted hook.
afterEach(() => {
  act(() => pushConsentState(DEFAULT_STATE));
});

describe('useConsent', () => {
  it('renders the default state immediately', () => {
    const {result} = renderHook(() => useConsent());
    expect(result.current).toEqual(DEFAULT_STATE);
  });

  it('re-renders when the store pushes a new state', () => {
    const {result} = renderHook(() => useConsent());

    const changed: ConsentState = {categories: new Set(['performance'])};
    act(() => {
      pushConsentState(changed);
    });

    expect(result.current).toEqual(changed);
  });

  it('stops updating after unmount', () => {
    const {result, unmount} = renderHook(() => useConsent());
    unmount();

    act(() => {
      pushConsentState({categories: new Set(['performance'])});
    });

    expect(result.current).toEqual(DEFAULT_STATE);
  });
});
