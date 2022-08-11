import React from 'react';
import {Provider} from 'react-redux';
import {createStore, combineReducers} from 'redux';
import {mount} from 'enzyme';

import headerReducer, {
  showProjectHeader
} from '@cdo/apps/code-studio/headerRedux';

import {expect} from '../../../../util/reconfiguredChai';
import {replaceOnWindow, restoreOnWindow} from '../../../../util/testUtils';

import ProjectImport from '@cdo/apps/code-studio/components/header/ProjectImport';
import ProjectExport from '@cdo/apps/code-studio/components/header/ProjectExport';
import ProjectHeader from '@cdo/apps/code-studio/components/header/ProjectHeader';

describe('ProjectHeader', () => {
  let store;
  beforeEach(() => {
    replaceOnWindow('appOptions', {
      level: {}
    });
    store = createStore(combineReducers({header: headerReducer}));
    store.dispatch(showProjectHeader(false /* showExport */));
  });

  afterEach(() => {
    restoreOnWindow('appOptions');
  });

  it('renders', () => {
    mount(
      <Provider store={store}>
        <ProjectHeader />
      </Provider>
    );
  });

  it('includes ProjectImport for Code Connection projects', () => {
    window.appOptions.level.isConnectionLevel = true;
    const wrapper = mount(
      <Provider store={store}>
        <ProjectHeader />
      </Provider>
    );
    expect(wrapper.find(ProjectImport)).to.have.lengthOf(1);
  });

  it('does not include ProjectExport', () => {
    const wrapper = mount(
      <Provider store={store}>
        <ProjectHeader />
      </Provider>
    );
    expect(wrapper.find(ProjectExport)).to.have.lengthOf(0);
  });

  it('does include ProjectExport when showProjectHeader has showExport set to true', () => {
    store.dispatch(showProjectHeader(true /* showExport */));

    const wrapper = mount(
      <Provider store={store}>
        <ProjectHeader />
      </Provider>
    );
    expect(wrapper.find(ProjectExport)).to.have.lengthOf(1);
  });
});
