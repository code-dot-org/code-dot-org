import styles from './PreviewCanvas.module.css';
import type {ShaderPreviewParameterValue} from './ShaderPreview';
import {useShaderPreview} from './useShaderPreview';

export interface PreviewCanvasProps {
  fragmentSource: string | null;
  texture: TexImageSource | null;
  parameters?: ReadonlyMap<string, ShaderPreviewParameterValue>;
  /** Edge length in CSS pixels. Previews are square, matching the spec's boxes. */
  size?: number;
  paused?: boolean;
  /** Describes what is being previewed, for screen readers. */
  label: string;
  className?: string;
}

/**
 * A square canvas running one compiled effect.
 *
 * Used for the output row and for every node's "eye" thumbnail, which is why
 * it takes a fragment source rather than a document — the inspector compiles a
 * different shader for the same graph.
 */
export function PreviewCanvas({
  fragmentSource,
  texture,
  parameters,
  size = 128,
  paused,
  label,
  className,
}: PreviewCanvasProps) {
  const {canvasRef, error} = useShaderPreview({
    fragmentSource,
    texture,
    parameters,
    paused,
  });

  return (
    <div
      className={className ? `${styles.wrapper} ${className}` : styles.wrapper}
      style={{width: size, height: size}}
      // The rendered result is the image, so the label belongs on the wrapper;
      // the canvas element itself carries no meaning for a screen reader.
      role="img"
      aria-label={label}
    >
      <canvas
        ref={canvasRef}
        // Backing store matches the display size; effects are cheap enough that
        // there is no reason to render below it.
        width={size}
        height={size}
        className={styles.canvas}
        aria-hidden="true"
      />
      {error && (
        <p className={styles.error} role="status">
          {error.message}
        </p>
      )}
    </div>
  );
}
