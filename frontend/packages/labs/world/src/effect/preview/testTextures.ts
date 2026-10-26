/**
 * The textures the input row offers for testing.
 *
 * These are drawn procedurally rather than loaded as assets so the editor has
 * no asset pipeline to stand up and works offline in a sandbox. When the World
 * lab's sprite library is wired in, `EffectEditor` takes real Actor frames
 * through the same `TestTexture` shape and these become the fallback.
 */

export interface TestTexture {
  id: string;
  label: string;
  /** Why a learner would pick this one — shown in the picker. */
  hint: string;
  draw(context: CanvasRenderingContext2D, size: number): void;
}

function checkerboard(
  context: CanvasRenderingContext2D,
  size: number,
  cells: number,
  light: string,
  dark: string,
): void {
  const step = size / cells;
  for (let row = 0; row < cells; row += 1) {
    for (let column = 0; column < cells; column += 1) {
      context.fillStyle = (row + column) % 2 === 0 ? light : dark;
      context.fillRect(column * step, row * step, step, step);
    }
  }
}

export const testTextures: readonly TestTexture[] = [
  {
    id: 'checker',
    label: 'Checkerboard',
    hint: 'Shows warping and distortion clearly.',
    draw: (context, size) =>
      checkerboard(context, size, 8, '#ffffff', '#3b4a6b'),
  },
  {
    id: 'gradient',
    label: 'Gradient',
    hint: 'Shows brightness and color changes clearly.',
    draw: (context, size) => {
      const gradient = context.createLinearGradient(0, 0, size, size);
      gradient.addColorStop(0, '#ff5c7a');
      gradient.addColorStop(0.5, '#ffd166');
      gradient.addColorStop(1, '#22c1c3');
      context.fillStyle = gradient;
      context.fillRect(0, 0, size, size);
    },
  },
  {
    id: 'sprite',
    label: 'Sprite',
    hint: 'A stand-in Actor, with transparency around it.',
    draw: (context, size) => {
      const center = size / 2;
      const radius = size * 0.32;

      context.fillStyle = '#5a6fd6';
      context.beginPath();
      context.arc(center, center, radius, 0, Math.PI * 2);
      context.fill();

      context.fillStyle = '#ffffff';
      for (const offset of [-radius * 0.35, radius * 0.35]) {
        context.beginPath();
        context.arc(
          center + offset,
          center - radius * 0.2,
          radius * 0.16,
          0,
          Math.PI * 2,
        );
        context.fill();
      }

      context.strokeStyle = '#ffffff';
      context.lineWidth = size * 0.02;
      context.beginPath();
      context.arc(
        center,
        center + radius * 0.15,
        radius * 0.45,
        0.2,
        Math.PI - 0.2,
      );
      context.stroke();
    },
  },
  {
    id: 'grid',
    label: 'Fine Grid',
    hint: 'Fine lines make small ripples and blurs visible.',
    draw: (context, size) => {
      context.fillStyle = '#101426';
      context.fillRect(0, 0, size, size);
      context.strokeStyle = '#6ee7ff';
      context.lineWidth = Math.max(1, size / 256);
      const step = size / 16;
      context.beginPath();
      for (let offset = 0; offset <= size; offset += step) {
        context.moveTo(offset, 0);
        context.lineTo(offset, size);
        context.moveTo(0, offset);
        context.lineTo(size, offset);
      }
      context.stroke();
    },
  },
];

export const defaultTestTextureId = testTextures[0].id;

export function findTestTexture(id: string | undefined): TestTexture {
  return testTextures.find(texture => texture.id === id) ?? testTextures[0];
}

/**
 * Render a test texture to an offscreen canvas ready for `gl.texImage2D`.
 *
 * Returns null when a 2D context is unavailable — which happens under jsdom,
 * where tests exercise the compiler rather than the pixels.
 */
export function renderTestTexture(
  texture: TestTexture,
  size = 256,
): HTMLCanvasElement | null {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext('2d');
  if (!context) {
    return null;
  }

  context.clearRect(0, 0, size, size);
  texture.draw(context, size);
  return canvas;
}
