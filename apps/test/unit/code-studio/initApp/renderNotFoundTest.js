import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {NotFoundAlert} from '@cdo/apps/code-studio/initApp/renderNotFound';

describe('NotFoundAlert', () => {
  it('renders AlertExclamation with message', () => {
    const wrapper = shallow(<NotFoundAlert />);
    expect(wrapper.find('AlertExclamation').length).to.equal(1);
    expect(wrapper.find('a').text()).to.include('Go to Code Studio');
  });
});
