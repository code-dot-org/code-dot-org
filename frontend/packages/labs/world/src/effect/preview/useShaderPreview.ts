import {useEffect, useRef, useState} from 'react';

import {previewEffectTime, previewTime} from './previewClock';
import {
  ShaderCompileError,
  ShaderPreview,
  type ShaderPreviewParameterValue,
} from './ShaderPreview';

export interface UseShaderPreviewOptions {
  /** Compiled fragment shader. Null pauses rendering without tearing down. */
  fragmentSource: string | null;
  /** Source image for `uMainSampler`. */
  texture: TexImageSource | null;
  /** Parameter values by uniform name. */
  parameters?: ReadonlyMap<string, ShaderPreviewParameterValue>;
  /** Stop the animation loop — e.g. for an offscreen node thumbnail. */
  paused?: boolean;
  /**
   * Called once the canvas has actually drawn something.
   *
   * A canvas is transparent between being mounted and being rendered into, and
   * these effects run AFTER paint — so a caller that swaps a picture for a live
   * preview gets a frame of nothing in between, which reads as a flash. This is
   * how it knows when there is something to show. Optional, and nothing else
   * asks: the editor's canvases are already on screen before they matter.
   */
  onFirstFrame?: () => void;
}

export interface UseShaderPreviewResult {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  /** The driver's message when the shader failed, else null. */
  error: ShaderCompileError | Error | null;
  /**
   * The current frame as a PNG — null before a shader has been set.
   *
   * For a caller that takes the canvas away and must leave a picture behind.
   * It has to be `readPixels`, and therefore has to come from in here: without
   * `preserveDrawingBuffer` the canvas element hands back a blank square.
   *
   * It also has to RE-RENDER first, which is the part that is easy to get
   * wrong. `readPixels` only sees the drawing buffer within the task that drew
   * it; called from an event handler — a pointer leaving a row — the last
   * animation frame has long since been presented and the buffer cleared, and
   * what comes back is transparent black. A blank PNG is still a valid 72×72
   * PNG, so nothing complains: the picture just goes empty.
   */
  snapshot: () => string | null;
  /**
   * The same frame, drawn straight into a canvas the caller already has on
   * screen — synchronous, so there is no decode to lose a race to.
   */
  snapshotInto: (target: HTMLCanvasElement) => boolean;
}

/**
 * Run a compiled effect on a canvas.
 *
 * The animation loop reads the latest parameters through a ref rather than
 * re-subscribing on every change: a learner dragging a slider would otherwise
 * cancel and restart the loop on every pointer move.
 */
export function useShaderPreview({
  fragmentSource,
  texture,
  parameters,
  paused = false,
  onFirstFrame,
}: UseShaderPreviewOptions): UseShaderPreviewResult {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<ShaderPreview | null>(null);
  const parametersRef = useRef(parameters);
  const [error, setError] = useState<ShaderCompileError | Error | null>(null);
  // Through a ref for the reason the parameters are: a caller passing an inline
  // arrow must not cancel and restart the animation loop on every render.
  const onFirstFrameRef = useRef(onFirstFrame);

  parametersRef.current = parameters;
  onFirstFrameRef.current = onFirstFrame;

  // One renderer per canvas, for the life of the canvas.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    try {
      previewRef.current = new ShaderPreview(canvas);
      setError(null);
    } catch (creationError) {
      setError(creationError as Error);
      return;
    }

    return () => {
      previewRef.current?.dispose();
      previewRef.current = null;
    };
  }, []);

  useEffect(() => {
    const preview = previewRef.current;
    if (!preview || !fragmentSource) {
      return;
    }

    try {
      preview.setFragmentShader(fragmentSource);
      setError(null);
    } catch (compileError) {
      setError(compileError as Error);
    }
  }, [fragmentSource]);

  useEffect(() => {
    if (previewRef.current && texture) {
      previewRef.current.setTexture(texture);
    }
  }, [texture]);

  useEffect(() => {
    const preview = previewRef.current;
    if (!preview || !fragmentSource || error) {
      return;
    }

    let frame = 0;
    let drawn = false;

    const draw = () => {
      // Both clocks come from the shared preview clock, so every canvas —
      // output row, node thumbnails — shows the same instant of the same
      // animation. A preview opened mid-flight joins in phase rather than
      // starting the effect over.
      preview.render(previewTime(), previewEffectTime(), parametersRef.current);
      if (!drawn) {
        drawn = true;
        onFirstFrameRef.current?.();
      }
      if (!paused) {
        frame = requestAnimationFrame(draw);
      }
    };

    draw();
    return () => cancelAnimationFrame(frame);
  }, [fragmentSource, paused, error]);

  return {
    canvasRef,
    error,
    snapshot: () => {
      const preview = previewRef.current;
      if (!preview) {
        return null;
      }
      // Draw and read in ONE task — see the note on the type above.
      preview.render(previewTime(), previewEffectTime(), parametersRef.current);
      return preview.snapshot();
    },
    snapshotInto: target => {
      const preview = previewRef.current;
      if (!preview) {
        return false;
      }
      preview.render(previewTime(), previewEffectTime(), parametersRef.current);
      return preview.snapshotInto(target);
    },
  };
}
