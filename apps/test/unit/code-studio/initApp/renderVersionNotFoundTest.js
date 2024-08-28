import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {VersionNotFoundAlert} from '@cdo/apps/code-studio/initApp/renderVersionNotFound';

describe('VersionNotFoundAlert', () => {
  it('renders AlertExclamation with message', () => {
    const wrapper = shallow(<VersionNotFoundAlert />);
    expect(wrapper.find('AlertExclamation').length).toBe(1);
    expect(wrapper.find('a').text()).toContain('Go to Code Studio');
  });
});
