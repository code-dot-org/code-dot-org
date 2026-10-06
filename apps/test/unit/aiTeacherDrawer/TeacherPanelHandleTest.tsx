import {render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';

import {setChatIsOpen} from '@cdo/apps/aiTeacherDrawer/redux';
import {aiDiffChatReducer} from '@cdo/apps/aiTeacherDrawer/redux/slice';
import {TEACHER_PANEL_CALLOUT_SEEN_LOCAL_KEY} from '@cdo/apps/aiTeacherDrawer/teacherPanelCallout';
import TeacherPanelHandle from '@cdo/apps/aiTeacherDrawer/TeacherPanelHandle';
import {getStore, registerReducers} from '@cdo/apps/redux';
import {createTourWithSteps} from '@cdo/apps/sharedComponents/productTour/productTourHelpers';
import currentUser, {
  setInitialData,
} from '@cdo/apps/templates/currentUserRedux';
import HttpClient from '@cdo/apps/util/HttpClient';

// Shepherd needs real layout to render, so the tour itself is stubbed and the
// assertions are about whether one gets created and started.
jest.mock('@cdo/apps/sharedComponents/productTour/productTourHelpers', () => ({
  ...jest.requireActual(
    '@cdo/apps/sharedComponents/productTour/productTourHelpers'
  ),
  createTourWithSteps: jest.fn(),
}));

const mockCreateTour = createTourWithSteps as jest.MockedFunction<
  typeof createTourWithSteps
>;

const renderHandle = () => {
  const store = getStore();
  registerReducers({aiDiffChat: aiDiffChatReducer, currentUser});

  render(
    <Provider store={store}>
      <TeacherPanelHandle />
    </Provider>
  );

  return store;
};

// The handle is a plain div, so it is addressed by its icon's title.
const handleRoot = () =>
  screen.getByTitle('Open teacher panel').closest('.teacher-panel');

// The one-time flag arrives with /api/v1/users/current, so until that lands it
// is undefined rather than false.
const givenCalloutSeen = (seen: boolean | undefined) => {
  registerReducers({aiDiffChat: aiDiffChatReducer, currentUser});
  getStore().dispatch(
    setInitialData({
      id: 1,
      user_type: 'teacher',
      teacher_panel_v2_seen: seen,
    })
  );
};

let startedTours: number;

const calloutStarted = () => startedTours > 0;

describe('TeacherPanelHandle', () => {
  beforeEach(() => {
    // getStore is a singleton, so drawer state set by one test would otherwise
    // decide what the next one sees.
    registerReducers({aiDiffChat: aiDiffChatReducer});
    getStore().dispatch(setChatIsOpen(false));

    startedTours = 0;
    mockCreateTour.mockImplementation(() => {
      // useProductTour hangs its callbacks off tour events, so the stub has to
      // dispatch them rather than just record the registrations.
      const handlers: Record<string, () => void> = {};
      return {
        on: jest.fn((event: string, handler: () => void) => {
          handlers[event] = handler;
        }),
        start: jest.fn(() => {
          startedTours += 1;
          handlers.start?.();
          handlers.show?.();
        }),
        currentStep: null,
        steps: [],
      } as unknown as ReturnType<typeof createTourWithSteps>;
    });
  });

  afterEach(() => {
    localStorage.removeItem(TEACHER_PANEL_CALLOUT_SEEN_LOCAL_KEY);
    jest.clearAllMocks();
  });

  it('is offered while the drawer is closed', () => {
    const store = renderHandle();
    store.dispatch(setChatIsOpen(false));

    expect(handleRoot()).not.toHaveAttribute('aria-hidden', 'true');
  });

  it('leaves the accessibility tree once the drawer covers it', () => {
    const store = renderHandle();
    store.dispatch(setChatIsOpen(true));

    expect(handleRoot()).toHaveAttribute('aria-hidden', 'true');
  });

  describe('teacher panel callout', () => {
    it('runs the first time a teacher who has not seen it loads the handle', () => {
      givenCalloutSeen(false);

      renderHandle();

      expect(calloutStarted()).toBe(true);
    });

    it('records itself against the user as soon as it starts', () => {
      const post = jest
        .spyOn(HttpClient, 'post')
        .mockResolvedValue({} as Response);
      givenCalloutSeen(false);

      renderHandle();

      expect(post).toHaveBeenCalledWith(
        '/api/v1/users/teacher_panel_v2_seen',
        undefined,
        true
      );
      post.mockRestore();
    });

    it('does not run for a teacher who has already seen it', () => {
      givenCalloutSeen(true);

      renderHandle();

      expect(calloutStarted()).toBe(false);
    });

    it('waits rather than spending itself before the flag has loaded', () => {
      givenCalloutSeen(undefined);

      renderHandle();

      expect(calloutStarted()).toBe(false);
    });

    it('stays off while the drawer is already open over the handle', () => {
      givenCalloutSeen(false);
      getStore().dispatch(setChatIsOpen(true));

      renderHandle();

      expect(calloutStarted()).toBe(false);
    });
  });
});
