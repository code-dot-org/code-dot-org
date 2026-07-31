// Injecting vertical skew (positional.skew) into Phaser's WebGL render path.
//
// Phaser's transform pipeline does not model shear — a Game Object's own matrix
// is position·rotation·scale only. But every WebGL renderer we draw with threads
// a *parent* matrix into that transform (Image into `Submitter.run`, Rectangle
// through `GetCalcMatrix`), and a top-level object is given none. So we wrap the
// object's render function and hand its renderer a shear matrix in place of the
// parent matrix it would otherwise not have. The renderer composes
// calc = camera·parent·sprite, and the sprite matrix still carries the object's
// own position/rotation/scale, so the shear applies to what is drawn while
// leaving those untouched.
//
// This lives in its own module because the wiring below is subtle, silent when
// wrong, and worth a unit test — none of which needs a GL context or even
// Phaser itself. The matrix math stays with the caller (PhaserBinding), which is
// where the Phaser namespace already is.

// Type-only: erased at build, so importing this module does not load Phaser.
import type Phaser from 'phaser';

type TransformMatrix = Phaser.GameObjects.Components.TransformMatrix;

/**
 * Phaser's WebGL render function for one object — `renderWebGL(renderer, src,
 * drawingContext, parentMatrix)`. It is not in the public types (Phaser marks it
 * private), so we describe its shape here and reach it through a structural
 * cast.
 *
 * The display list does not call it directly: it calls
 * `child.renderWebGLStep(renderer, child, context, parentMatrix, step, …)`,
 * which dispatches through the object's `_renderSteps` list. The extra trailing
 * arguments are for steps that hand off to the next one; the two renderers we
 * draw with ignore them, but the wrapper forwards them so it is transparent.
 */
export type WebGLRenderHook = (
  renderer: unknown,
  src: unknown,
  drawingContext: unknown,
  parentMatrix?: TransformMatrix,
  ...rest: unknown[]
) => void;

/** A Game Object's render-step internals, as the skew hook needs to see them. */
export interface RenderStepInternals {
  renderWebGL: WebGLRenderHook;
  /** Built in the GameObject constructor; see {@link installSkewHook}. */
  _renderSteps?: WebGLRenderHook[];
}

/**
 * Give one Game Object a skew-aware render function. A no-op cost until
 * `matrixFor` starts returning a matrix for it.
 *
 * TWO places are patched, not one, and that is the whole subtlety of this
 * function. The canvas renderer this driver used to run on resolved the hook at
 * draw time (`child.renderCanvas(...)`), so replacing the instance property was
 * enough. WebGL does not: the GameObject constructor runs
 * `addRenderStep(this.renderWebGL)`, capturing the FUNCTION VALUE into
 * `_renderSteps`, and the display list dispatches through that list — so an
 * instance property replaced afterwards is simply never reached.
 *
 * Both must therefore end up holding the SAME wrapper reference.
 * `Filters.enableFilters()` finds where to insert the filter step with
 * `_renderSteps.indexOf(this.renderWebGL)`, and if the two disagree that search
 * returns -1 and the step is spliced in at the wrong end. Effects call
 * `enableFilters()`, so this is load-bearing rather than tidiness — and it fails
 * silently either way, which is why it is tested.
 *
 * @param object   the Game Object to wrap, seen through its render internals
 * @param matrixFor returns the object's current shear matrix, or undefined when
 *   it is not skewed — consulted per frame, so the caller may rebuild the matrix
 *   as freely as it likes
 */
export function installSkewHook<T extends RenderStepInternals>(
  object: T,
  matrixFor: (object: T) => TransformMatrix | undefined,
): void {
  const original = object.renderWebGL;
  const hook: WebGLRenderHook = (
    renderer,
    src,
    drawingContext,
    parentMatrix,
    ...rest
  ) => {
    original.call(
      src,
      renderer,
      src,
      drawingContext,
      matrixFor(object) ?? parentMatrix,
      ...rest,
    );
  };

  object.renderWebGL = hook;
  const steps = object._renderSteps;
  const index = steps?.indexOf(original) ?? -1;
  if (steps && index >= 0) {
    steps[index] = hook;
  }
}
