import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../util/configuredChai';
import Certificate from '@cdo/apps/templates/Certificate';
import {combineReducers, createStore} from 'redux';
import responsive from '@cdo/apps/code-studio/responsiveRedux';

describe('Certificate', () => {
  const store = createStore(combineReducers({responsive}));

  it('renders a Minecraft certificate for new Minecraft tutorials', () => {
    const wrapper = shallow(
      <Certificate
        tutorial="minecraft"
      />, {context: {store}},
    ).dive();
    expect(wrapper.find('img').html().includes('MC_Hour_Of_Code_Certificate'));
  });

  it('renders a Minecraft certificate for older Minecraft tutorials', () => {
    const wrapper = shallow(
      <Certificate
        type="minecraft"
      />, {context: {store}},
    ).dive();
    expect(wrapper.find('img').html().includes('MC_Hour_Of_Code_Certificate'));
  });

  it('renders a default certificate for all other tutorials', () => {
    const wrapper = shallow(
      <Certificate
        tutorial="frozen"
      />, {context: {store}},
    ).dive();
    expect(wrapper.find('img').html().includes('hour_of_code_certificate'));
  });
});
