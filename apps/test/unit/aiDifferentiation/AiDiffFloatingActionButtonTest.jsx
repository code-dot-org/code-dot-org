import {render, screen, fireEvent} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';

import AiDiffFloatingActionButton from '@cdo/apps/aiDifferentiation/AiDiffFloatingActionButton';
import {getStore, registerReducers} from '@cdo/apps/redux';
import currentUser, {
  setInitialData,
} from '@cdo/apps/templates/currentUserRedux';
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
  beforeEach(() => {
    window.HTMLElement.prototype.scrollIntoView = () => {};
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  function renderDefault(propOverrides = {}) {
    const store = getStore();

    registerReducers({
      currentUser,
    });
    store.dispatch(
      setInitialData({
        id: 1,
        name: 'test_user',
        has_completed_ai_differentiation_welcome: true,
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

  it('begins open if open set in session storage', () => {
    sessionStorage.setItem('AiDiffFabOpenStateKey', 'true');
    renderDefault();
    expect(screen.getByText('AI Teaching Assistant')).toBeVisible();
  });

  it('opens on click', () => {
    renderDefault();
    fireEvent.click(
      screen.getByRole('button', {name: i18n.openOrCloseTeachingAssistant()})
    );
    expect(screen.getByText('AI Teaching Assistant')).toBeVisible();
  });

  describe('pulse animation', () => {
    it('renders pulse animation when session storage is empty', () => {
      renderDefault();
      const fab = screen.getByRole('button', {
        name: i18n.openOrCloseTeachingAssistant(),
      });
      expect(fab.classList.contains('unittest-fab-pulse')).toBe(false);

      const fabImage = screen.getByRole('img', {name: 'AI bot'});
      fireEvent.load(fabImage);
      expect(fab.classList.contains('unittest-fab-pulse')).toBe(false);

      const taImage = screen.getByRole('img', {name: 'TA overlay'});
      fireEvent.load(taImage);
      expect(fab.classList.contains('unittest-fab-pulse')).toBe(true);
    });

    it('does not render pulse animation when open state is present in session storage', () => {
      sessionStorage.setItem('AiDiffFabOpenStateKey', 'false');
      renderDefault();
      const image = screen.getByRole('img', {name: 'AI bot'});
      fireEvent.load(image);
      const taImage = screen.getByRole('img', {name: 'TA overlay'});
      fireEvent.load(taImage);
      const fab = screen.getByRole('button', {
        name: i18n.openOrCloseTeachingAssistant(),
      });
      expect(fab.classList.contains('unittest-fab-pulse')).toBe(false);
    });
  });
});
