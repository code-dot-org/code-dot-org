import {render, screen} from '@testing-library/react';
import React from 'react';

import {toImage} from '@cdo/apps/imageUtils';
import {CHARACTER_STRIP_POSES} from '@cdo/apps/p5lab/spritelab/lab2/characterAnimations';
import ImageFrame from '@cdo/apps/p5lab/spritelab/lab2/views/images/ImageFrame';
import {ProjectImage} from '@cdo/apps/p5lab/spritelab/lab2/views/images/projectImages';

// The frame's picture never arrives; the frame is tested for what it holds.
jest.mock('@cdo/apps/imageUtils', () => ({
  toImage: jest.fn(() => new Promise(() => undefined)),
}));

const image: ProjectImage = {
  key: 'a',
  props: {name: 'Sprite 1'},
  name: 'Sprite 1',
  imageType: 'sprite',
  src: 'data:a',
  thumb: 'data:a',
  pixelated: true,
};

describe('ImageFrame', () => {
  it('shows the chosen image as the one image, named for it', () => {
    render(<ImageFrame image={image} />);
    expect(screen.getByRole('img', {name: 'Sprite 1'})).toBeTruthy();
  });

  it('shows one frame of a character set, still: the standing one unless told', () => {
    const set: ProjectImage = {
      ...image,
      sheet: {
        src: 'data:sheet',
        frameSize: {x: 64, y: 64},
        poses: CHARACTER_STRIP_POSES,
      },
    };
    const {rerender} = render(<ImageFrame image={set} />);
    expect(toImage).toHaveBeenCalledWith('data:sheet');
    const picture = screen.getByRole('img', {name: 'Sprite 1'});
    expect(picture.querySelector('canvas')).toBeTruthy();
    expect(picture.querySelector('canvas[aria-label]')).toBeNull();
    rerender(<ImageFrame image={set} frame={3} />);
    expect(picture.querySelector('canvas')).toBeTruthy();
  });

  it("names an empty frame, and the scene's own picture", () => {
    const {rerender} = render(<ImageFrame image={null} />);
    expect(screen.getByRole('img', {name: 'No picture yet'})).toBeTruthy();
    rerender(<ImageFrame image={null} live={<span>made</span>} />);
    expect(screen.getByRole('img', {name: 'Your picture'})).toBeTruthy();
  });

  it("sizes the checkerboard as the paint tools do, and starts it at the picture's corner", () => {
    const wide: ProjectImage = {
      ...image,
      props: {
        name: 'Sprite 1',
        sourceSize: {x: 90, y: 60},
        pixelGridSize: 1,
      },
    };
    render(<ImageFrame image={wide} />);
    const frame = screen.getByRole('img', {name: 'Sprite 1'}).parentElement!;
    // One square per art pixel: a tile of two is 2/90 of the frame.
    expect(
      parseFloat(frame.style.getPropertyValue('--checker-tile'))
    ).toBeCloseTo(200 / 90, 6);
    expect(frame.style.getPropertyValue('--checker-x')).toBe('0%');
    // The picture is a sixth of the frame down: 16.67% of the frame, as a
    // share of the frame less one tile.
    expect(parseFloat(frame.style.getPropertyValue('--checker-y'))).toBeCloseTo(
      100 / 6 / (1 - 2 / 90),
      6
    );
  });

  it('leaves the checkerboard alone for a picture of unknown size', () => {
    render(<ImageFrame image={image} />);
    const frame = screen.getByRole('img', {name: 'Sprite 1'}).parentElement!;
    expect(frame.style.getPropertyValue('--checker-tile')).toBe('');
  });

  it('keeps controls over the picture reachable, and reads the tip aloud', () => {
    render(
      <ImageFrame
        image={image}
        overlay={<button type="button">Good</button>}
        tip="AI learns from millions of pictures."
      />
    );
    expect(screen.getByRole('button', {name: 'Good'})).toBeTruthy();
    expect(screen.getByRole('status').textContent).toContain(
      'AI learns from millions of pictures.'
    );
  });

  it('is a workspace, with no image role, while the tools are open', () => {
    render(
      <ImageFrame
        image={image}
        workspaceClassName="paint"
        live={<canvas data-canvas />}
      />
    );
    expect(screen.queryByRole('img')).toBeNull();
  });
});
