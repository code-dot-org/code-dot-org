import {render, renderHook} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';

import useBodyScrollLock from '../useBodyScrollLock';

const Locker = () => {
  useBodyScrollLock(true);
  return null;
};

describe('useBodyScrollLock', () => {
  beforeEach(() => {
    document.body.style.overflow = '';
  });

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

  it('keeps the lock while a sibling dialog is still open', () => {
    // Sibling dialogs release oldest-first, so the older lock must not
    // restore while the newer one is still holding.
    const Host = ({showFirst}: {showFirst: boolean}) => (
      <>
        {showFirst && <Locker />}
        <Locker />
      </>
    );

    const {rerender} = render(<Host showFirst />);
    rerender(<Host showFirst={false} />);

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('releases a sibling pair torn down as one tree', () => {
    // A dialog that renders a second one as its sibling (rather than its
    // child) takes both down at once, oldest lock first.
    const {unmount} = render(
      <>
        <Locker />
        <Locker />
      </>,
    );
    expect(document.body.style.overflow).toBe('hidden');

    unmount();

    expect(document.body.style.overflow).toBe('');
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
