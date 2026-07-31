// The skew hook's wiring, tested without a GL context or Phaser.
//
// What is under test is not the shear itself (that is matrix math, verified in a
// browser) but the two-places-not-one invariant described in `installSkewHook`:
// under WebGL a Game Object's render function is CAPTURED into `_renderSteps` at
// construction, and `Filters.enableFilters()` later locates its insertion point
// with `_renderSteps.indexOf(this.renderWebGL)`. If the instance property and the
// captured entry drift apart, skew stops applying and filters insert at the wrong
// end — both silently. The fakes below mimic exactly that shape.

import {describe, expect, it, vi} from 'vitest';

import {
  installSkewHook,
  type RenderStepInternals,
  type WebGLRenderHook,
} from '../skew';

// Stand-ins for the Phaser objects the hook only ever passes through.
const RENDERER = {renderer: true};
const CONTEXT = {context: true};
const MATRIX = {matrix: 'skew'} as never;
const PARENT = {matrix: 'parent'} as never;

/**
 * A Game Object as `installSkewHook` sees it: a `renderWebGL` function plus the
 * `_renderSteps` list the GameObject constructor captured it into. `extraSteps`
 * models `enableFilters()` having already inserted its own step in front.
 */
function fakeObject(extraSteps: WebGLRenderHook[] = []) {
  const original = vi.fn<WebGLRenderHook>();
  const object: RenderStepInternals = {
    renderWebGL: original,
    _renderSteps: [...extraSteps, original],
  };
  return {object, original};
}

describe('installSkewHook', () => {
  it('replaces the captured render step, not just the instance property', () => {
    const {object, original} = fakeObject();

    installSkewHook(object, () => undefined);

    expect(object.renderWebGL).not.toBe(original);
    expect(object._renderSteps).toEqual([object.renderWebGL]);
  });

  it('leaves the property and the captured step the same reference', () => {
    // This is what `Filters.enableFilters()` relies on; -1 here means the filter
    // step is spliced in at the wrong end.
    const {object} = fakeObject();

    installSkewHook(object, () => undefined);

    expect(object._renderSteps?.indexOf(object.renderWebGL)).toBe(0);
  });

  it('patches in place when a filter step already precedes it', () => {
    const filterStep = vi.fn<WebGLRenderHook>();
    const {object} = fakeObject([filterStep]);

    installSkewHook(object, () => undefined);

    expect(object._renderSteps?.[0]).toBe(filterStep);
    expect(object._renderSteps?.indexOf(object.renderWebGL)).toBe(1);
  });

  it('substitutes the skew matrix for the parent matrix', () => {
    const {object, original} = fakeObject();

    installSkewHook(object, () => MATRIX);
    object._renderSteps?.[0](RENDERER, object, CONTEXT, PARENT);

    expect(original).toHaveBeenCalledWith(RENDERER, object, CONTEXT, MATRIX);
  });

  it('passes the parent matrix through when the object is not skewed', () => {
    const {object, original} = fakeObject();

    installSkewHook(object, () => undefined);
    object._renderSteps?.[0](RENDERER, object, CONTEXT, PARENT);

    expect(original).toHaveBeenCalledWith(RENDERER, object, CONTEXT, PARENT);
  });

  it('consults the matrix per call, so skew can change per frame', () => {
    const {object, original} = fakeObject();
    let matrix: typeof MATRIX | undefined = undefined;

    installSkewHook(object, () => matrix);
    const step = object._renderSteps?.[0] as WebGLRenderHook;

    step(RENDERER, object, CONTEXT, undefined);
    matrix = MATRIX;
    step(RENDERER, object, CONTEXT, undefined);

    expect(original.mock.calls[0][3]).toBeUndefined();
    expect(original.mock.calls[1][3]).toBe(MATRIX);
  });

  it('forwards the render step arguments beyond the matrix', () => {
    // `renderWebGLStep` passes (…, renderStep, displayList, displayListIndex);
    // the renderers we draw with ignore them, but the wrapper must be
    // transparent for the ones that do not.
    const {object, original} = fakeObject();
    const displayList = [object];

    installSkewHook(object, () => undefined);
    object._renderSteps?.[0](
      RENDERER,
      object,
      CONTEXT,
      PARENT,
      0,
      displayList,
      0,
    );

    expect(original).toHaveBeenCalledWith(
      RENDERER,
      object,
      CONTEXT,
      PARENT,
      0,
      displayList,
      0,
    );
  });

  it('calls the original with the game object as its scope', () => {
    const scopes: unknown[] = [];
    const original = function (this: unknown) {
      scopes.push(this);
    } as WebGLRenderHook;
    const object: RenderStepInternals = {
      renderWebGL: original,
      _renderSteps: [original],
    };

    installSkewHook(object, () => undefined);
    object._renderSteps?.[0](RENDERER, object, CONTEXT, undefined);

    expect(scopes).toEqual([object]);
  });

  it('still wraps the property when there is no render step list', () => {
    // Defensive: `_renderSteps` is only present on the WebGL build of a Game
    // Object. Wrapping should not throw if it is ever absent.
    const original = vi.fn<WebGLRenderHook>();
    const object: RenderStepInternals = {renderWebGL: original};

    expect(() => installSkewHook(object, () => MATRIX)).not.toThrow();
    object.renderWebGL(RENDERER, object, CONTEXT, PARENT);

    expect(original).toHaveBeenCalledWith(RENDERER, object, CONTEXT, MATRIX);
  });
});
