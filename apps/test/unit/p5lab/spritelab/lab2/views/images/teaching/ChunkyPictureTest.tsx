import {render, waitFor} from '@testing-library/react';
import React from 'react';

import ChunkyPicture from '@cdo/apps/p5lab/spritelab/lab2/views/images/teaching/ChunkyPicture';

jest.mock('@cdo/apps/imageUtils', () => ({
  toImage: async () => ({naturalWidth: 64, naturalHeight: 32}),
}));

describe('ChunkyPicture', () => {
  afterEach(() => jest.restoreAllMocks());

  it('draws the picture through a coarse canvas of the given cells', async () => {
    const drawImage = jest.fn();
    const contexts: HTMLCanvasElement[] = [];
    jest
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockImplementation(function (this: HTMLCanvasElement) {
        contexts.push(this);
        return {drawImage} as unknown as CanvasRenderingContext2D;
      } as unknown as typeof HTMLCanvasElement.prototype.getContext);
    render(
      <ChunkyPicture src="data:one" cells={4} crop={{width: 32, height: 32}} />
    );
    await waitFor(() => expect(drawImage).toHaveBeenCalledTimes(2));
    // The coarse canvas is 4 cells square; the shown canvas is the crop's size.
    const [coarse, shown] = contexts;
    expect([coarse.width, coarse.height]).toEqual([4, 4]);
    expect([shown.width, shown.height]).toEqual([32, 32]);
    expect(drawImage).toHaveBeenLastCalledWith(coarse, 0, 0, 32, 32);
  });
});
