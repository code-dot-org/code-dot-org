// What the stock-effect picker can show, and what it does when it cannot.
//
// The rendering needs a GPU and jsdom has none, so these cover the parts that
// do not: that every shipped effect compiles to something a preview could run,
// at the values importing would actually give, and that a host without WebGL
// falls back to the list the dialog had before previews existed rather than to
// a column of apologies.
//
// What they deliberately do NOT assert is the number of live contexts. That is
// the property the whole design exists for, and it is a fact about the browser
// — one canvas mounted at a time, and `ShaderPreview.dispose` handing the
// context back — that a fake WebGL cannot demonstrate. Nor is honouring
// `prefers-reduced-motion`, which only shows up once a row COULD animate, and
// jsdom has neither a GL context nor a 2D one to get there. Both are verified
// by driving the lab instead.

import {renderHook} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';

import {STOCK_EFFECTS} from '../stock';
import {useEffectPreviews} from '../useEffectPreviews';

const documents = STOCK_EFFECTS.map(effect => effect.document);
const ids = STOCK_EFFECTS.map(effect => effect.id);

/** Pretend a WebGL context is available, which jsdom does not provide. */
const withWebGL = (available: boolean) => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(((
    kind: string,
  ) =>
    available && kind.includes('webgl')
      ? {getExtension: () => null}
      : null) as never);
};

afterEach(() => vi.restoreAllMocks());

const result = () =>
  renderHook(() => useEffectPreviews(documents, ids)).result.current;

describe('the previews a picker can offer', () => {
  it('compiles every effect the library ships', () => {
    // The guard on the library rather than on the dialog: a stock effect that
    // will not compile shows an empty square, and nothing else would say so.
    const {result} = renderHook(() => useEffectPreviews(documents, ids));

    expect(result.current.previews).toHaveLength(STOCK_EFFECTS.length);
    for (const [index, preview] of result.current.previews.entries()) {
      expect(preview.fragmentSource, STOCK_EFFECTS[index].id).toBeTruthy();
    }
  });

  it('runs them at the values importing would give', () => {
    // Not tuned to flatter: what is shown is what you get. `pulse` declares
    // knobs, so it is the one that proves the values are carried at all.
    const index = STOCK_EFFECTS.findIndex(effect => effect.id === 'pulse');
    const {result} = renderHook(() => useEffectPreviews(documents, ids));
    const preview = result.current.previews[index];
    const declared = STOCK_EFFECTS[index].document.parameters;

    expect(declared.length).toBeGreaterThan(0);
    for (const parameter of declared) {
      expect([...preview.parameters.values()]).toContainEqual(
        expect.objectContaining({value: parameter.defaultValue}),
      );
    }
  });

  it('will not animate where there is no WebGL', () => {
    withWebGL(false);
    const {result} = renderHook(() => useEffectPreviews(documents, ids));

    expect(result.current.canAnimate).toBe(false);
    // …and still compiles, so the only thing lost is the picture.
    expect(result.current.previews[0].fragmentSource).toBeTruthy();
  });

  it('shows its pictures with no GPU at all', () => {
    // The point of rendering them at build time. jsdom has neither a WebGL
    // context nor a 2D one, and every row still has a picture — which is the
    // machine a learner choosing from words alone was actually on.
    withWebGL(false);
    const {result} = renderHook(() => useEffectPreviews(documents, ids));

    for (const [index, preview] of result.current.previews.entries()) {
      expect(preview.still, STOCK_EFFECTS[index].id).toMatch(
        /^data:image\/png/,
      );
    }
  });

  it('has a still for every effect the library ships', () => {
    // The guard the committed pictures need: add an effect, forget to run
    // `yarn build:effect-stills`, and its row would be the only blank one.
    for (const [index, preview] of result().previews.entries()) {
      expect(preview.still, STOCK_EFFECTS[index].id).toBeTruthy();
    }
  });
});
