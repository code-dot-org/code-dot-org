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
}

export interface UseShaderPreviewResult {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  /** The driver's message when the shader failed, else null. */
  error: ShaderCompileError | Error | null;
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
}: UseShaderPreviewOptions): UseShaderPreviewResult {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<ShaderPreview | null>(null);
  const parametersRef = useRef(parameters);
  const [error, setError] = useState<ShaderCompileError | Error | null>(null);

  parametersRef.current = parameters;

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

    const draw = () => {
      // Both clocks come from the shared preview clock, so every canvas —
      // output row, node thumbnails — shows the same instant of the same
      // animation. A preview opened mid-flight joins in phase rather than
      // starting the effect over.
      preview.render(previewTime(), previewEffectTime(), parametersRef.current);
      if (!paused) {
        frame = requestAnimationFrame(draw);
      }
    };

    draw();
    return () => cancelAnimationFrame(frame);
  }, [fragmentSource, paused, error]);

  return {canvasRef, error};
}
