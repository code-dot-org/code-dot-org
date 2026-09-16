import {act, renderHook} from '@testing-library/react';
import type {FormEvent} from 'react';
import {describe, expect, it, vi} from 'vitest';

import {GENERIC_ERROR} from '../modalErrors';
import {useModalForm} from '../useModalForm';

function fakeEvent() {
  return {preventDefault: vi.fn()} as unknown as FormEvent;
}

describe('useModalForm', () => {
  it('starts with no field errors and a null form error', () => {
    const {result} = renderHook(() => useModalForm());
    expect(result.current.errors).toEqual({fieldErrors: {}, formError: null});
  });

  it('calls event.preventDefault and awaits the action', async () => {
    const {result} = renderHook(() => useModalForm());
    const event = fakeEvent();
    const action = vi.fn().mockResolvedValue(undefined);

    await act(() => result.current.onSubmit(action)(event));

    expect(event.preventDefault).toHaveBeenCalled();
    expect(action).toHaveBeenCalled();
  });

  it('leaves the errors empty when the action resolves', async () => {
    const {result} = renderHook(() => useModalForm());
    const action = vi.fn().mockResolvedValue(undefined);

    await act(() => result.current.onSubmit(action)(fakeEvent()));

    expect(result.current.errors).toEqual({fieldErrors: {}, formError: null});
  });

  it('puts a form-level message in state when the action rejects', async () => {
    const {result} = renderHook(() => useModalForm());
    const action = vi.fn().mockRejectedValue(new Error('boom'));

    // onSubmit catches the rejection itself; a rejection here would already
    // fail the test via the unhandled promise, so no throw-assertion is needed.
    await act(() => result.current.onSubmit(action)(fakeEvent()));

    expect(result.current.errors.formError).toBe(GENERIC_ERROR);
  });

  it('clears the previous error before re-running', async () => {
    const {result} = renderHook(() => useModalForm());
    const failing = vi.fn().mockRejectedValue(new Error('boom'));
    const succeeding = vi.fn().mockResolvedValue(undefined);

    await act(() => result.current.onSubmit(failing)(fakeEvent()));
    expect(result.current.errors.formError).toBe(GENERIC_ERROR);

    await act(() => result.current.onSubmit(succeeding)(fakeEvent()));
    expect(result.current.errors.formError).toBeNull();
  });

  it('resetErrors clears errors back to the initial state', async () => {
    const {result} = renderHook(() => useModalForm());
    const action = vi.fn().mockRejectedValue(new Error('boom'));
    await act(() => result.current.onSubmit(action)(fakeEvent()));
    expect(result.current.errors.formError).toBe(GENERIC_ERROR);

    act(() => result.current.resetErrors());

    expect(result.current.errors).toEqual({fieldErrors: {}, formError: null});
  });
});
