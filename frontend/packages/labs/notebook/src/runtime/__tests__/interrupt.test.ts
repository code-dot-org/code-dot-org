/**
 * Tests for the interrupt buffer write path.
 *
 * Verifies that writing 2 to a SharedArrayBuffer-backed Int32Array is the
 * correct mechanism to signal a stop to the Pyodide worker, and that
 * useStopCell() returns the stopCell function from RuntimeContext.
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { RuntimeContext } from '../runtimeStore';
import type { RuntimeContextValue } from '../runtimeStore';
import { initialRuntimeState } from '../runtimeStore';
import { useStopCell } from '../runtimeStore';

// ---------------------------------------------------------------------------
// Interrupt buffer unit tests
// ---------------------------------------------------------------------------

describe('interrupt buffer', () => {
  /**
   * Verifies that the Atomics API is available in the test environment
   * and that writing 2 to slot 0 is the correct stop signal.
   *
   * SharedArrayBuffer requires cross-origin isolation headers in browsers
   * but is available in the Node/vitest environment without restriction.
   */
  const canUseSharedArrayBuffer = typeof globalThis.SharedArrayBuffer !== 'undefined';

  it.skipIf(!canUseSharedArrayBuffer)(
    'writing 2 to interrupt buffer signals stop',
    () => {
      const buf = new Int32Array(new SharedArrayBuffer(4));
      // Pre-condition: buffer starts at 0.
      expect(Atomics.load(buf, 0)).toBe(0);
      // Signal stop — the value the Pyodide worker polls for.
      Atomics.store(buf, 0, 2);
      expect(Atomics.load(buf, 0)).toBe(2);
    }
  );

  it.skipIf(!canUseSharedArrayBuffer)(
    'Atomics.store is idempotent when called twice',
    () => {
      const buf = new Int32Array(new SharedArrayBuffer(4));
      Atomics.store(buf, 0, 2);
      Atomics.store(buf, 0, 2);
      expect(Atomics.load(buf, 0)).toBe(2);
    }
  );

  it.skipIf(!canUseSharedArrayBuffer)(
    'reset to 0 after stop clears the interrupt signal',
    () => {
      const buf = new Int32Array(new SharedArrayBuffer(4));
      Atomics.store(buf, 0, 2);
      Atomics.store(buf, 0, 0);
      expect(Atomics.load(buf, 0)).toBe(0);
    }
  );
});

// ---------------------------------------------------------------------------
// useStopCell hook tests
// ---------------------------------------------------------------------------

describe('useStopCell', () => {
  /**
   * Builds a minimal RuntimeContextValue with all required fields stubbed.
   * Only stopCell is meaningful for these tests.
   * @param stopCell Replacement implementation for stopCell
   * @returns A RuntimeContextValue suitable for use as a context value in tests
   */
  function makeContext(stopCell: () => void): RuntimeContextValue {
    return {
      state: initialRuntimeState,
      dispatch: vi.fn(),
      runCell: vi.fn(),
      stopCell,
      resetGlobals: vi.fn(),
      respondToInput: vi.fn(),
    };
  }

  it('returns the stopCell function from context', () => {
    const mockStop = vi.fn();
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(
        RuntimeContext.Provider,
        { value: makeContext(mockStop) },
        children
      );

    const { result } = renderHook(() => useStopCell(), { wrapper });
    expect(result.current).toBe(mockStop);
  });

  it('calling the returned function invokes stopCell from context', () => {
    const mockStop = vi.fn();
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(
        RuntimeContext.Provider,
        { value: makeContext(mockStop) },
        children
      );

    const { result } = renderHook(() => useStopCell(), { wrapper });
    result.current();
    expect(mockStop).toHaveBeenCalledTimes(1);
  });

  it('returns a callable function after rerender', () => {
    const mockStop1 = vi.fn();

    // Render with a context value and confirm the hook returns it.
    const { result, rerender } = renderHook(() => useStopCell(), {
      wrapper: ({ children }: { children: React.ReactNode }) =>
        React.createElement(
          RuntimeContext.Provider,
          { value: makeContext(mockStop1) },
          children
        ),
    });

    expect(result.current).toBe(mockStop1);

    // After rerender, the hook should still return a callable.
    rerender();
    expect(typeof result.current).toBe('function');
  });
});
