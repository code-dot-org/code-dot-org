import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import Pairing from '@cdo/apps/code-studio/components/pairing/Pairing';
import PairingDialog from '@cdo/apps/code-studio/components/pairing/PairingDialog';

describe('PairingDialog', () => {
  it('renders nothing until opened', () => {
    const wrapper = shallow(<PairingDialog source="Any old test string" />);
    expect(wrapper.isEmptyRender()).toBe(true);
  });

  it('renders the Pairing component when opened, and unmounts on close', () => {
    const wrapper = shallow(<PairingDialog source="Another test string" />);

    wrapper.instance().open();
    wrapper.update();
    expect(
      wrapper.containsMatchingElement(<Pairing source="Another test string" />)
    ).toBe(true);

    wrapper.instance().close();
    wrapper.update();
    expect(wrapper.isEmptyRender()).toBe(true);
  });
});
