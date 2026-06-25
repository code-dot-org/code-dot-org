import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';

import AiDiffFloatingActionButton from '@cdo/apps/aiDifferentiation/AiDiffFloatingActionButton';
import {setChatIsOpen} from '@cdo/apps/aiDifferentiation/redux';
import {aiDiffChatReducer} from '@cdo/apps/aiDifferentiation/redux/slice';
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

// Lightweight stubs for the lazy-loaded containers so tests don't trigger
// AiDiffWorkspace's asyncLoadSectionData (jQuery XHR) or fetchThreadMessages.
jest.mock('@cdo/apps/aiDifferentiation/AiDiffContainer', () => {
  const React = require('react');
  const {useSelector} = require('react-redux');
  const MockContainer = () => {
    const chatIsOpen = useSelector(state => state.aiDiffChat.chatIsOpen);
    return (
      <div style={chatIsOpen ? undefined : {display: 'none'}}>
        <span>AI Teaching Assistant</span>
      </div>
    );
  };
  return {__esModule: true, default: MockContainer};
});

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

      const fabImage = screen.getByRole('img', {
        name: 'AI bot - unread notifications',
      });
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
      const image = screen.getByRole('img', {
        name: 'AI bot - unread notifications',
      });
      fireEvent.load(image);
      const fab = screen.getByRole('button', {
        name: i18n.openOrCloseTeachingAssistant(),
      });
      expect(fab.classList.contains('unittest-fab-pulse')).toBe(false);
    });
  });
});
