import {act, renderHook} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {emptyEffectDocument} from '../../model/constants';
import {useEffectDocument} from '../useEffectDocument';

const rename = (name: string) => (document: typeof initial) => ({
  ...document,
  name,
});

const initial = emptyEffectDocument('Original');

describe('useEffectDocument', () => {
  it('starts with nothing to undo or redo', () => {
    const {result} = renderHook(() => useEffectDocument(initial));

    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('applies an update and records it in history', () => {
    const {result} = renderHook(() => useEffectDocument(initial));

    act(() => result.current.update(rename('Edited')));

    expect(result.current.document.name).toBe('Edited');
    expect(result.current.canUndo).toBe(true);
  });

  it('undoes to the previous document and redoes forward again', () => {
    const {result} = renderHook(() => useEffectDocument(initial));

    act(() => result.current.update(rename('Edited')));
    act(() => result.current.undo());

    expect(result.current.document.name).toBe('Original');
    expect(result.current.canRedo).toBe(true);

    act(() => result.current.redo());

    expect(result.current.document.name).toBe('Edited');
    expect(result.current.canRedo).toBe(false);
  });

  it('merges a run of edits sharing a coalesce key into one undo step', () => {
    // A slider drag fires an update per pointer move; one undo should take
    // the learner back to before the drag, not back one pixel.
    const {result} = renderHook(() => useEffectDocument(initial));

    act(() => result.current.update(rename('A'), {coalesce: 'slider'}));
    act(() => result.current.update(rename('B'), {coalesce: 'slider'}));
    act(() => result.current.update(rename('C'), {coalesce: 'slider'}));
    act(() => result.current.undo());

    expect(result.current.document.name).toBe('Original');
    expect(result.current.canUndo).toBe(false);
  });

  it('starts a new undo step when the coalesce key changes', () => {
    const {result} = renderHook(() => useEffectDocument(initial));

    act(() => result.current.update(rename('A'), {coalesce: 'first'}));
    act(() => result.current.update(rename('B'), {coalesce: 'second'}));
    act(() => result.current.undo());

    expect(result.current.document.name).toBe('A');
  });

  it('an uncoalesced edit breaks a coalescing run', () => {
    const {result} = renderHook(() => useEffectDocument(initial));

    act(() => result.current.update(rename('A'), {coalesce: 'slider'}));
    act(() => result.current.update(rename('B')));
    act(() => result.current.update(rename('C'), {coalesce: 'slider'}));
    act(() => result.current.undo());

    // The second 'slider' run is its own step — it must not merge into the
    // first across the unrelated edit between them.
    expect(result.current.document.name).toBe('B');
  });

  it('ignores an update that returns the same document', () => {
    const {result} = renderHook(() => useEffectDocument(initial));

    act(() => result.current.update(document => document));

    expect(result.current.canUndo).toBe(false);
  });

  it('drops the redo stack when a new edit lands after undo', () => {
    const {result} = renderHook(() => useEffectDocument(initial));

    act(() => result.current.update(rename('A')));
    act(() => result.current.undo());
    act(() => result.current.update(rename('B')));

    expect(result.current.canRedo).toBe(false);
  });

  it('does nothing when there is nothing to undo', () => {
    const {result} = renderHook(() => useEffectDocument(initial));

    act(() => result.current.undo());

    expect(result.current.document).toBe(initial);
  });

  it('reset replaces the document and clears history', () => {
    const {result} = renderHook(() => useEffectDocument(initial));

    act(() => result.current.update(rename('Edited')));
    act(() => result.current.reset(emptyEffectDocument('Fresh')));

    expect(result.current.document.name).toBe('Fresh');
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });
});
