import {
  blankPaintImage,
  blankPaintSpec,
} from '@cdo/apps/p5lab/spritelab/lab2/paintBlank';

describe('blankPaintSpec', () => {
  it('sizes pixel style on the generation grid, upscaled for storage', () => {
    const spec = blankPaintSpec('sprite', 'pixel');
    // 1024/16 logical pixels at the crisp storage scale.
    expect(spec.pixelGridSize).toBe(8);
    expect(spec.size).toBe(64 * 8);
  });

  it('sizes smooth style at the model output size, with no grid', () => {
    const spec = blankPaintSpec('sprite', 'smooth');
    expect(spec.pixelGridSize).toBeUndefined();
    expect(spec.size).toBe(1024);
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
    expect(image.pixelGridSize).toBe(8);
  });
});
