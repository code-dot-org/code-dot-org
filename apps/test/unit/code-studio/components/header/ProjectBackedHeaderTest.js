import React from 'react';
import {Provider} from 'react-redux';
import {createStore, combineReducers} from 'redux';
import {mount} from 'enzyme';

import headerReducer, {
  showProjectBackedHeader
} from '@cdo/apps/code-studio/headerRedux';

import {expect} from '../../../../util/reconfiguredChai';

import ProjectExport from '@cdo/apps/code-studio/components/header/ProjectExport';
import ProjectBackedHeader from '@cdo/apps/code-studio/components/header/ProjectBackedHeader';

describe('ProjectHeader', () => {
  let store;
  beforeEach(() => {
    store = createStore(combineReducers({header: headerReducer}));
    store.dispatch(showProjectBackedHeader(false /* showExport */));
  });

  it('renders', () => {
    mount(
      <Provider store={store}>
        <ProjectBackedHeader />
      </Provider>
    );
  });

  it('does not include ProjectExport', () => {
    const wrapper = mount(
      <Provider store={store}>
        <ProjectBackedHeader />
      </Provider>
    );
    expect(wrapper.find(ProjectExport)).to.have.lengthOf(0);
  });

  it('does include ProjectExport when showProjectBackedHeader has showExport set to true', () => {
    store.dispatch(showProjectBackedHeader(true /* showExport */));

    const wrapper = mount(
      <Provider store={store}>
        <ProjectBackedHeader />
      </Provider>
    );
    expect(wrapper.find(ProjectExport)).to.have.lengthOf(1);
  });
});
