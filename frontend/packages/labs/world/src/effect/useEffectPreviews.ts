// What the stock-effect picker draws, and the values to animate one row with.
//
// The pictures are not rendered here. They are rendered at BUILD time and
// committed (`scripts/build-effect-stills.mjs`), so showing them costs a
// string: no GPU, no compile, nothing to fail. That matters because a machine
// with no WebGL is exactly the one where a learner is choosing an effect from
// words alone, which is the case pictures were added for.
//
// WebGL is needed only to ANIMATE, and only for the one row being looked at.
// A live canvas per row is the obvious build and does not survive contact with
// a browser — contexts come from a pool of about eight to sixteen, the oldest
// is dropped to serve a new one, and the failure is silent, so the rows that
// scrolled past simply go black. One at a time costs one context however long
// the library grows, and nothing at all while somebody is reading.
//
// Imports `../compiler` and `../preview` DIRECTLY, never `../editor`. There is
// deliberately no `src/effect/index.ts` (see the README): a barrel would let
// this drag React Flow and the whole node editor into a dialog that only wants
// to run fragment shaders.

import {useEffect, useMemo, useState} from 'react';

import {compileEffect} from './compiler/compileEffect';
import type {EffectDocument} from './model/types';
import type {ShaderPreviewParameterValue} from './preview/ShaderPreview';
import {findTestTexture, renderTestTexture} from './preview/testTextures';
import {EFFECT_STILLS} from './stock/stills';

/**
 * The sample each effect's LIVE canvas runs its shader over.
 *
 * Per effect, from its own `testTexture`, and the same one its still was
 * rendered on — otherwise hovering a row swaps the picture for a different
 * picture, which is exactly what a shared sample did: five effects declare
 * `sprite` and every hover put a checkerboard in its place.
 *
 * The SIZE has to agree too. A 144px sample minified into a 72px canvas is
 * filtered differently from a 72px one drawn at its own size, and that shows as
 * a change in sharpness at the moment a row is promoted.
 */
const FALLBACK_TEXTURE = 'checker';
/** The size the stills were rendered at (`build-effect-stills.mjs`). */
const SAMPLE_SIZE = 72;

export interface EffectPreview {
  /** The first frame, as a PNG. Null when the graph would not compile. */
  still: string | null;
  /** Null when the graph would not compile — nothing to animate either. */
  fragmentSource: string | null;
  /**
   * The knobs at their DECLARED defaults, which is exactly what importing
   * gives. A preview tuned to flatter would be a preview of something else.
   */
  parameters: ReadonlyMap<string, ShaderPreviewParameterValue>;
}

export interface EffectPreviews {
  /** One per document, in the order given. Empty until the stills are drawn. */
  previews: readonly EffectPreview[];
  /** One sample per effect, in the order given — see the note above. */
  textures: readonly (TexImageSource | null)[];
  /** Whether a row may animate at all — a reader's setting, and WebGL's. */
  canAnimate: boolean;
}

/**
 * Compile every document, and render each one's first frame to a PNG.
 *
 * All of it in one effect and one context, because the context is the scarce
 * thing: it is created, used for every effect in turn via `setFragmentShader`,
 * and disposed before this returns.
 */
export function useEffectPreviews(
  documents: readonly EffectDocument[],
  /** Stock ids, parallel to `documents` — what the committed stills key on. */
  ids: readonly string[],
): EffectPreviews {
  // Compiling is pure and cheap; drawing is neither, so they are separate.
  const compiled = useMemo(
    () =>
      documents.map(document => {
        try {
          const effect = compileEffect(document);
          const parameters = new Map<string, ShaderPreviewParameterValue>();
          for (const parameter of effect.parameters) {
            parameters.set(parameter.name, {
              type: parameter.type,
              value: parameter.defaultValue,
            });
          }
          return {fragmentSource: effect.fragmentSource, parameters};
        } catch {
          // A stock effect that will not compile is a bug in the library, not
          // in the project being edited, and it must not stop a learner from
          // importing the ones that do work.
          return {
            fragmentSource: null,
            parameters: new Map<string, ShaderPreviewParameterValue>(),
          };
        }
      }),
    [documents],
  );

  const [textures, setTextures] = useState<readonly (TexImageSource | null)[]>(
    [],
  );
  const [canAnimate, setCanAnimate] = useState(false);
  const reduced = useReducedMotion();

  // The sample the live canvas runs its shader over, and the question of
  // whether it can run one at all. Both only matter for the hovered row, so
  // neither is on the path to showing the dialog.
  useEffect(() => {
    // Drawn once per distinct sample, not once per effect: there are four in
    // the library and eight effects, and rasterising the same grid twice is
    // work nobody sees.
    const drawn = new Map<string, TexImageSource | null>();
    setTextures(
      documents.map(document => {
        const id = document.testTexture ?? FALLBACK_TEXTURE;
        if (!drawn.has(id)) {
          drawn.set(id, renderTestTexture(findTestTexture(id), SAMPLE_SIZE));
        }
        return drawn.get(id) ?? null;
      }),
    );
    setCanAnimate(hasWebGL());
  }, [documents]);

  const previews = useMemo(
    () =>
      compiled.map((effect, index) => ({
        ...effect,
        still: EFFECT_STILLS[ids[index]] ?? null,
      })),
    [compiled, ids],
  );

  return {
    previews,
    textures,
    canAnimate: canAnimate && !reduced,
  };
}

/**
 * Whether the reader has asked for less motion.
 *
 * Here it decides whether a row animates AT ALL, rather than pausing one that
 * is already running: with stills doing the ordinary work, honouring the
 * setting costs nothing and the dialog simply never promotes a row.
 */
function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!query) {
      return;
    }
    setReduced(query.matches);
    const listen = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener('change', listen);
    return () => query.removeEventListener('change', listen);
  }, []);
  return reduced;
}

/**
 * Whether a row could animate at all.
 *
 * Asked ONCE for the dialog rather than left to each canvas. A `PreviewCanvas`
 * that cannot get a context says so in its own box, which is right when there
 * is one and wrong when there are several — and here the answer is not an
 * apology anyway, it is simply that the pictures do not move.
 */
function hasWebGL(): boolean {
  const probe = document.createElement('canvas');
  const gl =
    probe.getContext('webgl') ?? probe.getContext('experimental-webgl');
  if (!gl) {
    return false;
  }
  // Contexts are scarce, and this one was only a question (the same hand-back
  // `PhaserBinding.assertWebGL` does).
  (gl as WebGLRenderingContext)
    .getExtension('WEBGL_lose_context')
    ?.loseContext();
  return true;
}
