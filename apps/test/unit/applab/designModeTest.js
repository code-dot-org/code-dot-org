import {expect} from '../../util/configuredChai';
import designMode from '@cdo/apps/applab/designMode';

describe("appendPx", () => {
  it('returns a valid css positive integer', function () {
    const cssVal = designMode.appendPx(100);
    expect(cssVal).to.equal("100px");
  });
  it('returns 0 as a valid value', function () {
    const cssVal = designMode.appendPx(0);
    expect(cssVal).to.equal("0px");
  });
  it('returns the given stringified integer as a valid value', function () {
    const cssVal = designMode.appendPx("100");
    expect(cssVal).to.equal("100px");
  });
  it('returns a value with px as a valid value', function () {
    const cssVal = designMode.appendPx("100px");
    expect(cssVal).to.equal("100px");
  });
  it('returns an empty string', function () {
    const cssVal = designMode.appendPx("one hundred");
    expect(cssVal).to.equal("");
  });
  it('returns an empty string', function () {
    const cssVal = designMode.appendPx({object : 100});
    expect(cssVal).to.equal("");
  });
  it('returns an empty string', function () {
    const cssVal = designMode.appendPx(["bark", 300, 400]);
    expect(cssVal).to.equal("");
  });
  it('returns an empty string', function () {
    const cssVal = designMode.appendPx([200, 300, 400]);
    expect(cssVal).to.equal("");
  });
  it('returns an empty string', function () {
    const cssVal = designMode.appendPx();
    expect(cssVal).to.equal("");
  });
  it('returns an empty string', function () {
    const cssVal = designMode.appendPx(null);
    expect(cssVal).to.equal("");
  });
  it('returns an empty string', function () {
    const cssVal = designMode.appendPx(undefined);
    expect(cssVal).to.equal("");
  });
});
