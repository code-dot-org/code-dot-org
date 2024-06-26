import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {VersionNotFoundAlert} from '@cdo/apps/code-studio/initApp/renderVersionNotFound';

import {expect} from '../../../util/reconfiguredChai';

describe('VersionNotFoundAlert', () => {
  it('renders AlertExclamation with message', () => {
    const wrapper = shallow(<VersionNotFoundAlert />);
    expect(wrapper.find('AlertExclamation').length).to.equal(1);
    expect(wrapper.find('a').text()).to.include('Go to Code Studio');
  });
});
