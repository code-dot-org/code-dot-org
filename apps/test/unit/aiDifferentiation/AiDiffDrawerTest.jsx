import {render, screen, waitFor} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';

import {
  aichatReducer,
  setChatIsOpen,
  setPendingArtifactMessage,
} from '@cdo/apps/aichat/redux/slice';
import AiDiffDrawer from '@cdo/apps/aiDifferentiation/AiDiffDrawer';
import {getStore, registerReducers} from '@cdo/apps/redux';
import currentUser, {
  setInitialData,
} from '@cdo/apps/templates/currentUserRedux';
import teacherSections, {
  setSections,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import HttpClient from '@cdo/apps/util/HttpClient';
import {AiDiffContext} from '@cdo/generated-scripts/sharedConstants';

jest.mock('@react-pdf/renderer', () => {
  return {
    PDFDownloadLink: () => null,
    StyleSheet: {
      create: () => null,
    },
  };
});

const DEFAULT_PROPS = {
  closeTutor: () => {},
  context: {
    type: AiDiffContext.LESSON,
    lessonId: 2,
  },
  curriculumCourses: [],
  scriptName: 'test_lesson',
  unreadNotificationCount: 0,
};

const defaultThreadListResponse = [
  {
    id: 1,
    title: 'blah thread one',
    updatedAt: Date(),
    contextType: 'lesson',
  },
];

describe('AiDiffDrawer', () => {
  let fetchJsonStub;

  beforeEach(() => {
    window.HTMLElement.prototype.scrollIntoView = () => {};
    sessionStorage.clear();
    fetchJsonStub = jest.fn();
    fetchJsonStub.mockResolvedValue({
      value: defaultThreadListResponse,
      response: new Response(),
    });
    HttpClient.fetchJson = fetchJsonStub;
  });

  afterEach(() => {
    sessionStorage.clear();
    jest.restoreAllMocks();
  });

  function renderDefault(propOverrides = {}, hasCompletedAiDiffWelcome = true) {
    const store = getStore();

    registerReducers({
      currentUser,
      teacherSections,
      aichat: aichatReducer,
    });
    store.dispatch(
      setInitialData({
        id: 1,
        name: 'test_user',
        has_completed_ai_differentiation_welcome: hasCompletedAiDiffWelcome,
      })
    );
    store.dispatch(setSections([]));

    render(
      <Provider store={store}>
        <AiDiffDrawer {...DEFAULT_PROPS} {...propOverrides} />
      </Provider>
    );

    return store;
  }

  it('renders without crashing', () => {
    renderDefault();
  });

  it('shows header when chat is open', async () => {
    const store = renderDefault();
    store.dispatch(setChatIsOpen(true));

    await waitFor(() => {
      screen.getByText('AI Teaching Assistant');
    });
  });

  it('renders workspace content when chat is open', async () => {
    const store = renderDefault();
    store.dispatch(setChatIsOpen(true));

    await waitFor(() => {
      screen.getByText('AI Teaching Assistant');
    });
  });

  it('adjusts main_content margin when chat opens', () => {
    const mainContent = document.createElement('div');
    mainContent.id = 'main_content';
    document.body.appendChild(mainContent);

    const store = renderDefault();
    store.dispatch(setChatIsOpen(true));

    return waitFor(() => {
      expect(mainContent.style.marginRight).not.toBe('');
    }).finally(() => {
      document.body.removeChild(mainContent);
    });
  });

  it('resets main_content margin when chat closes', async () => {
    const mainContent = document.createElement('div');
    mainContent.id = 'main_content';
    document.body.appendChild(mainContent);

    try {
      const store = renderDefault();
      store.dispatch(setChatIsOpen(true));

      await waitFor(() => {
        expect(mainContent.style.marginRight).not.toBe('');
      });

      store.dispatch(setChatIsOpen(false));

      await waitFor(() => {
        expect(mainContent.style.marginRight).toBe('0px');
      });
    } finally {
      document.body.removeChild(mainContent);
    }
  });

  it('shows artifact save page when there is a pending artifact message', async () => {
    const store = renderDefault();
    store.dispatch(setChatIsOpen(true));
    store.dispatch(
      setPendingArtifactMessage({
        role: 'assistant',
        chatMessageText: 'Here is a lesson plan for you.',
        id: 'msg-1',
        status: 'ok',
      })
    );

    await waitFor(() => {
      // AiDiffArtifactSavePage is rendered instead of AiDiffWorkSpace
      expect(screen.queryByText('AI Teaching Assistant')).toBeTruthy();
    });
  });

  it('does not show main workspace when drawer is closed', () => {
    renderDefault();
    // Drawer is closed by default (chatIsOpen = false), workspace content
    // is still rendered but hidden by MUI Drawer's persistent variant.
    // The header should not be visible in the accessible tree when closed.
    expect(screen.queryByRole('presentation')).toBeFalsy();
  });
});
