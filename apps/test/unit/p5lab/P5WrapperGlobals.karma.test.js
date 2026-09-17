import CustomMarshaler from '@cdo/apps/lib/tools/jsinterpreter/CustomMarshaler';
import CustomMarshalingInterpreter from '@cdo/apps/lib/tools/jsinterpreter/CustomMarshalingInterpreter';

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

  it('blocks underscore-prefixed p5 internals on custom-marshaled objects', function () {
    const interpreter = new CustomMarshalingInterpreter(
      '',
      new CustomMarshaler({
        blockedProperties: p5Wrapper.getCustomMarshalBlockedProperties(),
        objectList: p5Wrapper.getCustomMarshalObjectList(),
      })
    );
    const sprite = p5Wrapper.p5.createSprite(10, 20);
    const marshaledSprite = interpreter.marshalNativeToInterpreter(sprite);

    expect(interpreter.hasProperty(marshaledSprite, 'isTouching')).to.be.true;
    expect(interpreter.hasProperty(marshaledSprite, '_collideWith')).to.be
      .false;
    expect(interpreter.getProperty(marshaledSprite, '_collideWith')).to.equal(
      interpreter.UNDEFINED
    );
  });
});
