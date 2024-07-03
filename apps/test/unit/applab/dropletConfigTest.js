/** @file Test applab droplet config behavior */
import {blocks} from '@cdo/apps/applab/dropletConfig';

describe(`Applab droplet configuration`, () => {
  it('uses half the max height for the default location of lines, circles, and rectangles', () => {
    const lineBlocks = blocks.filter(block => block.func === 'line');
    const circleBlocks = blocks.filter(block => block.func === 'circle');
    const rectBlocks = blocks.filter(block => block.func === 'rect');
    expect(lineBlocks).toHaveLength(1);
    expect(circleBlocks).toHaveLength(1);
    expect(rectBlocks).toHaveLength(1);
    expect(lineBlocks[0].params[3]).toBe(225);
    expect(circleBlocks[0].params[1]).toBe(225);
    expect(rectBlocks[0].params[3]).toBe(225);
  });
});
