import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {ProjectNotFoundAlert} from '@cdo/apps/code-studio/initApp/renderProjectNotFound';

describe('ProjectNotFoundAlert', () => {
  it('renders AlertExclamation with message', () => {
    const wrapper = shallow(<ProjectNotFoundAlert />);
    expect(wrapper.find('AlertExclamation').length).toBe(1);
    expect(wrapper.find('a').text()).toContain('Go to Code Studio');
  });
});
