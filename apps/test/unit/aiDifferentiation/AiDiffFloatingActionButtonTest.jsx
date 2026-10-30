import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';

import AiDiffFloatingActionButton from '@cdo/apps/aiDifferentiation/AiDiffFloatingActionButton';
import {setChatIsOpen} from '@cdo/apps/aiTeacherDrawer/redux';
import {aiDiffChatReducer} from '@cdo/apps/aiTeacherDrawer/redux/slice';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';
import currentUser, {
  setInitialData,
} from '@cdo/apps/templates/currentUserRedux';
import teacherSections, {
  setSections,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import experiments from '@cdo/apps/util/experiments';
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

// Stub the lazy-loaded drawer so tests don't trigger asyncLoadSectionData or fetchThreadMessages.
jest.mock('@cdo/apps/aiTeacherDrawer/AiDiffDrawer', () => {
  const React = require('react');
  const {useSelector} = require('react-redux');
  const MockDrawer = () => {
    const chatIsOpen = useSelector(state => state.aiDiffChat.chatIsOpen);
    return (
      <div style={chatIsOpen ? undefined : {display: 'none'}}>
        <span>AI Teaching Assistant</span>
      </div>
    );
  };
  return {__esModule: true, default: MockDrawer};
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

  beforeEach(() => {
    stubRedux();
    window.HTMLElement.prototype.scrollIntoView = () => {};
    sessionStorage.clear();
    localStorage.clear();
    fetchStub = jest
      .spyOn(HttpClient, 'post')
      .mockResolvedValue(
        Promise.resolve(new Response(JSON.stringify(defaultCoursesResponse)))
      );
    jest.spyOn(HttpClient, 'fetchJson').mockResolvedValue({
      value: defaultThreadListResponse,
      response: new Response(),
    });
  });

  afterEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    jest.restoreAllMocks();
    restoreRedux();
  });

  function renderDefault(propOverrides = {}) {
    const store = getStore();

    registerReducers({
      currentUser,
      teacherSections,
      aiDiffChat: aiDiffChatReducer,
    });
    store.dispatch(
      setInitialData({
        id: 1,
        name: 'test_user',
        has_completed_ai_differentiation_welcome: true,
      })
    );
    store.dispatch(setSections([]));
    store.dispatch(setChatIsOpen(false));

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

  describe('notification badge', () => {
    beforeEach(() => experiments.setEnabled('ta-teacher-panel', true));
    afterEach(() => experiments.setEnabled('ta-teacher-panel', false));

    // The count comes from /notifications; anything with a null readAt is
    // unread. Other fetchJson callers in this component want the thread list.
    const givenUnreadNotifications = count => {
      const unread = Array.from({length: count}, (_, i) => ({
        id: i,
        readAt: null,
      }));
      HttpClient.fetchJson.mockImplementation(url =>
        Promise.resolve({
          value: url === '/notifications' ? unread : defaultThreadListResponse,
          response: new Response(),
        })
      );
    };

    it('shows the number of unread notifications', async () => {
      // Without this the drawer auto-opens and the button is not rendered.
      localStorage.setItem('AiDiffHasOpenedKey', 'true');
      givenUnreadNotifications(8);
      renderDefault();

      expect(await screen.findByText('8')).toBeVisible();
    });

    it('shows nothing where there are no notifications', async () => {
      localStorage.setItem('AiDiffHasOpenedKey', 'true');
      givenUnreadNotifications(0);
      renderDefault();

      await waitFor(() =>
        expect(
          screen.getByRole('button', {
            name: i18n.openOrCloseTeachingAssistant(),
          })
        ).toBeVisible()
      );
      // The old badge read 'TA' when idle; now it is absent entirely.
      expect(screen.queryByText('TA')).toBeNull();
      expect(
        document.querySelector('.MuiBadge-badge.MuiBadge-invisible')
      ).not.toBeNull();
    });
  });

  describe('pulse animation', () => {
    it('pulses once the pre-rebrand image has loaded', async () => {
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

      fireEvent.load(
        screen.getByRole('img', {name: 'AI bot - unread notifications'})
      );
      expect(fab.classList.contains('unittest-fab-pulse')).toBe(true);
    });

    it('pulses immediately once rebranded, having no image to wait on', async () => {
      experiments.setEnabled('ta-teacher-panel', true);
      sessionStorage.setItem('AiDiffFabOpenStateKey', 'false');
      renderDefault({});
      await waitFor(() => expect(fetchStub).toHaveBeenCalled());

      const fab = screen.getByRole('button', {
        name: i18n.openOrCloseTeachingAssistant(),
      });
      expect(fab.classList.contains('unittest-fab-pulse')).toBe(true);
      experiments.setEnabled('ta-teacher-panel', false);
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
      const fab = screen.getByRole('button', {
        name: i18n.openOrCloseTeachingAssistant(),
      });
      expect(fab.classList.contains('unittest-fab-pulse')).toBe(false);
    });
  });
});
