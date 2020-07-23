/** @file Test applab droplet config behavior */
import {expect} from '../../util/deprecatedChai';
import {blocks} from '@cdo/apps/applab/dropletConfig';

describe(`Applab droplet configuration`, () => {
  it('uses half the max height for the default location of lines, circles, and rectangles', () => {
    const lineBlocks = blocks.filter(block => block.func === 'line');
    const circleBlocks = blocks.filter(block => block.func === 'circle');
    const rectBlocks = blocks.filter(block => block.func === 'rect');
    expect(lineBlocks).to.have.length(1);
    expect(circleBlocks).to.have.length(1);
    expect(rectBlocks).to.have.length(1);
    expect(lineBlocks[0].params[3]).to.equal(225);
    expect(circleBlocks[0].params[1]).to.equal(225);
    expect(rectBlocks[0].params[3]).to.equal(225);
  });
});
