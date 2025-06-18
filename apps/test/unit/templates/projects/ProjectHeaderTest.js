import {render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';

import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';
import currentUser, {
  setInitialData,
} from '@cdo/apps/templates/currentUserRedux';
import ProjectHeader from '@cdo/apps/templates/projects/ProjectHeader.jsx';

describe('ProjectHeader', () => {
  let store;
  beforeEach(() => {
    stubRedux();
    registerReducers({currentUser});
    store = getStore();
    store.dispatch(
      setInitialData({
        id: 1,
        name: 'test_user',
        has_completed_ai_differentiation_welcome: true,
      })
    );
  });

  afterEach(() => {
    restoreRedux();
  });

  function renderDefault() {
    render(
      <Provider store={store}>
        <ProjectHeader canViewAdvancedTools={true} projectCount={200} />
      </Provider>
    );
  }

  it('renders the correct project count in subheading', () => {
    renderDefault();

    expect(
      screen.getByText('Over 200 million projects created')
    ).toBeInTheDocument();
  });
});
