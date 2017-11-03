import {expect} from '../../util/configuredChai';
import {appendPx} from '@cdo/apps/applab/designMode';

describe("appendPx", () => {
  it('returns a valid css positive integer', function () {
    const cssVal = appendPx(100);
    expect(cssVal).to.equal("100px");
  });
  it('returns 0 as a valid value', function () {
    const cssVal = appendPx(0);
    expect(cssVal).to.equal("0px");
  });
  it('returns the given stringified integer as a valid value', function () {
    const cssVal = appendPx("100");
    expect(cssVal).to.equal("100px");
  });
  it('returns a value with px as a valid value', function () {
    const cssVal = appendPx("100px");
    expect(cssVal).to.equal("100px");
  });
});
