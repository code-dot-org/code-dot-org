// What the import dialog draws for each stock actor.

import {describe, expect, it} from 'vitest';

import {previewDrawing} from '../preview/previewDrawing';
import {STOCK_ACTORS} from '../stock';

const of = (id: string) => STOCK_ACTORS.find(actor => actor.id === id)!;

describe('a stock actor’s preview', () => {
  it('draws every actor that declares a drawing', () => {
    // The five interface pieces. An actor that wears a PICTURE has none — the
    // dialog shows the picture instead — and that is the only reason to be
    // without one here.
    for (const id of [
      'label',
      'button',
      'speechBox',
      'progressBar',
      'healthBar',
    ]) {
      const drawing = previewDrawing(of(id));
      expect(drawing?.commands.length, id).toBeGreaterThan(0);
    }
  });

  it('says the words the actor itself carries', () => {
    // "Label" is set by the file's own rows; the rule's default for `text` is
    // empty, so a preview that only knew the rule would draw nothing at all.
    const label = previewDrawing(of('label'))!;
    const text = label.commands.find(command => command.op === 'text');

    expect(text).toMatchObject({text: 'Label'});
    // …and in the color and size the Writing rule declares, since the Label
    // does not set those.
    expect(text).toMatchObject({fill: '#ffffff', size: 12});
  });

  it('reads an anchor the actor overrides', () => {
    // A Speech Box fills downward as it is read, so it anchors top left where
    // everything else is centered.
    const box = previewDrawing(of('speechBox'))!;

    expect(box.commands.find(command => command.op === 'text')).toMatchObject({
      anchor: 'top left',
      text: 'Once upon a time…',
    });
  });

  it('works out a width that is an expression', () => {
    // A Progress Bar's fill is `width × fraction`, and `fraction` defaults to
    // 1 — so the poster is a full bar rather than an empty track.
    const bar = previewDrawing(of('progressBar'))!;
    const rectangles = bar.commands.filter(
      command => command.op === 'rectangle',
    ) as Array<{width: number}>;

    expect(rectangles).toHaveLength(2);
    expect(rectangles[1].width).toBe(rectangles[0].width);
  });

  it('assumes a health bar is pointed at somebody', () => {
    // The one assumption. A bar that points at nobody draws an empty track,
    // which advertises nothing; this reads the branch a wired-up one takes and
    // the Health rule's own defaults.
    const bar = previewDrawing(of('healthBar'))!;
    const rectangles = bar.commands.filter(
      command => command.op === 'rectangle',
    ) as Array<{width: number}>;

    expect(rectangles[1].width).toBeGreaterThan(0);
  });

  it('has nothing to draw for an actor that wears a picture', () => {
    for (const id of ['coin', 'player', 'ground', 'portrait']) {
      expect(previewDrawing(of(id)), id).toBeUndefined();
    }
  });
});
