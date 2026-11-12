import {act, render, screen} from '@testing-library/react';
import React from 'react';

import {toImage} from '@cdo/apps/imageUtils';
import {drawStripCell} from '@cdo/apps/p5lab/spritelab/lab2/characterAnimations';
import StripFrame from '@cdo/apps/p5lab/spritelab/lab2/views/StripFrame';

jest.mock('@cdo/apps/imageUtils', () => ({toImage: jest.fn()}));
jest.mock('@cdo/apps/p5lab/spritelab/lab2/characterAnimations', () => ({
  ...jest.requireActual('@cdo/apps/p5lab/spritelab/lab2/characterAnimations'),
  drawStripCell: jest.fn(),
}));

const frameSize = {x: 64, y: 64};

describe('StripFrame', () => {
  beforeEach(() => {
    jest.mocked(drawStripCell).mockClear();
  });

  it('draws its frame into the canvas once the image has loaded', async () => {
    const image = {naturalWidth: 320} as HTMLImageElement;
    let loaded: (image: HTMLImageElement) => void = () => undefined;
    jest.mocked(toImage).mockReturnValue(
      new Promise(resolve => {
        loaded = resolve;
      })
    );
    render(
      <StripFrame sheetSrc="data:sheet" frameSize={frameSize} index={2} />
    );
    expect(drawStripCell).not.toHaveBeenCalled();
    await act(async () => loaded(image));
    expect(drawStripCell).toHaveBeenCalledWith(
      image,
      frameSize,
      2,
      expect.any(HTMLCanvasElement)
    );
  });

  it('ignores a load that lands after it is gone, and a load that fails', async () => {
    let loaded: (image: HTMLImageElement) => void = () => undefined;
    jest.mocked(toImage).mockReturnValue(
      new Promise(resolve => {
        loaded = resolve;
      })
    );
    const {unmount} = render(
      <StripFrame sheetSrc="data:sheet" frameSize={frameSize} index={0} />
    );
    unmount();
    await act(async () => loaded({naturalWidth: 320} as HTMLImageElement));
    expect(drawStripCell).not.toHaveBeenCalled();
    jest.mocked(toImage).mockRejectedValue(new Error('gone'));
    render(<StripFrame sheetSrc="data:lost" frameSize={frameSize} index={0} />);
    await act(async () => undefined);
    expect(drawStripCell).not.toHaveBeenCalled();
  });

  it('is an image when named, and hidden from assistive tech otherwise', () => {
    jest.mocked(toImage).mockReturnValue(new Promise(() => undefined));
    const {rerender} = render(
      <StripFrame sheetSrc="data:sheet" frameSize={frameSize} index={0} />
    );
    expect(screen.queryByRole('img')).toBeNull();
    rerender(
      <StripFrame
        sheetSrc="data:sheet"
        frameSize={frameSize}
        index={0}
        label="A wizard"
      />
    );
    expect(screen.getByRole('img', {name: 'A wizard'})).toBeTruthy();
  });
});
