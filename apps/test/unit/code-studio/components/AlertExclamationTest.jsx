import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import AlertExclamation from '@cdo/apps/code-studio/components/AlertExclamation';

describe('AlertExclamation', () => {
  it('renders children in table', () => {
    const wrapper = shallow(
      <AlertExclamation>
        <div id="unit-test-child-div" />
      </AlertExclamation>
    );
    expect(wrapper.find('table').length).toBe(1);
    expect(wrapper.find('table').find('#unit-test-child-div').length).toBe(1);
    expect(wrapper.text()).toContain('!');
  });
});
