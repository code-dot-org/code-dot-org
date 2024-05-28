import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import Pairing from '@cdo/apps/code-studio/components/pairing/Pairing';
import PairingDialog from '@cdo/apps/code-studio/components/pairing/PairingDialog';
import BaseDialog from '@cdo/apps/templates/BaseDialog';

import {expect} from '../../../../util/reconfiguredChai';

describe('PairingDialog', () => {
  it('renders a dialog containing the Pairing component', () => {
    const wrapper = shallow(<PairingDialog source="Any old test string" />);

    expect(
      wrapper.containsMatchingElement(
        <BaseDialog isOpen={false}>
          <Pairing source="Any old test string" />
        </BaseDialog>
      )
    ).to.be.true;
  });

  it('can be opened and closed with public methods', () => {
    const wrapper = shallow(<PairingDialog source="Another test string" />);

    expect(() => {
      wrapper.instance().open();
    }).not.to.throw();

    expect(
      wrapper.containsMatchingElement(
        <BaseDialog isOpen={true}>
          <Pairing source="Another test string" />
        </BaseDialog>
      )
    ).to.be.true;

    expect(() => {
      wrapper.instance().close();
    }).not.to.throw();

    expect(
      wrapper.containsMatchingElement(
        <BaseDialog isOpen={false}>
          <Pairing source="Another test string" />
        </BaseDialog>
      )
    ).to.be.true;
  });
});
