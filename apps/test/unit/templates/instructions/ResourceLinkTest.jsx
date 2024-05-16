import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon';

import ResourceLink from '@cdo/apps/templates/instructions/ResourceLink';

import {expect} from '../../../util/reconfiguredChai';

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
    sinon.restore();
  });
});
