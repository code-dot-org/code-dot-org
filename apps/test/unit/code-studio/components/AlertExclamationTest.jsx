import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import AlertExclamation from '@cdo/apps/code-studio/components/AlertExclamation';

describe('AlertExclamation', () => {
  it('renders children in table', () => {
    const wrapper = shallow(
      <AlertExclamation>
        <div id="unit-test-child-div" />
      </AlertExclamation>
    );
    expect(wrapper.find('table').length).to.equal(1);
    expect(wrapper.find('table').find('#unit-test-child-div').length).to.equal(
      1
    );
    expect(wrapper.text()).contains('!');
  });
});
