import {render, screen, fireEvent} from '@testing-library/react';
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
import Incubator from '@cdo/apps/templates/studioHomepages/Incubator.jsx';
import experiments from '@cdo/apps/util/experiments';
import i18n from '@cdo/locale';

// Needed to mock out the PDFDownloadLink component in the AiDiffContainer
jest.mock('@react-pdf/renderer', () => ({
  PDFDownloadLink: () => null,
  StyleSheet: {
    create: () => null,
  },
}));

describe('Incubator', () => {
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
    window.HTMLElement.prototype.scrollIntoView = () => {};
  });

  afterEach(() => {
    restoreRedux();
    jest.restoreAllMocks();
  });

  function renderDefault() {
    render(
      <Provider store={store}>
        <Incubator />
      </Provider>
    );
  }

  it('renders the AI Diff FAB when experiment is enabled', async () => {
    // mock experiment is enabled
    experiments.isEnabled = jest.fn(() => true);
    renderDefault();

    const chatButton = await screen.findByRole('button', {
      name: i18n.openOrCloseTeachingAssistant(),
    });
    fireEvent.click(chatButton);
    expect(screen.getByText('AI Teaching Assistant')).toBeVisible();
    experiments.isEnabled = jest.fn(() => false);
  });
});
