import {renderHook} from '@testing-library/react';
import {afterEach, describe, expect, it} from 'vitest';

import useBodyScrollLock from '../useBodyScrollLock';

describe('useBodyScrollLock', () => {
  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('locks the body while active', () => {
    renderHook(() => useBodyScrollLock(true));

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('leaves the body alone while inactive', () => {
    document.body.style.overflow = 'scroll';

    renderHook(() => useBodyScrollLock(false));

    expect(document.body.style.overflow).toBe('scroll');
  });

  it('clears the lock it added on unmount', () => {
    const {unmount} = renderHook(() => useBodyScrollLock(true));

    unmount();

    expect(document.body.style.overflow).toBe('');
  });

  it('restores a lock the page had already set', () => {
    // Some labs hide body overflow themselves; unmounting must not unlock it.
    document.body.style.overflow = 'hidden';

    const {unmount} = renderHook(() => useBodyScrollLock(true));
    unmount();

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('unwinds nested locks in order', () => {
    document.body.style.overflow = 'auto';

    const outer = renderHook(() => useBodyScrollLock(true));
    const inner = renderHook(() => useBodyScrollLock(true));

    inner.unmount();
    expect(document.body.style.overflow).toBe('hidden');

    outer.unmount();
    expect(document.body.style.overflow).toBe('auto');
  });

  it('restores the previous value when it goes inactive', () => {
    document.body.style.overflow = 'hidden';

    const {rerender} = renderHook(({isActive}) => useBodyScrollLock(isActive), {
      initialProps: {isActive: true},
    });
    rerender({isActive: false});

    expect(document.body.style.overflow).toBe('hidden');
  });
});
