import {act, fireEvent, render, screen, within} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';

import teacherPanel, {
  setLevelsWithProgress,
  setLoadedLevelsWithProgressForTest,
} from '@cdo/apps/code-studio/teacherPanelRedux';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';
import {UnconnectedRubricFloatingActionButton as RubricFloatingActionButton} from '@cdo/apps/templates/rubrics/RubricFloatingActionButton';
import teacherRubric, {
  setLoadedStudentStatusForTest,
} from '@cdo/apps/templates/rubrics/teacherRubricRedux';
import teacherSections, {
  selectSection,
  setSections,
  setStudentsForCurrentSection,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import i18n from '@cdo/locale';

import {
  defaultRubric,
  levelNotTried,
  noEvals,
  notAttemptedJsonAll,
  stubFetch,
  studentAlice,
  successJsonAll,
} from './rubricTestHelper';

async function wait() {
  for (let _ = 0; _ < 10; _++) {
    await act(async () => {
      await Promise.resolve();
    });
  }
}

jest.mock('@cdo/apps/util/HttpClient', () => ({
  post: jest.fn().mockResolvedValue({
    json: jest.fn().mockReturnValue({}),
  }),
}));

fetch.mockIf(/\/rubrics\/.*/, JSON.stringify(''));

const sectionId = 999;
const defaultProps = {
  rubric: defaultRubric,
  currentLevelName: 'test_level',
  studentLevelInfo: null,
  notificationsEnabled: true,
};

describe('RubricFloatingActionButton', () => {
  let sendEventSpy;
  let store;

  beforeEach(() => {
    stubRedux();
    registerReducers({
      teacherRubric,
      teacherSections,
      teacherPanel,
    });
    store = getStore();
    sendEventSpy = jest.spyOn(analyticsReporter, 'sendEvent');
    stubFetch({});
    sessionStorage.clear();
  });

  afterEach(() => {
    restoreRedux();
    jest.restoreAllMocks();
    sessionStorage.clear();
  });

  describe('pulse animation', () => {
    it('renders pulse animation when session storage is empty', () => {
      store.dispatch(setLoadedStudentStatusForTest());
      render(
        <Provider store={store}>
          <RubricFloatingActionButton {...defaultProps} />
        </Provider>
      );
      expect(sendEventSpy).toHaveBeenCalledWith(
        EVENTS.TA_RUBRIC_CLOSED_ON_PAGE_LOAD,
        {
          viewingStudentWork: false,
          viewingEvaluationLevel: true,
        }
      );
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

    it('does not render pulse animation before student status loads', () => {
      render(
        <Provider store={store}>
          <RubricFloatingActionButton {...defaultProps} />
        </Provider>
      );

      const fabImage = screen.getByRole('img', {name: 'AI bot'});
      fireEvent.load(fabImage);

      const taImage = screen.getByRole('img', {name: 'TA overlay'});
      fireEvent.load(taImage);

      const fab = screen.getByRole('button', {
        name: i18n.openOrCloseTeachingAssistant(),
      });
      expect(fab.classList.contains('unittest-fab-pulse')).toBe(false);
    });

    it('does not render pulse animation when open state is present in session storage', () => {
      store.dispatch(setLoadedStudentStatusForTest());
      sessionStorage.setItem('RubricFabOpenStateKey', 'false');
      render(
        <Provider store={store}>
          <RubricFloatingActionButton {...defaultProps} />
        </Provider>
      );
      expect(sendEventSpy).toHaveBeenCalledWith(
        EVENTS.TA_RUBRIC_CLOSED_ON_PAGE_LOAD,
        {
          viewingStudentWork: false,
          viewingEvaluationLevel: true,
        }
      );
      const image = screen.getByRole('img', {name: 'AI bot'});
      fireEvent.load(image);
      const fab = screen.getByRole('button', {
        name: i18n.openOrCloseTeachingAssistant(),
      });
      expect(fab.classList.contains('unittest-fab-pulse')).toBe(false);
    });
  });

  describe('TA icon bubble', () => {
    beforeEach(() => {
      const levelsWithProgress = [{...levelNotTried, userId: studentAlice.id}];
      store.dispatch(setLevelsWithProgress(levelsWithProgress));
      store.dispatch(setLoadedLevelsWithProgressForTest());
      store.dispatch(setStudentsForCurrentSection(sectionId, [studentAlice]));
    });

    it('renders TA overlay when there are no students to review', async () => {
      stubFetch({
        evalStatusForAll: notAttemptedJsonAll,
        teacherEvals: noEvals,
      });

      render(
        <Provider store={store}>
          <RubricFloatingActionButton {...defaultProps} sectionId={sectionId} />
        </Provider>
      );

      await wait();

      expect(screen.getByRole('img', {name: 'TA overlay'})).toBeVisible();
      expect(
        screen.queryByLabelText(i18n.aiEvaluationsToReview())
      ).not.toBeInTheDocument();
    });

    it('renders count bubble when there are students to review', async () => {
      stubFetch({
        evalStatusForAll: successJsonAll,
        teacherEvals: noEvals,
      });

      render(
        <Provider store={store}>
          <RubricFloatingActionButton {...defaultProps} sectionId={sectionId} />
        </Provider>
      );

      await wait();

      expect(
        screen.queryByRole('img', {name: 'TA overlay'})
      ).not.toBeInTheDocument();
      const countBubble = screen.getByLabelText(i18n.aiEvaluationsToReview());
      expect(countBubble).toBeVisible();
      expect(countBubble.textContent).toBe('1');
    });

    it('does not render count bubble when notifications are disabled', async () => {
      stubFetch({
        evalStatusForAll: successJsonAll,
        teacherEvals: noEvals,
      });

      render(
        <Provider store={store}>
          <RubricFloatingActionButton
            {...defaultProps}
            sectionId={sectionId}
            notificationsEnabled={false}
          />
        </Provider>
      );

      await wait();

      expect(screen.getByRole('img', {name: 'TA overlay'})).toBeVisible();
      expect(
        screen.queryByLabelText(i18n.aiEvaluationsToReview())
      ).not.toBeInTheDocument();
    });

    it('does not render count bubble on non-assessment level', async () => {
      stubFetch({
        evalStatusForAll: successJsonAll,
        teacherEvals: noEvals,
      });

      render(
        <Provider store={store}>
          <RubricFloatingActionButton
            {...defaultProps}
            sectionId={sectionId}
            currentLevelName="non-assessment-level"
          />
        </Provider>
      );

      await wait();

      expect(screen.getByRole('img', {name: 'TA overlay'})).toBeVisible();
      expect(
        screen.queryByLabelText(i18n.aiEvaluationsToReview())
      ).not.toBeInTheDocument();
    });
  });

  describe('student scores alert', () => {
    const alertMessage = i18n.rubricStudentScoresAlert({
      studentCount: 1,
      sectionName: 'test-section',
    });

    beforeEach(() => {
      const levelsWithProgress = [{...levelNotTried, userId: studentAlice.id}];
      store.dispatch(setLevelsWithProgress(levelsWithProgress));
      store.dispatch(setLoadedLevelsWithProgressForTest());
      store.dispatch(setStudentsForCurrentSection(sectionId, [studentAlice]));

      store.dispatch(setSections([{id: sectionId, name: 'test-section'}]));
      store.dispatch(selectSection(sectionId));
    });

    it('renders student scores alert when there are students to review', async () => {
      stubFetch({
        evalStatusForAll: successJsonAll,
        teacherEvals: noEvals,
      });

      render(
        <Provider store={store}>
          <RubricFloatingActionButton
            {...defaultProps}
            sectionId={sectionId}
            canShowTaScoresAlert={true}
          />
        </Provider>
      );

      await wait();

      screen.getByText(
        i18n.rubricStudentScoresAlert({
          studentCount: 1,
          sectionName: 'test-section',
        })
      );
    });

    it('does not render student scores alert without canShowTaScoresAlert', async () => {
      stubFetch({
        evalStatusForAll: successJsonAll,
        teacherEvals: noEvals,
      });

      render(
        <Provider store={store}>
          <RubricFloatingActionButton {...defaultProps} sectionId={sectionId} />
        </Provider>
      );

      await wait();

      expect(screen.queryByText(alertMessage)).not.toBeInTheDocument();
    });

    it('dismisses alert on close button', async () => {
      stubFetch({
        evalStatusForAll: successJsonAll,
        teacherEvals: noEvals,
      });

      render(
        <Provider store={store}>
          <RubricFloatingActionButton
            {...defaultProps}
            sectionId={sectionId}
            canShowTaScoresAlert={true}
          />
        </Provider>
      );

      await wait();

      const alertWindow = screen.getByText(alertMessage).closest('div');
      const closeButton = within(alertWindow).getByRole('button', {
        name: i18n.closeDialog(),
      });
      fireEvent.click(closeButton);

      expect(screen.queryByText(alertMessage)).not.toBeInTheDocument();
      expect(screen.getByText(i18n.rubricAiHeaderText())).not.toBeVisible();
      expect(fetch).toHaveBeenCalledWith('/api/v1/users/set_seen_ta_scores', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({lesson_id: 33}),
      });
    });

    it('dismisses alert on View Scores button', async () => {
      stubFetch({
        evalStatusForAll: successJsonAll,
        teacherEvals: noEvals,
      });

      render(
        <Provider store={store}>
          <RubricFloatingActionButton
            {...defaultProps}
            sectionId={sectionId}
            canShowTaScoresAlert={true}
          />
        </Provider>
      );

      await wait();

      const alertWindow = screen.getByText(alertMessage).closest('div');
      const viewButton = within(alertWindow).getByRole('button', {
        name: i18n.rubricViewScores(),
      });
      fireEvent.click(viewButton);

      expect(screen.queryByText(alertMessage)).not.toBeInTheDocument();
      expect(screen.getByText(i18n.rubricAiHeaderText())).toBeVisible();
      expect(fetch).toHaveBeenCalledWith('/api/v1/users/set_seen_ta_scores', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({lesson_id: 33}),
      });
    });

    it('dismisses alert on fab click', async () => {
      stubFetch({
        evalStatusForAll: successJsonAll,
        teacherEvals: noEvals,
      });

      render(
        <Provider store={store}>
          <RubricFloatingActionButton
            {...defaultProps}
            sectionId={sectionId}
            canShowTaScoresAlert={true}
          />
        </Provider>
      );

      await wait();

      screen.getByText(alertMessage);
      const fab = screen.getByRole('button', {
        name: i18n.openOrCloseTeachingAssistant(),
      });
      fireEvent.click(fab);

      expect(screen.queryByText(alertMessage)).not.toBeInTheDocument();
      expect(screen.getByText(i18n.rubricAiHeaderText())).toBeVisible();
      expect(fetch).toHaveBeenCalledWith('/api/v1/users/set_seen_ta_scores', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({lesson_id: 33}),
      });
    });

    it('does not dismiss alert on fab click on non assessment level', async () => {
      stubFetch({
        evalStatusForAll: successJsonAll,
        teacherEvals: noEvals,
      });

      render(
        <Provider store={store}>
          <RubricFloatingActionButton
            {...defaultProps}
            sectionId={sectionId}
            currentLevelName="non-assessment-level"
          />
        </Provider>
      );

      await wait();

      expect(screen.queryByText(alertMessage)).not.toBeInTheDocument();

      const fab = screen.getByRole('button', {
        name: i18n.openOrCloseTeachingAssistant(),
      });
      fireEvent.click(fab);

      expect(fetch).not.toHaveBeenCalledWith(
        '/api/v1/users/set_seen_ta_scores',
        expect.anything()
      );
    });

    it('dismisses alert when fab is open initially', async () => {
      // set local storage to simulate open state
      sessionStorage.setItem('RubricFabOpenStateKey', 'true');

      stubFetch({
        evalStatusForAll: successJsonAll,
        teacherEvals: noEvals,
      });

      render(
        <Provider store={store}>
          <RubricFloatingActionButton
            {...defaultProps}
            sectionId={sectionId}
            canShowTaScoresAlert={true}
          />
        </Provider>
      );

      await wait();

      expect(screen.queryByText(alertMessage)).not.toBeInTheDocument();
      expect(screen.getByText(i18n.rubricAiHeaderText())).toBeVisible();
      expect(fetch).toHaveBeenCalledWith('/api/v1/users/set_seen_ta_scores', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({lesson_id: 33}),
      });
    });
  });

  it('begins closed when student level info is null', () => {
    render(
      <Provider store={store}>
        <RubricFloatingActionButton {...defaultProps} />
      </Provider>
    );
    expect(screen.queryByText(i18n.rubricAiHeaderText())).not.toBeVisible();
  });

  it('opens RubricContainer when clicked', () => {
    render(
      <Provider store={store}>
        <RubricFloatingActionButton {...defaultProps} />
      </Provider>
    );
    const button = screen.getByRole('button', {
      name: i18n.openOrCloseTeachingAssistant(),
    });
    fireEvent.click(button);
    expect(screen.getByText(i18n.rubricAiHeaderText())).toBeVisible();
  });

  it('sends events when opened and closed', () => {
    const reportingData = {unitName: 'test-2023', levelName: 'test-level'};
    render(
      <Provider store={store}>
        <RubricFloatingActionButton
          {...defaultProps}
          reportingData={reportingData}
        />
      </Provider>
    );
    expect(screen.queryByText(i18n.rubricAiHeaderText())).not.toBeVisible();
    const button = screen.getByRole('button', {
      name: i18n.openOrCloseTeachingAssistant(),
    });
    fireEvent.click(button);
    expect(screen.getByText(i18n.rubricAiHeaderText())).toBeVisible();

    expect(sendEventSpy).toHaveBeenCalledWith(
      EVENTS.TA_RUBRIC_OPENED_FROM_FAB_EVENT,
      {
        ...reportingData,
        viewingStudentWork: false,
        viewingEvaluationLevel: true,
      }
    );

    fireEvent.click(button);
    expect(screen.queryByText(i18n.rubricAiHeaderText())).not.toBeVisible();

    expect(sendEventSpy).toHaveBeenCalledWith(
      EVENTS.TA_RUBRIC_CLOSED_FROM_FAB_EVENT,
      {
        ...reportingData,
        viewingStudentWork: false,
        viewingEvaluationLevel: true,
      }
    );
  });

  it('sends open on page load event when open state is true in session storage', () => {
    sessionStorage.setItem('RubricFabOpenStateKey', 'true');
    render(
      <Provider store={store}>
        <RubricFloatingActionButton {...defaultProps} />
      </Provider>
    );
    expect(sendEventSpy).toHaveBeenCalledWith(
      EVENTS.TA_RUBRIC_OPEN_ON_PAGE_LOAD,
      {
        viewingStudentWork: false,
        viewingEvaluationLevel: true,
      }
    );
    const image = screen.getByRole('img', {name: 'AI bot'});
    fireEvent.load(image);
    const fab = screen.getByRole('button', {
      name: i18n.openOrCloseTeachingAssistant(),
    });
    expect(fab.classList.contains('unittest-fab-pulse')).toBe(false);
  });
});
