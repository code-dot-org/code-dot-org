import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/configuredChai';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import Pairing from '@cdo/apps/code-studio/components/pairing/Pairing';
import PairingDialog from '@cdo/apps/code-studio/components/pairing/PairingDialog';

describe('PairingDialog', () => {
  it('renders a dialog containing the Pairing component', () => {
    const wrapper = shallow(
      <PairingDialog source="Any old test string"/>
    );

    expect(wrapper).to.containMatchingElement(
      <BaseDialog isOpen={false}>
        <Pairing source="Any old test string"/>
      </BaseDialog>
    );
  });

  it('can be opened and closed with public methods', () => {
    const wrapper = shallow(
      <PairingDialog source="Another test string"/>
    );

    expect(() => {
      wrapper.instance().open();
    }).not.to.throw();

    expect(wrapper).to.containMatchingElement(
      <BaseDialog isOpen={true}>
        <Pairing source="Another test string"/>
      </BaseDialog>
    );

    expect(() => {
      wrapper.instance().close();
    }).not.to.throw();

    expect(wrapper).to.containMatchingElement(
      <BaseDialog isOpen={false}>
        <Pairing source="Another test string"/>
      </BaseDialog>
    );
  });
});
