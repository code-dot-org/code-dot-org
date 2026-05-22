/**
 * Tests for the respawn fallback path.
 *
 * When SharedArrayBuffer / interrupt buffer is unavailable, stopCell() must
 * terminate the running worker and respawn it.  Since PyodideProvider is
 * complex to mount in tests, this suite verifies the wiring via a mocked
 * RuntimeContext: a component that calls useStopCell() should invoke the
 * stopCell provided by context, which in a real PyodideProvider triggers
 * worker.terminate() + respawn when hasInterrupt === false.
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { RuntimeContext } from '../runtimeStore';
import type { RuntimeContextValue } from '../runtimeStore';
import { initialRuntimeState } from '../runtimeStore';
import { useStopCell } from '../runtimeStore';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Builds a minimal RuntimeContextValue where hasInterrupt is false,
 * simulating an environment that must fall back to worker respawn.
 * @param stopCell The mock implementation to verify.
 * @returns A RuntimeContextValue for testing the no-interrupt fallback.
 */
function makeNoInterruptContext(stopCell: () => void): RuntimeContextValue {
  return {
    state: {
      ...initialRuntimeState,
      hasInterrupt: false,
      interruptBuffer: null,
    },
    dispatch: vi.fn(),
    runCell: vi.fn(),
    stopCell,
    resetGlobals: vi.fn(),
    respondToInput: vi.fn(),
  };
}

/**
 * React wrapper factory for renderHook that injects a RuntimeContext value.
 * @param ctx Context value to provide
 * @returns A React component wrapping its children in the context
 */
function makeWrapper(
  ctx: RuntimeContextValue
): ({ children }: { children: React.ReactNode }) => React.ReactElement {
  return function TestWrapper({
    children,
  }: {
    children: React.ReactNode;
  }): React.ReactElement {
    return React.createElement(
      RuntimeContext.Provider,
      { value: ctx },
      children
    );
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('respawn fallback path (no interrupt buffer)', () => {
  it('useStopCell returns the stopCell from a no-interrupt context', () => {
    const mockStop = vi.fn();
    const ctx = makeNoInterruptContext(mockStop);

    const { result } = renderHook(() => useStopCell(), {
      wrapper: makeWrapper(ctx),
    });

    expect(result.current).toBe(mockStop);
  });

  it('calling stopCell() once triggers exactly one invocation', () => {
    const mockStop = vi.fn();
    const ctx = makeNoInterruptContext(mockStop);

    const { result } = renderHook(() => useStopCell(), {
      wrapper: makeWrapper(ctx),
    });

    act(() => {
      result.current();
    });

    expect(mockStop).toHaveBeenCalledTimes(1);
  });

  it('calling stopCell() multiple times invokes it each time', () => {
    const mockStop = vi.fn();
    const ctx = makeNoInterruptContext(mockStop);

    const { result } = renderHook(() => useStopCell(), {
      wrapper: makeWrapper(ctx),
    });

    act(() => {
      result.current();
      result.current();
      result.current();
    });

    expect(mockStop).toHaveBeenCalledTimes(3);
  });

  it('stopCell is not called before button interaction', () => {
    const mockStop = vi.fn();
    const ctx = makeNoInterruptContext(mockStop);

    renderHook(() => useStopCell(), { wrapper: makeWrapper(ctx) });

    expect(mockStop).not.toHaveBeenCalled();
  });

  it('context hasInterrupt is false in the no-interrupt scenario', () => {
    const mockStop = vi.fn();
    const ctx = makeNoInterruptContext(mockStop);

    expect(ctx.state.hasInterrupt).toBe(false);
    expect(ctx.state.interruptBuffer).toBeNull();
  });
});
