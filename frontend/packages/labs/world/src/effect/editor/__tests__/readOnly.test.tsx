// Read-only mode. Codebridge mounts every custom editor with an `isReadOnly`
// flag — a workspace nobody may edit — and the effect editor honours it in two
// independent layers, tested here as two independent things:
//
//   1. No edit can reach the document, whatever the UI does. This is the
//      guarantee, enforced in `useEffectDocument`.
//   2. No control is offered that would do nothing. This is the manners.
//
// The second is what a learner sees; the first is what makes it true. A test
// that only covered the buttons would pass while a keyboard shortcut, a drag,
// or a control added later quietly wrote to the file.

import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import {createEffectDocument} from '../../model/document';
import {EffectEditor} from '../EffectEditor';
import {useEffectDocument} from '../useEffectDocument';

/** Rename an effect — any edit will do; this one is one line. */
const rename =
  (name: string) => (document: ReturnType<typeof createEffectDocument>) => ({
    ...document,
    name,
  });

describe('useEffectDocument, read-only', () => {
  it('refuses every update', () => {
    const {result} = renderHook(() =>
      useEffectDocument(createEffectDocument('Ripple'), {readOnly: true}),
    );

    act(() => result.current.update(rename('Renamed')));

    expect(result.current.document.name).toBe('Ripple');
  });

  it('reports no history to undo or redo', () => {
    const {result} = renderHook(() =>
      useEffectDocument(createEffectDocument(), {readOnly: true}),
    );

    act(() => result.current.update(rename('Renamed')));

    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('still accepts a reset, which is opening a file rather than editing one', () => {
    const {result} = renderHook(() =>
      useEffectDocument(createEffectDocument('First'), {readOnly: true}),
    );

    act(() => result.current.reset(createEffectDocument('Second')));

    expect(result.current.document.name).toBe('Second');
  });

  it('applies updates normally when not read-only', () => {
    const {result} = renderHook(() =>
      useEffectDocument(createEffectDocument('Ripple')),
    );

    act(() => result.current.update(rename('Renamed')));

    expect(result.current.document.name).toBe('Renamed');
    expect(result.current.canUndo).toBe(true);
  });
});

describe('EffectEditor, read-only', () => {
  it('never calls onChange', () => {
    // Read-only or not, the host must not be told of a change nobody made.
    const onChange = vi.fn();
    render(
      <EffectEditor
        initialDocument={createEffectDocument('Ripple')}
        onChange={onChange}
        readOnly
      />,
    );

    // Type into the name field: it is disabled, but firing the event directly
    // is the point — the guarantee must not rest on the attribute.
    fireEvent.change(screen.getByLabelText('Effect name'), {
      target: {value: 'Renamed'},
    });

    expect(onChange).not.toHaveBeenCalled();
  });

  it('withdraws the node palette', () => {
    // The palette exists to place nodes; read-only it would be a column of
    // controls that do nothing.
    const {rerender} = render(
      <EffectEditor initialDocument={createEffectDocument()} />,
    );
    expect(screen.getByRole('button', {name: 'Multiply'})).toBeInTheDocument();

    rerender(
      <EffectEditor initialDocument={createEffectDocument()} readOnly />,
    );
    expect(screen.queryByRole('button', {name: 'Multiply'})).toBeNull();
  });

  it('withdraws the add-parameter button', () => {
    render(<EffectEditor initialDocument={createEffectDocument()} readOnly />);

    expect(screen.queryByRole('button', {name: 'Parameter'})).toBeNull();
  });

  it('disables the effect name and description', () => {
    render(<EffectEditor initialDocument={createEffectDocument()} readOnly />);

    expect(screen.getByLabelText('Effect name')).toBeDisabled();
    expect(screen.getByLabelText('Effect description')).toBeDisabled();
  });

  it('keeps the reading affordances', () => {
    // Read-only is not "inert": the GLSL panel, the test-texture picker, and
    // the previews all only read the graph, so they stay.
    render(<EffectEditor initialDocument={createEffectDocument()} readOnly />);

    expect(
      screen.getByRole('button', {name: 'Show the GLSL code'}),
    ).toBeEnabled();
  });
});
