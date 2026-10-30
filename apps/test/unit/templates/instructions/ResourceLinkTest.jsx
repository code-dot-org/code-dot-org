import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

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
    const windowOpenStub = jest
      .spyOn(window, 'open')
      .mockClear()
      .mockImplementation();
    wrapper.instance().selectResource({preventDefault: () => {}});
    expect(windowOpenStub).toHaveBeenCalledTimes(1);
    jest.restoreAllMocks();
  });
});
