import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {ProjectNotFoundAlert} from '@cdo/apps/code-studio/initApp/renderProjectNotFound';

describe('ProjectNotFoundAlert', () => {
  it('renders AlertExclamation with message', () => {
    const wrapper = shallow(<ProjectNotFoundAlert />);
    expect(wrapper.find('AlertExclamation').length).to.equal(1);
    expect(wrapper.find('a').text()).to.include('Go to Code Studio');
  });
});
