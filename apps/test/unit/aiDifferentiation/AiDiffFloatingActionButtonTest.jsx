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

const defaultThreadListResponse = [
  {
    id: 1,
    title: 'blah thread one',
    updatedAt: Date(),
    contextType: 'lesson',
  },
];

describe('AIDiffFloatingActionButton', () => {
  let fetchStub;
  let fetchJsonStub;

  beforeEach(() => {
    window.HTMLElement.prototype.scrollIntoView = () => {};
    sessionStorage.clear();
    localStorage.clear();
    fetchStub = jest
      .spyOn(HttpClient, 'post')
      .mockResolvedValue(
        Promise.resolve(new Response(JSON.stringify(defaultCoursesResponse)))
      );
    fetchJsonStub = jest.fn();
    fetchJsonStub.mockResolvedValue({
      value: defaultThreadListResponse,
      response: new Response(),
    });
    HttpClient.fetchJson = fetchJsonStub;
  });

  afterEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    jest.restoreAllMocks();
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
});
