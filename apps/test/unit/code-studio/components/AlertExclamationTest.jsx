import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import AlertExclamation from '@cdo/apps/code-studio/components/AlertExclamation';

import {expect} from '../../../util/reconfiguredChai';

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
