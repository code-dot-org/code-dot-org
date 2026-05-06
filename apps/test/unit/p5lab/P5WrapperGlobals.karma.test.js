import createP5Wrapper from '../../util/gamelab/TestableP5Wrapper';
import {expect} from '../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports
import {sandboxDocumentBody} from '../../util/testUtils';

describe('P5Wrapper globals', function () {
  let p5Wrapper;

  sandboxDocumentBody(false);

  beforeEach(function () {
    p5Wrapper = createP5Wrapper();
  });

  it('does not export internal underscore-prefixed p5 properties', function () {
    const propList = p5Wrapper.getGlobalPropertyList();

    expect(propList).not.to.have.property('_setProperty');
    expect(propList).not.to.have.property('_draw');
    expect(propList).to.have.property('rect');
  });
});
