import {
  blankPaintImage,
  blankPaintSpec,
} from '@cdo/apps/p5lab/spritelab/lab2/paintBlank';

describe('blankPaintSpec', () => {
  it('gives a hand-drawn pixel sprite a 24 by 24 grid, one canvas pixel each', () => {
    const spec = blankPaintSpec('sprite', 'pixel');
    expect(spec.pixelGridSize).toBe(1);
    expect(spec.size).toBe(24);
  });

  it('gives a pixel block the grid the AI is asked for', () => {
    // 1024/32 logical pixels.
    expect(blankPaintSpec('block', 'pixel').size).toBe(32);
  });

  it('gives pixel backgrounds the finer per-type grid', () => {
    const spec = blankPaintSpec('background', 'pixel');
    // 1024/8 logical pixels, one canvas pixel each.
    expect(spec.pixelGridSize).toBe(1);
    expect(spec.size).toBe(128);
  });

  it('sizes smooth style at the stored ceiling for its type, with no grid', () => {
    const sprite = blankPaintSpec('sprite', 'smooth');
    expect(sprite.pixelGridSize).toBeUndefined();
    expect(sprite.size).toBe(512);
    expect(blankPaintSpec('block', 'smooth').size).toBe(256);
    // No ceiling for backgrounds: they keep the model output size.
    expect(blankPaintSpec('background', 'smooth').size).toBe(1024);
  });

  it('fills backgrounds black and everything else transparent', () => {
    expect(blankPaintSpec('background', 'smooth').fill).toBe('black');
    expect(blankPaintSpec('background', 'pixel').fill).toBe('black');
    expect(blankPaintSpec('sprite', 'smooth').fill).toBe('transparent');
    expect(blankPaintSpec('block', 'pixel').fill).toBe('transparent');
  });
});

describe('blankPaintImage', () => {
  it('renders the spec to a PNG data URI', () => {
    const image = blankPaintImage('background', 'pixel');
    expect(image.dataURI.startsWith('data:image/png')).toBe(true);
    expect(image.pixelGridSize).toBe(1);
  });
});
