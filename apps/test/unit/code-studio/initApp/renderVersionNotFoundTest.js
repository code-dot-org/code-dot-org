import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {VersionNotFoundAlert} from '@cdo/apps/code-studio/initApp/renderVersionNotFound';

describe('VersionNotFoundAlert', () => {
  it('renders AlertExclamation with message', () => {
    const wrapper = shallow(<VersionNotFoundAlert />);
    expect(wrapper.find('AlertExclamation').length).to.equal(1);
    expect(wrapper.find('a').text()).to.include('Go to Code Studio');
  });
});
