import {render, screen, waitFor} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';

import {aichatReducer} from '@cdo/apps/aichat/redux/slice';
import AiDiffContainer from '@cdo/apps/aiDifferentiation/AiDiffContainer';
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
};

const defaultThreadListResponse = [
  {
    id: 1,
    title: 'blah thread one',
    updatedAt: Date(),
    contextType: 'lesson',
  },
];

describe('AiDiffContainer', () => {
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
        <AiDiffContainer {...DEFAULT_PROPS} {...propOverrides} />
      </Provider>
    );
  }

  it('visible when open', async () => {
    renderDefault();
    await waitFor(() => {
      screen.getByText('AI Teaching Assistant');
      screen.getByText('Experiment');
    });
  });

  // Was asked to disable the AITA welcome experience without removing any code.
  // Commenting out this test until further notice.
  // it('Shows the welcome experience when user property is false', () => {
  //   renderDefault({disableWelcome: false}, false);

  //   screen.getByText('Empowering teachers. Enhancing learning.');
  // });
});
