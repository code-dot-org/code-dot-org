import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';

import AiDiffFloatingActionButton from '@cdo/apps/aiDifferentiation/AiDiffFloatingActionButton';
import {getStore, registerReducers} from '@cdo/apps/redux';
import currentUser, {
  setInitialData,
} from '@cdo/apps/templates/currentUserRedux';
import HttpClient from '@cdo/apps/util/HttpClient';
import i18n from '@cdo/locale';

jest.mock('@react-pdf/renderer', () => {
  return {
    PDFDownloadLink: () => null,
    StyleSheet: {
      create: () => null,
    },
  };
});

const DEFAULT_PROPS = {
  scriptId: 1,
  scriptName: 'test_lesson',
  unitDisplayName: 'test unit name',
};

describe('AIDiffFloatingActionButton', () => {
  let fetchStub;

  beforeEach(() => {
    window.HTMLElement.prototype.scrollIntoView = () => {};
    sessionStorage.clear();
    fetchStub = jest.spyOn(HttpClient, 'post').mockResolvedValue();
  });

  afterEach(() => {
    sessionStorage.clear();
    jest.restoreAllMocks();
  });

  function renderDefault(propOverrides = {}, hasOpenedDiff = true) {
    const store = getStore();

    registerReducers({
      currentUser,
    });
    store.dispatch(
      setInitialData({
        id: 1,
        name: 'test_user',
        has_completed_ai_differentiation_welcome: true,
        has_opened_ai_differentiation: hasOpenedDiff,
      })
    );

    render(
      <Provider store={store}>
        <AiDiffFloatingActionButton {...DEFAULT_PROPS} {...propOverrides} />
      </Provider>
    );
  }

  it('begins closed', () => {
    renderDefault();
    expect(screen.getByText('AI Teaching Assistant')).not.toBeVisible();
  });

  it('begins open if no session storage and has not been opened before', () => {
    renderDefault({}, false);
    expect(screen.getByText('AI Teaching Assistant')).toBeVisible();
  });

  it('begins open if open set in session storage', () => {
    sessionStorage.setItem('AiDiffFabOpenStateKey', 'true');
    renderDefault();
    expect(screen.getByText('AI Teaching Assistant')).toBeVisible();
  });

  it('opens on click', async () => {
    renderDefault();
    fireEvent.click(
      screen.getByRole('button', {name: i18n.openOrCloseTeachingAssistant()})
    );
    await waitFor(() => {
      expect(fetchStub).toHaveBeenCalledWith(
        '/api/v1/users/has_opened_ai_differentiation',
        undefined,
        true
      );
    });
    expect(screen.getByText('AI Teaching Assistant')).toBeVisible();
  });

  describe('pulse animation', () => {
    it('renders pulse animation when hasOpenedDiff is false and window is closed', () => {
      sessionStorage.setItem('AiDiffFabOpenStateKey', 'false');
      renderDefault({}, false);
      const fab = screen.getByRole('button', {
        name: i18n.openOrCloseTeachingAssistant(),
      });
      expect(fab.classList.contains('unittest-fab-pulse')).toBe(false);

      const fabImage = screen.getByRole('img', {name: 'AI bot'});
      fireEvent.load(fabImage);
      expect(fab.classList.contains('unittest-fab-pulse')).toBe(true);
    });

    it('does not render pulse animation when hasOpenedDiff is true', () => {
      sessionStorage.setItem('AiDiffFabOpenStateKey', 'false');
      renderDefault();
      const image = screen.getByRole('img', {name: 'AI bot'});
      fireEvent.load(image);
      const fab = screen.getByRole('button', {
        name: i18n.openOrCloseTeachingAssistant(),
      });
      expect(fab.classList.contains('unittest-fab-pulse')).toBe(false);
    });
  });
});
