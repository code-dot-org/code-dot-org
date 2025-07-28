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
  context: {
    scriptId: 1,
  },
  scriptName: 'test_lesson',
};

const defaultCoursesResponse = {
  courses: ['dummy_course_2025', 'dummy_course'],
};

describe('AIDiffFloatingActionButton', () => {
  let fetchStub;

  let store;

  beforeEach(() => {
    window.HTMLElement.prototype.scrollIntoView = () => {};
    sessionStorage.clear();
    localStorage.clear();
    fetchStub = jest
      .spyOn(HttpClient, 'post')
      .mockResolvedValue(
        Promise.resolve(new Response(JSON.stringify(defaultCoursesResponse)))
      );
  });

  afterEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    jest.restoreAllMocks();

    store = null;
  });

  function renderDefault(propOverrides = {}) {
    store = getStore();

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

    return render(
      <Provider store={store}>
        <AiDiffFloatingActionButton {...DEFAULT_PROPS} {...propOverrides} />
      </Provider>
    );
  }

  it('begins closed if has been opened before', async () => {
    localStorage.setItem('AiDiffHasOpenedKey', 'true');
    renderDefault();
    await waitFor(() => {
      expect(fetchStub).toHaveBeenCalledWith(
        '/aidiff_threads/curriculum_courses',
        JSON.stringify({
          context: DEFAULT_PROPS.context,
        }),
        true,
        {
          'Content-Type': 'application/json',
        }
      );
    });
    expect(screen.getByText('AI Teaching Assistant')).not.toBeVisible();
  });

  it('begins closed if has been closed before', async () => {
    localStorage.setItem('AiDiffHasClosedKey', 'true');
    renderDefault();
    await waitFor(() => {
      expect(fetchStub).toHaveBeenCalledWith(
        '/aidiff_threads/curriculum_courses',
        JSON.stringify({
          context: DEFAULT_PROPS.context,
        }),
        true,
        {
          'Content-Type': 'application/json',
        }
      );
    });
    expect(screen.getByText('AI Teaching Assistant')).not.toBeVisible();
  });

  it('begins open if no session or local storage and has not been opened before', async () => {
    renderDefault({});
    await waitFor(() => {
      expect(fetchStub).toHaveBeenCalledWith(
        '/aidiff_threads/curriculum_courses',
        JSON.stringify({
          context: DEFAULT_PROPS.context,
        }),
        true,
        {
          'Content-Type': 'application/json',
        }
      );
    });
    expect(screen.getByText('AI Teaching Assistant')).toBeVisible();
  });

  it('begins open if open set in session storage', async () => {
    sessionStorage.setItem('AiDiffFabOpenStateKey', 'true');
    renderDefault();
    await waitFor(() => {
      expect(fetchStub).toHaveBeenCalledWith(
        '/aidiff_threads/curriculum_courses',
        JSON.stringify({
          context: DEFAULT_PROPS.context,
        }),
        true,
        {
          'Content-Type': 'application/json',
        }
      );
    });
    expect(screen.getByText('AI Teaching Assistant')).toBeVisible();
  });

  it('opens on click', async () => {
    localStorage.setItem('AiDiffHasOpenedKey', 'true');
    renderDefault();
    await waitFor(() => {
      expect(fetchStub).toHaveBeenCalledWith(
        '/aidiff_threads/curriculum_courses',
        JSON.stringify({
          context: DEFAULT_PROPS.context,
        }),
        true,
        {
          'Content-Type': 'application/json',
        }
      );
    });
    fireEvent.click(
      screen.getByRole('button', {name: i18n.openOrCloseTeachingAssistant()})
    );
    expect(screen.getByText('AI Teaching Assistant')).toBeVisible();
  });

  describe('pulse animation', () => {
    it('renders pulse animation when hasOpenedDiff is false and window is closed', async () => {
      sessionStorage.setItem('AiDiffFabOpenStateKey', 'false');
      renderDefault({});
      await waitFor(() => {
        expect(fetchStub).toHaveBeenCalledWith(
          '/aidiff_threads/curriculum_courses',
          JSON.stringify({
            context: DEFAULT_PROPS.context,
          }),
          true,
          {
            'Content-Type': 'application/json',
          }
        );
      });
      const fab = screen.getByRole('button', {
        name: i18n.openOrCloseTeachingAssistant(),
      });
      expect(fab.classList.contains('unittest-fab-pulse')).toBe(false);

      const fabImage = screen.getByRole('img', {name: 'AI bot'});
      fireEvent.load(fabImage);
      expect(fab.classList.contains('unittest-fab-pulse')).toBe(true);
    });

    it('does not render pulse animation when hasOpenedDiff is true', async () => {
      sessionStorage.setItem('AiDiffFabOpenStateKey', 'false');
      localStorage.setItem('AiDiffHasOpenedKey', 'true');
      renderDefault();
      await waitFor(() => {
        expect(fetchStub).toHaveBeenCalledWith(
          '/aidiff_threads/curriculum_courses',
          JSON.stringify({
            context: DEFAULT_PROPS.context,
          }),
          true,
          {
            'Content-Type': 'application/json',
          }
        );
      });
      const image = screen.getByRole('img', {name: 'AI bot'});
      fireEvent.load(image);
      const fab = screen.getByRole('button', {
        name: i18n.openOrCloseTeachingAssistant(),
      });
      expect(fab.classList.contains('unittest-fab-pulse')).toBe(false);
    });
  });

  describe('canStartOpen prop behavior', () => {
    it('starts closed and opens when canStartOpen is false then becomes true', async () => {
      const {rerender} = renderDefault({canStartOpen: false});

      await waitFor(() => {
        expect(fetchStub).toHaveBeenCalled();
      });

      expect(screen.getByText('AI Teaching Assistant')).not.toBeVisible();

      rerender(
        <Provider store={store}>
          <AiDiffFloatingActionButton {...DEFAULT_PROPS} canStartOpen={true} />
        </Provider>
      );

      await waitFor(() => {
        expect(screen.getByText('AI Teaching Assistant')).toBeVisible();
      });
    });

    it('starts closed and opens and closes manually then does not open when canStartOpen starts false and becomes true', async () => {
      const {rerender} = renderDefault({canStartOpen: false});

      await waitFor(() => {
        expect(fetchStub).toHaveBeenCalled();
      });

      expect(screen.getByText('AI Teaching Assistant')).not.toBeVisible();

      const fabButton = screen.getByRole('button', {
        name: i18n.openOrCloseTeachingAssistant(),
      });
      fireEvent.click(fabButton);

      await waitFor(() => {
        expect(screen.getByText('AI Teaching Assistant')).toBeVisible();
      });

      fireEvent.click(fabButton);

      await waitFor(() => {
        expect(screen.getByText('AI Teaching Assistant')).not.toBeVisible();
      });

      rerender(
        <Provider store={store}>
          <AiDiffFloatingActionButton {...DEFAULT_PROPS} canStartOpen={true} />
        </Provider>
      );

      expect(screen.getByText('AI Teaching Assistant')).not.toBeVisible();
    });
  });
});
