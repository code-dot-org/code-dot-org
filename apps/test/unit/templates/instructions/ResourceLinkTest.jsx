import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon';

import ResourceLink from '@cdo/apps/templates/instructions/ResourceLink';



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
    expect(windowOpenStub.callCount).toBe(1);
    sinon.restore();
  });
});
