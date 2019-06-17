import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../util/configuredChai';
import Certificate from '@cdo/apps/templates/Certificate';
import {combineReducers, createStore} from 'redux';
import responsive from '@cdo/apps/code-studio/responsiveRedux';

describe('Certificate', () => {
  const store = createStore(combineReducers({responsive}));
  let storedWindowDashboard;

  beforeEach(() => {
    storedWindowDashboard = window.dashboard;
    window.dashboard = {
      CODE_ORG_URL: 'https://code.org'
    };
  });

  afterEach(() => {
    window.dashboard = storedWindowDashboard;
  });

  it('renders Minecraft certificate for Minecraft Adventurer', () => {
    const wrapper = shallow(<Certificate tutorial="mc" />, {
      context: {store}
    }).dive();
    expect(wrapper.find('img').html()).to.include(
      'MC_Hour_Of_Code_Certificate'
    );
  });

  it('renders Minecraft certificate for Minecraft Designer', () => {
    const wrapper = shallow(<Certificate tutorial="minecraft" />, {
      context: {store}
    }).dive();
    expect(wrapper.find('img').html()).to.include(
      'MC_Hour_Of_Code_Certificate'
    );
  });

  it("renders unique certificate for Minecraft Hero's Journey", () => {
    const wrapper = shallow(<Certificate tutorial="hero" />, {
      context: {store}
    }).dive();
    expect(wrapper.find('img').html()).to.include(
      'MC_Hour_Of_Code_Certificate_Hero'
    );
  });

  it('renders unique certificate for Minecraft Voyage Aquatic', () => {
    const wrapper = shallow(<Certificate tutorial="aquatic" />, {
      context: {store}
    }).dive();
    expect(wrapper.find('img').html()).to.include(
      'MC_Hour_Of_Code_Certificate_Aquatic'
    );
  });

  it('renders default certificate for all other tutorials', () => {
    ['applab-intro', 'dance', 'flappy', 'frozen'].forEach(tutorial => {
      const wrapper = shallow(<Certificate tutorial={tutorial} />, {
        context: {store}
      }).dive();
      expect(wrapper.find('img').html()).to.include('hour_of_code_certificate');
    });
  });
});
