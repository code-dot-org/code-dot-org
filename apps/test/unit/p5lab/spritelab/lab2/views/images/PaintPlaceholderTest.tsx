import {render} from '@testing-library/react';
import React from 'react';

import PaintPlaceholder from '@cdo/apps/p5lab/spritelab/lab2/views/images/PaintPlaceholder';

describe('PaintPlaceholder', () => {
  afterEach(() => jest.restoreAllMocks());

  it('paints a decoded picture into a canvas sized to it', () => {
    const drawImage = jest.fn();
    let sized: [number, number] | null = null;
    jest
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockImplementation(function (this: HTMLCanvasElement) {
        sized = [this.width, this.height];
        return {drawImage} as unknown as CanvasRenderingContext2D;
      } as unknown as typeof HTMLCanvasElement.prototype.getContext);
    const picture = {naturalWidth: 64, naturalHeight: 32} as HTMLImageElement;
    render(<PaintPlaceholder picture={picture} src="data:one" />);
    expect(sized).toEqual([64, 32]);
    expect(drawImage).toHaveBeenCalledWith(picture, 0, 0);
    // The fallback image is decorative (alt=""), so it has no role to query by.
    expect(document.querySelector('img')).toBeNull();
  });

  it('paints a canvas left behind at its own size', () => {
    const drawImage = jest.fn();
    let sized: [number, number] | null = null;
    jest
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockImplementation(function (this: HTMLCanvasElement) {
        sized = [this.width, this.height];
        return {drawImage} as unknown as CanvasRenderingContext2D;
      } as unknown as typeof HTMLCanvasElement.prototype.getContext);
    const left = document.createElement('canvas');
    left.width = 640;
    left.height = 640;
    render(<PaintPlaceholder picture={left} src="data:one" />);
    expect(sized).toEqual([640, 640]);
    expect(drawImage).toHaveBeenCalledWith(left, 0, 0);
  });

  it('falls back to loading the URL where nothing was decoded ahead', () => {
    const getContext = jest.spyOn(HTMLCanvasElement.prototype, 'getContext');
    render(<PaintPlaceholder src="data:one" />);
    expect(document.querySelector('img')).toHaveAttribute('src', 'data:one');
    expect(getContext).not.toHaveBeenCalled();
  });
});
