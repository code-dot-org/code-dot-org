import {expect} from '../../util/configuredChai';
import {rgb} from '@cdo/apps/applab/commands';

describe("rgb command", () => {
  it('returns an rgba string with no alpha', function () {
    const opts = {r: 255, g: 0, b: 75};
    expect(rgb(opts)).to.equal("rgba(255, 0, 75, 1)");
  });

  it('returns an rgba string with alpha', function () {
    const alphaOpts = {r: 255, g: 0, b: 75, a: 0.5};
    expect(rgb(alphaOpts)).to.equal("rgba(255, 0, 75, 0.5)");
  });
});
