import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {Provider} from 'react-redux';

import AiDiffContainer from '@cdo/apps/aiDifferentiation/AiDiffContainer';
import {getStore, registerReducers} from '@cdo/apps/redux';
import currentUser, {
  setInitialData,
} from '@cdo/apps/templates/currentUserRedux';
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
  open: true,
  context: {
    type: AiDiffContext.LESSON,
    lessonId: 2,
  },
  scriptName: 'test_lesson',
  curriculumCourses: [],
};

describe('AiDiffContainer', () => {
  beforeEach(() => {
    window.HTMLElement.prototype.scrollIntoView = () => {};
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
    jest.restoreAllMocks();
  });

  function renderDefault(propOverrides = {}, hasCompletedAiDiffWelcome = true) {
    const store = getStore();

    registerReducers({
      currentUser,
    });
    store.dispatch(
      setInitialData({
        id: 1,
        name: 'test_user',
        has_completed_ai_differentiation_welcome: hasCompletedAiDiffWelcome,
      })
    );

    render(
      <Provider store={store}>
        <AiDiffContainer {...DEFAULT_PROPS} {...propOverrides} />
      </Provider>
    );
  }

  it('visible when open', () => {
    renderDefault();
    expect(screen.getByText('AI Teaching Assistant')).toBeVisible();
    screen.getByText('Experiment');
  });

  it('moves TA container when user clicks and drags component', async () => {
    renderDefault();
    const handle_element = screen.getByText('AI Teaching Assistant');
    // We want to check that the ID is set correctly for dragging.
    // eslint-disable-next-line no-restricted-properties
    const element = screen.getByTestId('draggable-test-id');
    expect(element.style.transform).toEqual('translate(0px,0px)');

    userEvent.pointer([
      {keys: '[MouseLeft>]', target: handle_element},
      {keys: '[MouseLeft>]', target: handle_element, coords: {x: 50, y: 50}},
      '[/MouseLeft]',
    ]);

    await waitFor(() => {
      const newPosition = element.style.transform;
      expect(newPosition).toEqual('translate(50px,50px)');
    });
  });

  it('snaps TA container back on screen when dragged off', async () => {
    renderDefault();
    const handle = screen.getByText('AI Teaching Assistant');
    // We want to check that the ID is set correctly for dragging.
    // eslint-disable-next-line no-restricted-properties
    const element = screen.getByTestId('draggable-test-id');
    expect(element.style.transform).toEqual('translate(0px,0px)');

    userEvent.pointer([
      {keys: '[MouseLeft>]', target: handle},
      {keys: '[MouseLeft>]', target: handle, coords: {x: 5000, y: -5000}},
      '[/MouseLeft]',
    ]);

    await waitFor(() => {
      const newPosition = element.style.transform;
      const expectedX = window.innerWidth - 100;
      const expectedY = 760 - window.innerHeight;
      expect(newPosition).toEqual(`translate(${expectedX}px,${expectedY}px)`);
    });
  });

  it('Shows the welcome experience when user property is false', () => {
    renderDefault({disableWelcome: false}, false);

    screen.getByText('Empowering teachers. Enhancing learning.');
  });
});
