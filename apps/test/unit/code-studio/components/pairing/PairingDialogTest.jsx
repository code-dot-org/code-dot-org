import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import Pairing from '@cdo/apps/code-studio/components/pairing/Pairing';
import PairingDialog from '@cdo/apps/code-studio/components/pairing/PairingDialog';
import BaseDialog from '@cdo/apps/templates/BaseDialog';

describe('PairingDialog', () => {
  it('renders a dialog containing the Pairing component', () => {
    const wrapper = shallow(<PairingDialog source="Any old test string" />);

    expect(
      wrapper.containsMatchingElement(
        <BaseDialog isOpen={false}>
          <Pairing source="Any old test string" />
        </BaseDialog>
      )
    ).toBe(true);
  });

  it('can be opened and closed with public methods', () => {
    const wrapper = shallow(<PairingDialog source="Another test string" />);

    expect(() => {
      wrapper.instance().open();
    }).not.toThrow();

    expect(
      wrapper.containsMatchingElement(
        <BaseDialog isOpen={true}>
          <Pairing source="Another test string" />
        </BaseDialog>
      )
    ).toBe(true);

    expect(() => {
      wrapper.instance().close();
    }).not.toThrow();

    expect(
      wrapper.containsMatchingElement(
        <BaseDialog isOpen={false}>
          <Pairing source="Another test string" />
        </BaseDialog>
      )
    ).toBe(true);
  });
});
