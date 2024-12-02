import {render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {getStore, stubRedux, restoreRedux} from '@cdo/apps/redux';
import {UnconnectedTeacherHomepage as TeacherHomepage} from '@cdo/apps/templates/studioHomepages/TeacherHomepage';

import {courses, topCourse, plCourses, topPlCourse} from './homepagesTestData';

const DEFAULT_PROPS = {
  announcements: [],
  censusQuestion: 'how_many_10_hours',
  courses,
  topCourse,
  plCourses,
  topPlCourse,
  joinedStudentSections: [],
  joinedPlSections: [],
  ncesSchoolId: 'school-id',
  schoolYear: 2021,
  showCensusBanner: false,
  teacherId: 1,
  teacherEmail: 'teacher@code.org',
  teacherName: 'Teacher',
  hasFeedback: false,
  currentUserId: 42,
};

// Instead of trying to hook up an absolute ton of redux providers and fake servers, we'll just
// mock out the individual components that make up this dashboard.

// Mocks the component given by its import path and gives it a data-testid of 'test-ComponentName'.
jest.mock('@cdo/apps/templates/DonorTeacherBanner', () => props => (
  <div
    // eslint-disable-next-line react/forbid-dom-props
    data-testid={'test-DonorTeacherBanner'}
    data-props={JSON.stringify(props)}
  />
));
jest.mock('@cdo/apps/templates/census/CensusTeacherBanner', () => props => (
  <div
    // eslint-disable-next-line react/forbid-dom-props
    data-testid={'test-CensusTeacherBanner'}
    data-props={JSON.stringify(props)}
  />
));
jest.mock(
  '@cdo/apps/templates/feedback/ParticipantFeedbackNotification',
  () => props =>
    (
      <div
        // eslint-disable-next-line react/forbid-dom-props
        data-testid={'test-ParticipantFeedbackNotification'}
        data-props={JSON.stringify(props)}
      />
    )
);
jest.mock(
  '@cdo/apps/templates/studioHomepages/JoinSectionArea',
  () => props =>
    (
      <div
        // eslint-disable-next-line react/forbid-dom-props
        data-testid={'test-JoinSectionArea'}
        data-props={JSON.stringify(props)}
      />
    )
);
jest.mock(
  '@cdo/apps/templates/studioHomepages/IncubatorBanner',
  () => props =>
    (
      <div
        // eslint-disable-next-line react/forbid-dom-props
        data-testid={'test-IncubatorBanner'}
        data-props={JSON.stringify(props)}
      />
    )
);
jest.mock(
  '@cdo/apps/templates/studioHomepages/TeacherSections',
  () => props =>
    (
      <div
        // eslint-disable-next-line react/forbid-dom-props
        data-testid={'test-TeacherSections'}
        data-props={JSON.stringify(props)}
      />
    )
);
jest.mock(
  '@cdo/apps/templates/studioHomepages/TeacherResources',
  () => props =>
    (
      <div
        // eslint-disable-next-line react/forbid-dom-props
        data-testid={'test-TeacherResources'}
        data-props={JSON.stringify(props)}
      />
    )
);
jest.mock('@cdo/apps/templates/studioHomepages/RecentCourses', () => props => (
  // eslint-disable-next-line react/forbid-dom-props
  <div data-testid={'test-RecentCourses'} data-props={JSON.stringify(props)} />
));
jest.mock('@cdo/apps/templates/studioHomepages/NpsSurveyBlock', () => props => (
  // eslint-disable-next-line react/forbid-dom-props
  <div data-testid={'test-NpsSurveyBlock'} data-props={JSON.stringify(props)} />
));
jest.mock(
  '@cdo/apps/templates/studioHomepages/MarketingAnnouncementBanner',
  () => props =>
    (
      <div
        // eslint-disable-next-line react/forbid-dom-props
        data-testid={'test-MarketingAnnouncementBanner'}
        data-props={JSON.stringify(props)}
      />
    )
);
jest.mock('@cdo/apps/templates/projects/ProjectWidgetWithData', () => props => (
  <div
    // eslint-disable-next-line react/forbid-dom-props
    data-testid={'test-ProjectWidgetWithData'}
    data-props={JSON.stringify(props)}
  />
));

// Special mock for wrapping ProtectedStatefulDiv, which needs special care due to refs
jest.mock('@cdo/apps/templates/ProtectedStatefulDiv', () => {
  const {forwardRef} = jest.requireActual('react');
  const ProtectedStatefulDiv = jest.requireActual(
    '@cdo/apps/templates/ProtectedStatefulDiv'
  );
  return forwardRef(({...props}, ref) => (
    // eslint-disable-next-line react/forbid-dom-props
    <div data-testid="test-ProtectedStatefulDiv">
      <ProtectedStatefulDiv {...props} canUnmount={true} ref={ref} />
    </div>
  ));
});

function realizeWithStore(store, props = {}) {
  return render(
    <Provider store={store}>
      <TeacherHomepage {...DEFAULT_PROPS} {...props} />
    </Provider>
  );
}

describe('TeacherHomepage', () => {
  const oldWindowLocation = window.location;
  let store;
  const realize = props => realizeWithStore(store, props);

  beforeEach(() => {
    delete window.location;
    window.location = new URL('https://studio.code.org/home');
    stubRedux();
    store = getStore();
  });

  afterEach(() => {
    restoreRedux();
    window.location = oldWindowLocation;
  });

  it('shows a Header Banner that says My Dashboard', () => {
    realize();
    expect(screen.getByText('My Dashboard')).toBeInTheDocument;
  });

  it('renders 2 ProtectedStatefulDivs', () => {
    realize();
    // eslint-disable-next-line no-restricted-properties
    const items = screen.queryAllByTestId('test-ProtectedStatefulDiv');
    expect(items).toHaveLength(2);
  });

  it('logs an Amplitude event only on first render', () => {
    const analyticsSpy = jest.spyOn(analyticsReporter, 'sendEvent');
    sessionStorage.setItem('logged_teacher_session', 'false');

    realize();

    expect(sessionStorage.getItem('logged_teacher_session')).toBe('true');
    const calls = analyticsSpy.mock.calls.filter(
      call => call[0] === EVENTS.TEACHER_LOGIN_EVENT
    );
    expect(calls).toHaveLength(1);
    expect(calls[0]).toEqual([
      EVENTS.TEACHER_LOGIN_EVENT,
      {'user id': 42},
      'Both',
    ]);

    // After setting the session value to true, we should not see sessionStorage.setItem or analyticsSpy called again.
    sessionStorage.setItem('logged_teacher_session', 'true');

    realize();

    const nextCalls = analyticsSpy.mock.calls.filter(
      call => call[0] === EVENTS.TEACHER_LOGIN_EVENT
    );
    expect(nextCalls).toHaveLength(1);

    analyticsSpy.mockClear();
  });

  it('renders a NpsSurveyBlock if showNpsSurvey is true', () => {
    realize({showNpsSurvey: true});
    // eslint-disable-next-line no-restricted-properties
    expect(screen.queryByTestId('test-NpsSurveyBlock')).toBeInTheDocument;
  });

  it('renders a Finish Application call to action if showFinishTeacherApplication is true', () => {
    realize({showFinishTeacherApplication: true});
    expect(screen.getByText('Finish Application')).toBeInTheDocument;
  });

  it('renders a Return to Application call to action if showReturnToReopenedTeacherApplication is true', () => {
    realize({showReturnToReopenedTeacherApplication: true});
    expect(screen.getByText('Return to Application')).toBeInTheDocument;
  });

  it('renders a MarketingAnnouncementBanner if specialAnnouncement exists', () => {
    const specialAnnouncement = {
      title: 'An announcement',
      image: '/image',
      body: 'body',
      buttonUrl: '/button',
      buttonText: 'press me',
    };
    realize({specialAnnouncement});

    // eslint-disable-next-line no-restricted-properties
    const banner = screen.queryByTestId('test-MarketingAnnouncementBanner');
    expect(banner).toBeInTheDocument;

    // Let's check that we passed the announcement through
    expect(JSON.parse(banner.getAttribute('data-props')).announcement).toEqual(
      specialAnnouncement
    );
  });

  // Notifications are configured not to be rendered right now with showAnnouncement = false
  it('does not render a Notification', () => {
    const announcement = {
      heading: 'heading',
      buttonText: 'press me',
      description: 'a notification description',
      link: '/link',
      image: '/image',
      id: 'id',
    };
    realize({announcement});
    expect(screen.queryByText('a notification description')).not
      .toBeInTheDocument;
  });

  // Update according to whether or not we are showing CensusBanner on TeacherHomepage
  it('renders CensusTeacherBanner if showCensusBanner is true and forceHide is false', () => {
    realize({showCensusBanner: true});
    // eslint-disable-next-line no-restricted-properties
    expect(screen.queryByTestId('test-CensusTeacherBanner')).toBeInTheDocument;
  });

  // This test will need to be updated according to whether the banner is showing,
  // as determined by shouldShowAFEBanner in TeacherHomepage.jsx.
  it('renders a DonorTeacherBanner only if afeEligible is true and shouldShowAFEBanner', () => {
    realize({afeEligible: true});
    // eslint-disable-next-line no-restricted-properties
    expect(screen.queryByTestId('test-DonorTeacherBanner')).toBeInTheDocument;
  });

  it('renders a TeacherSections component', () => {
    realize();
    // eslint-disable-next-line no-restricted-properties
    expect(screen.queryByTestId('test-TeacherSections')).toBeInTheDocument;
  });

  it('renders one RecentCourses component', () => {
    realize();
    // eslint-disable-next-line no-restricted-properties
    const recentCourses = screen.queryAllByTestId('test-RecentCourses');
    expect(recentCourses).toHaveLength(1);
    expect(JSON.parse(recentCourses[0].getAttribute('data-props'))).toEqual({
      showAllCoursesLink: true,
      isTeacher: true,
      hasFeedback: false,
      courses: courses,
      topCourse: topCourse,
    });
  });

  it('does not render PL recentCourse if no topPlCourse or plCourses', () => {
    realize({plCourses: [], topPlCourse: null});
    // eslint-disable-next-line no-restricted-properties
    const recentCourses = screen.queryAllByTestId('test-RecentCourses');
    expect(recentCourses).toHaveLength(1);
    expect(JSON.parse(recentCourses[0].getAttribute('data-props'))).toEqual({
      showAllCoursesLink: true,
      isTeacher: true,
      hasFeedback: false,
      courses: courses,
      topCourse: topCourse,
    });
  });

  it('renders a TeacherResources component', () => {
    realize();
    // eslint-disable-next-line no-restricted-properties
    expect(screen.queryByTestId('test-TeacherResources')).toBeInTheDocument;
  });

  it('renders a JoinSectionArea component', () => {
    realize();
    // eslint-disable-next-line no-restricted-properties
    expect(screen.queryByTestId('test-JoinSectionArea')).toBeInTheDocument;
  });

  it('renders ProjectWidgetWithData component', () => {
    realize();
    // eslint-disable-next-line no-restricted-properties
    expect(screen.queryByTestId('test-ProjectWidgetWithData'))
      .toBeInTheDocument;
  });

  it('renders a ParticipantFeedbackNotification component if has feedback and pl courses', () => {
    realize({
      plCourses: plCourses,
      topPlCourse: topPlCourse,
      hasFeedback: true,
    });
    // eslint-disable-next-line no-restricted-properties
    expect(screen.queryByTestId('test-ParticipantFeedbackNotification'))
      .toBeInTheDocument;
  });

  it('does not render a ParticipantFeedbackNotification component if there is no feedback', () => {
    realize({
      plCourses: plCourses,
      topPlCourse: topPlCourse,
      hasFeedback: false,
    });
    // eslint-disable-next-line no-restricted-properties
    expect(screen.queryByTestId('test-ParticipantFeedbackNotification')).not
      .toBeInTheDocument;
  });

  it('does not render a ParticipantFeedbackNotification component if there are no PL courses', () => {
    realize({
      plCourses: [],
      topPlCourse: null,
      hasFeedback: true,
    });
    // eslint-disable-next-line no-restricted-properties
    expect(screen.queryByTestId('test-ParticipantFeedbackNotification')).not
      .toBeInTheDocument;
  });
});

describe('TeacherHomepage - Farsi Global Edition', () => {
  const oldWindowLocation = window.location;
  let store;
  const realize = props => realizeWithStore(store, props);

  beforeEach(() => {
    delete window.location;
    window.location = new URL('https://studio.code.org/global/fa/home');
    stubRedux();
    store = getStore();
  });

  afterEach(() => {
    restoreRedux();
    window.location = oldWindowLocation;
  });

  it('does not render a MarketingAnnouncementBanner', () => {
    realize();
    // eslint-disable-next-line no-restricted-properties
    expect(screen.queryByTestId('test-MarketingAnnouncementBanner')).not
      .toBeInTheDocument;
  });

  it('does not render a TeacherResources', () => {
    realize();
    // eslint-disable-next-line no-restricted-properties
    expect(screen.queryByTestId('test-TeacherResources')).not.toBeInTheDocument;
  });

  it('does not render an IncubatorBanner', () => {
    realize();
    // eslint-disable-next-line no-restricted-properties
    expect(screen.queryByTestId('test-IncubatorBanner')).not.toBeInTheDocument;
  });
});
