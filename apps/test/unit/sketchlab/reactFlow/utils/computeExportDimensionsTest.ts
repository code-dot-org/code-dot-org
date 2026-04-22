import {computeExportDimensions} from '@cdo/apps/sketchlab/reactFlow/utils/computeExportDimensions';

describe('computeExportDimensions', () => {
  const PADDING = 10;
  const MAX_DIM = 2048;

  it('exports small content at 1:1 with padding on each side', () => {
    const result = computeExportDimensions(
      {minX: 0, minY: 0, maxX: 100, maxY: 50},
      PADDING,
      MAX_DIM
    );
    expect(result).toEqual({
      imageWidth: 120,
      imageHeight: 70,
      scale: 1,
      translateX: 10,
      translateY: 10,
    });
  });

  it('offsets translation so negative-origin content starts at padding', () => {
    const result = computeExportDimensions(
      {minX: -50, minY: -30, maxX: 50, maxY: 30},
      PADDING,
      MAX_DIM
    );
    expect(result.imageWidth).toBe(120);
    expect(result.imageHeight).toBe(80);
    expect(result.scale).toBe(1);
    expect(result.translateX).toBe(60);
    expect(result.translateY).toBe(40);
  });

  it('keeps scale at 1 when content + padding exactly equals maxDim', () => {
    const result = computeExportDimensions(
      {minX: 0, minY: 0, maxX: MAX_DIM - 2 * PADDING, maxY: 100},
      PADDING,
      MAX_DIM
    );
    expect(result.scale).toBe(1);
    expect(result.imageWidth).toBe(MAX_DIM);
  });

  it('scales down proportionally when wide content exceeds maxDim', () => {
    const result = computeExportDimensions(
      {minX: 0, minY: 0, maxX: 4000, maxY: 1000},
      PADDING,
      MAX_DIM
    );
    const expectedScale = MAX_DIM / (4000 + 2 * PADDING);
    expect(result.scale).toBeCloseTo(expectedScale);
    expect(result.imageWidth).toBe(MAX_DIM);
    expect(result.imageHeight).toBe(Math.round((1000 + 2 * PADDING) * expectedScale));
    expect(result.translateX).toBeCloseTo(PADDING * expectedScale);
    expect(result.translateY).toBeCloseTo(PADDING * expectedScale);
  });

  it('scales down proportionally when tall content exceeds maxDim', () => {
    const result = computeExportDimensions(
      {minX: 0, minY: 0, maxX: 1000, maxY: 4000},
      PADDING,
      MAX_DIM
    );
    const expectedScale = MAX_DIM / (4000 + 2 * PADDING);
    expect(result.scale).toBeCloseTo(expectedScale);
    expect(result.imageHeight).toBe(MAX_DIM);
    expect(result.imageWidth).toBe(Math.round((1000 + 2 * PADDING) * expectedScale));
  });

  it('picks the longer axis when both exceed maxDim', () => {
    const result = computeExportDimensions(
      {minX: 0, minY: 0, maxX: 3000, maxY: 5000},
      PADDING,
      MAX_DIM
    );
    const expectedScale = MAX_DIM / (5000 + 2 * PADDING);
    expect(result.scale).toBeCloseTo(expectedScale);
    expect(result.imageHeight).toBe(MAX_DIM);
  });

  it('honors zero padding', () => {
    const result = computeExportDimensions(
      {minX: 0, minY: 0, maxX: 100, maxY: 100},
      0,
      MAX_DIM
    );
    expect(result).toEqual({
      imageWidth: 100,
      imageHeight: 100,
      scale: 1,
      translateX: 0,
      translateY: 0,
    });
  });

  it('respects a custom maxDim smaller than the content', () => {
    const result = computeExportDimensions(
      {minX: 0, minY: 0, maxX: 500, maxY: 500},
      PADDING,
      256
    );
    const expectedScale = 256 / (500 + 2 * PADDING);
    expect(result.scale).toBeCloseTo(expectedScale);
    expect(result.imageWidth).toBe(256);
    expect(result.imageHeight).toBe(256);
  });
});
