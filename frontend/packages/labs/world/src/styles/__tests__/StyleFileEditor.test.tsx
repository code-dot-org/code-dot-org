// Editing a theme: the two levels, what a form can say about a field, and the
// promise that the picture on screen is the picture the game draws.

import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import {readDrawing} from '../../actors/preview/drawingReader';
import {resolveTheme} from '../../engine/core/theme';
import {previewFiles} from '../editor/previewFiles';
import {STOCK_STYLES} from '../stock';
import {StyleFileEditor} from '../StyleFileEditor';

const modern = STOCK_STYLES[0].contents;

const props = (
  overrides: Partial<Parameters<typeof StyleFileEditor>[0]> = {},
) => ({
  fileId: 'modern',
  language: 'style',
  initialContents: modern,
  isReadOnly: false,
  onChange: vi.fn(),
  ...overrides,
});

/** The last document the editor wrote back, parsed. */
const written = (onChange: ReturnType<typeof vi.fn>) =>
  JSON.parse(onChange.mock.calls.at(-1)![0] as string);

describe('the theme editor', () => {
  it('lists every value the theme holds', () => {
    render(<StyleFileEditor {...props()} />);
    // Named, because a token's NAME is the whole of how a style refers to it.
    expect(screen.getByLabelText('accent')).toBeTruthy();
    expect(screen.getByLabelText('radius')).toBeTruthy();
  });

  it('writes a changed value straight back to the file', () => {
    const onChange = vi.fn();
    render(<StyleFileEditor {...props({onChange})} />);
    fireEvent.change(screen.getByLabelText('accent'), {
      target: {value: '#a03030'},
    });
    expect(written(onChange).tokens.accent).toBe('#a03030');
  });

  it('keeps every other value and style untouched', () => {
    // A form that rewrote the document would lose whatever it did not have a
    // control for — which is every field a learner hand-edited.
    const onChange = vi.fn();
    render(<StyleFileEditor {...props({onChange})} />);
    fireEvent.change(screen.getByLabelText('radius'), {target: {value: '2'}});
    const after = written(onChange);
    expect(after.tokens.accent).toBe('#3050a0');
    expect(Object.keys(after.styles)).toEqual(
      Object.keys(JSON.parse(modern).styles),
    );
  });

  it('says what a style field points at, and can repoint it', () => {
    const onChange = vi.fn();
    render(<StyleFileEditor {...props({onChange})} />);
    fireEvent.click(screen.getByRole('button', {name: 'button face'}));
    // The label is VISIBLE rather than an aria-label: the form fields are the
    // component library's, which draw the label they are named by.
    const source = screen.getByLabelText('Fill') as HTMLSelectElement;
    // It points at a TOKEN, and the form says which — the level that stops
    // recolouring from meaning "edit four styles".
    expect(source.value).toBe('$accent');
    fireEvent.change(source, {target: {value: '$positive'}});
    expect(written(onChange).styles['button face'].fill).toBe('$positive');
  });

  it('can say "leave alone" and "none", which are different answers', () => {
    // The distinction the whole compose story rests on: absent leaves the pen
    // as it was, null clears it (`engine/core/theme`).
    const onChange = vi.fn();
    render(<StyleFileEditor {...props({onChange})} />);
    fireEvent.click(screen.getByRole('button', {name: 'button face'}));
    const source = screen.getByLabelText('Fill');

    fireEvent.change(source, {target: {value: 'unset'}});
    expect('fill' in written(onChange).styles['button face']).toBe(false);

    fireEvent.change(source, {target: {value: 'none'}});
    expect(written(onChange).styles['button face'].fill).toBeNull();
  });

  it('shows the file rather than replacing it when it will not parse', () => {
    // Quietly swapping a learner's broken file for a blank one destroys the
    // very thing they need to see.
    render(<StyleFileEditor {...props({initialContents: '{"tokens": '})} />);
    expect(screen.getByRole('alert').textContent).toContain('{"tokens": ');
  });

  it('opens a new file on an empty theme rather than an error', () => {
    render(<StyleFileEditor {...props({initialContents: ''})} />);
    expect(screen.queryByRole('alert')).toBeNull();
  });
});

describe('the preview', () => {
  it('draws the real controls, through the real reader', () => {
    // THE PROMISE THE PREVIEW MAKES. Not a mock-up: the stock Button's own
    // file, read by the reader that makes the map editor's stills, painted by
    // the painter that makes the game's textures. So a theme that looks right
    // here looks right in the game.
    const files = previewFiles(modern);
    const drawing = readDrawing(files, 'actors/button');
    expect(drawing).toBeTruthy();
    expect(drawing!.commands[0]).toMatchObject({
      fill: '#3050a0',
      radius: 8,
    });
  });

  it('follows an edit, because it reads the document and not the file', () => {
    const edited = JSON.parse(modern);
    edited.tokens.accent = '#a03030';
    const drawing = readDrawing(
      previewFiles(JSON.stringify(edited)),
      'actors/button',
    );
    expect(drawing!.commands[0]).toMatchObject({fill: '#a03030'});
  });

  it('shows a control for every role but the two a still cannot reach', () => {
    // A Scroll View's and a List's pictures depend on where they are
    // scrolled, which only a running world knows.
    const theme = resolveTheme(JSON.parse(modern));
    const drawn = new Set<string>();
    const files = previewFiles(modern);
    for (const kind of [
      'button',
      'panel',
      'textInput',
      'toggle',
      'dropdown',
      'slider',
      'progressBar',
    ]) {
      expect(readDrawing(files, `actors/${kind}`), kind).toBeTruthy();
      drawn.add(kind);
    }
    expect(drawn.size).toBe(7);
    expect(theme.styles.size).toBeGreaterThan(0);
  });
});
