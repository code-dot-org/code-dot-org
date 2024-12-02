import {render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';

import isRtl, {setRtl} from '@cdo/apps/code-studio/isRtlRedux';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {
  getStore,
  stubRedux,
  registerReducers,
  restoreRedux,
} from '@cdo/apps/redux';
import StudentHomepage from '@cdo/apps/templates/studioHomepages/StudentHomepage';
import i18n from '@cdo/locale';

import {courses, topCourse, joinedSections} from './homepagesTestData';

const TEST_PROPS = {
  courses,
  topCourse,
  sections: joinedSections,
  codeOrgUrlPrefix: 'http://localhost:3000',
  studentId: 123,
  isEnglish: true,
  hasFeedback: false,
  showVerifiedTeacherWarning: false,
  specialAnnouncement: {
    id: 'id',
    image: '/image',
    title: 'title',
    body: 'body',
    link: '/link',
    description: 'description',
    buttonUrl: '/url',
    buttonText: 'press me',
    heading: 'heading',
  },
};

// We will mock out as mock as we can to avoid dealing with responsive reduxes
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
jest.mock('@cdo/apps/templates/studioHomepages/RecentCourses', () => props => (
  // eslint-disable-next-line react/forbid-dom-props
  <div data-testid={'test-RecentCourses'} data-props={JSON.stringify(props)} />
));
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
      <StudentHomepage {...TEST_PROPS} {...props} />
    </Provider>
  );
}

describe('StudentHomepage', () => {
  const oldWindowLocation = window.location;
  let store;
  const realize = props => realizeWithStore(store, props);

  beforeEach(() => {
    delete window.location;
    window.location = new URL('https://studio.code.org/teacher_dashboard');
    stubRedux();
    registerReducers({isRtl});
    store = getStore();
    store.dispatch(setRtl(false));
  });

  afterEach(() => {
    restoreRedux();
    window.location = oldWindowLocation;
  });

  it('shows a Header Banner that says My Dashboard', () => {
    realize();
    expect(screen.getByText('My Dashboard')).toBeInTheDocument;
  });

  it('references a ProtectedStatefulDiv for flashes', () => {
    realize();
    // eslint-disable-next-line no-restricted-properties
    const items = screen.queryAllByTestId('test-ProtectedStatefulDiv');
    expect(items).toHaveLength(1);
  });

  it('shows RecentCourses component', () => {
    realize();
    // eslint-disable-next-line no-restricted-properties
    const recentCourses = screen.queryAllByTestId('test-RecentCourses');
    expect(recentCourses).toHaveLength(1);
    expect(JSON.parse(recentCourses[0].getAttribute('data-props'))).toEqual({
      courses: courses,
      topCourse: topCourse,
      isTeacher: false,
      hasFeedback: false,
    });
  });

  it('shows ProjectWidgetWithData component', () => {
    realize();
    // eslint-disable-next-line no-restricted-properties
    expect(screen.queryByTestId('test-ProjectWidgetWithData'))
      .toBeInTheDocument;
  });

  it('shows a JoinSectionArea component', () => {
    realize();
    // eslint-disable-next-line no-restricted-properties
    const joinSectionArea = screen.queryByTestId('test-JoinSectionArea');
    expect(joinSectionArea).toBeInTheDocument;
    expect(JSON.parse(joinSectionArea.getAttribute('data-props'))).toEqual({
      initialJoinedStudentSections: joinedSections,
    });
  });

  it('does not log an Amplitude event for student signing-in', () => {
    const analyticsSpy = jest.spyOn(analyticsReporter, 'sendEvent');
    realize();

    const calls = analyticsSpy.mock.calls.filter(
      call => call[0] === EVENTS.STUDENT_LOGIN_EVENT
    );
    expect(calls).toHaveLength(0);
    analyticsSpy.mockClear();
  });

  it('shows the special announcement for all languages', () => {
    realize();
    // eslint-disable-next-line no-restricted-properties
    const banner = screen.queryByTestId('test-MarketingAnnouncementBanner');
    expect(banner).toBeInTheDocument;

    // Let's check that we passed the announcement through
    expect(JSON.parse(banner.getAttribute('data-props')).announcement).toEqual(
      TEST_PROPS.specialAnnouncement
    );
  });

  it('displays a notification for verified teacher permissions if showVerifiedTeacherWarning is true', () => {
    realize({showVerifiedTeacherWarning: true});

    expect(screen.queryByText(i18n.studentAsVerifiedTeacherWarning()))
      .toBeInTheDocument;
  });
});

describe('StudentHomepage - Farsi Global Edition', () => {
  const oldWindowLocation = window.location;
  let store;
  const realize = props => realizeWithStore(store, props);

  beforeEach(() => {
    delete window.location;
    window.location = new URL('https://studio.code.org/teacher_dashboard');
    stubRedux();
    registerReducers({isRtl});
    store = getStore();
    store.dispatch(setRtl(false));
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
});
