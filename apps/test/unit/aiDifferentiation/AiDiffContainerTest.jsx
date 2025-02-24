import {render, screen, fireEvent} from '@testing-library/react';
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
  scriptId: 2,
  context: AiDiffContext.LESSON,
  scriptName: 'test_lesson',
  unitDisplayName: 'test unit name',
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

  it('moves rubric container when user clicks and drags component', () => {
    renderDefault();
    const handle_element = screen.getByText('AI Teaching Assistant');
    // We want to check that the ID is set correctly for dragging.
    // eslint-disable-next-line no-restricted-properties
    const element = screen.getByTestId('draggable-test-id');

    const initialPosition = element.style.transform;

    // simulate dragging
    fireEvent.mouseDown(handle_element, {clientX: 0, clientY: 0});
    fireEvent.mouseMove(handle_element, {clientX: 100, clientY: 100});
    fireEvent.mouseUp(handle_element);

    const newPosition = element.style.transform;

    expect(newPosition).not.toEqual(initialPosition);
  });

  it('Shows the welcome experience when user property is false', () => {
    renderDefault({disableWelcome: false}, false);

    screen.getByText('Empowering teachers. Enhancing learning.');
  });
});
