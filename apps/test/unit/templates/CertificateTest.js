import React from 'react';
import {Provider} from 'react-redux';
import {mount} from 'enzyme';
import {expect} from '../../util/reconfiguredChai';
import Certificate from '@cdo/apps/templates/Certificate';
import {combineReducers, createStore} from 'redux';
import responsive from '@cdo/apps/code-studio/responsiveRedux';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';

const store = createStore(combineReducers({responsive, isRtl}));

function wrapperWithTutorial(tutorial) {
  return mount(
    <Provider store={store}>
      <Certificate tutorial={tutorial} />
    </Provider>
  );
}

describe('Certificate', () => {
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
    const wrapper = wrapperWithTutorial('mc');
    expect(wrapper.find('img').html()).to.include(
      'MC_Hour_Of_Code_Certificate'
    );
  });

  it('renders Minecraft certificate for Minecraft Designer', () => {
    const wrapper = wrapperWithTutorial('minecraft');
    expect(wrapper.find('img').html()).to.include(
      'MC_Hour_Of_Code_Certificate'
    );
  });

  it("renders unique certificate for Minecraft Hero's Journey", () => {
    const wrapper = wrapperWithTutorial('hero');
    expect(wrapper.find('img').html()).to.include(
      'MC_Hour_Of_Code_Certificate_Hero'
    );
  });

  it('renders unique certificate for Minecraft Voyage Aquatic', () => {
    const wrapper = wrapperWithTutorial('aquatic');
    expect(wrapper.find('img').html()).to.include(
      'MC_Hour_Of_Code_Certificate_Aquatic'
    );
  });

  it('renders default certificate for all other tutorials', () => {
    ['applab-intro', 'dance', 'flappy', 'frozen'].forEach(tutorial => {
      const wrapper = wrapperWithTutorial(tutorial);
      expect(wrapper.find('img').html()).to.include('hour_of_code_certificate');
    });
  });
});
