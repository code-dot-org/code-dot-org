import {render} from '@testing-library/react';
import {beforeAll, describe, expect, it, vi} from 'vitest';

import OceansLab from '../../src/App';

// jsdom does not implement canvas; stub the 2D context so initAll doesn't throw.
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    clearRect: vi.fn(),
    drawImage: vi.fn(),
    fillRect: vi.fn(),
    getImageData: vi.fn(() => ({data: new Uint8ClampedArray(4)})),
    putImageData: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({width: 0})),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    scale: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    canvas: {width: 1024, height: 576},
  }));
});

describe('OceansLab default export', () => {
  it('is a function (renderable component)', () => {
    expect(typeof OceansLab).toBe('function');
  });

  it('renders the container element without throwing', () => {
    const {container} = render(<OceansLab />);
    expect(container.querySelector('#container-react')).not.toBeNull();
  });
});
