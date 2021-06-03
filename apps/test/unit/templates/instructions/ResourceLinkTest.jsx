import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/deprecatedChai';
import ResourceLink from '@cdo/apps/templates/instructions/ResourceLink';
import sinon from 'sinon';

describe('ResourceLink', () => {
  it('opens reference in new tab if openReferenceInNewTab is set', () => {
    const wrapper = shallow(
      <ResourceLink
        icon={'map'}
        reference={'/link/to/reference'}
        text={'Reference'}
        openReferenceInNewTab
      />
    );
    const windowOpenStub = sinon.stub(window, 'open');
    wrapper.instance().selectResource({preventDefault: () => {}});
    expect(windowOpenStub.callCount).to.equal(1);
  });
});
