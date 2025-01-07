import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';
import {Store} from 'redux';

import isRtl, {setRtl} from '@cdo/apps/code-studio/isRtlRedux';
import progress from '@cdo/apps/code-studio/progressRedux';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {ParticipantAudience} from '@cdo/apps/generated/curriculum/sharedCourseConstants';
import {getStore, registerReducers} from '@cdo/apps/redux';
import CourseOverviewActionRow from '@cdo/apps/templates/courseOverview/CourseOverviewActionRow';
import {courseOfferings} from '@cdo/apps/templates/teacherDashboard/teacherDashboardTestHelpers';
import teacherSections, {
  setSections,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import * as utils from '@cdo/apps/utils';

const DEFAULT_PROPS = {
  courseId: 1,
  versions: [],
  courseOfferingId: 1,
  courseVersionId: 1,
  teacherResources: [],
  studentResources: [],
  isInstructor: false,
  viewAs: ViewType.Instructor,
  showAssignButton: true,
  title: 'Course Title',
  participantAudience: ParticipantAudience.student,
};

const TEACHER_RESOURCES = [
  {
    key: 'key1',
    name: 'Curriculum',
    url: '/link/to/curriculum',
  },
  {
    key: 'key2',
    name: 'Professional Learning',
    url: '/link/to/professional/learning',
  },
  {
    key: 'key2',
    name: 'Teacher Forum',
    url: 'https://forum.code.org/',
  },
];

const SECTIONS = [
  {
    id: 11,
    name: 'Period 1',
    hidden: false,
    course_id: 1,
    course_offering_id: 11,
    participant_type: 'student',
    code: 'aaa',
  },
  {
    id: 12,
    name: 'Period 2',
    hidden: false,
    course_id: null,
    course_offering_id: null,
    participant_type: 'student',
    code: 'bbb',
  },
];

describe('CourseOverviewActionRow', () => {
  let store: Store;

  beforeEach(() => {
    jest.spyOn(utils, 'navigateToHref').mockClear().mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function renderDefault(props = {}) {
    store = getStore();

    registerReducers({isRtl, progress, teacherSections});

    store.dispatch(setSections(SECTIONS));

    store.dispatch(setRtl(false));

    render(
      <Provider store={store}>
        <CourseOverviewActionRow {...DEFAULT_PROPS} {...props} />
      </Provider>
    );
  }

  it('versions dropdown - appears when two versions are present and viewable', () => {
    renderDefault({versions: courseOfferings['1'].course_versions});

    screen.getByText('2017');
    const versionSelector = screen.getByLabelText('Version');
    fireEvent.click(versionSelector);
    screen.getByRole('option', {name: '2017'});
    screen.getByRole('option', {name: '2018 (Recommended)'});
    expect(screen.getAllByRole('option')).toHaveLength(2);
  });

  it('versions dropdown - does not appear when only one version is viewable', () => {
    renderDefault({versions: courseOfferings['3'].course_versions});

    expect(screen.queryByLabelText('Version')).toBeNull();
  });

  it('versions dropdown - does not appear when no versions are present', () => {
    renderDefault();

    expect(screen.queryByLabelText('Version')).toBeNull();
  });

  it('renders teacher resource dropdown', () => {
    renderDefault({teacherResources: TEACHER_RESOURCES, isInstructor: true});

    const dropdown = screen.getByText('Teacher resources');
    fireEvent.click(dropdown);

    expect(
      screen.getByRole('link', {name: 'Curriculum'}).getAttribute('href')
    ).toEqual('/link/to/curriculum');

    expect(
      screen
        .getByRole('link', {name: 'Professional Learning'})
        .getAttribute('href')
    ).toEqual('/link/to/professional/learning');

    expect(
      screen.getByRole('link', {name: 'Teacher Forum'}).getAttribute('href')
    ).toEqual('https://forum.code.org/');

    expect(screen.getAllByRole('link')).toHaveLength(3);
  });

  it('doesnt render teacher resource dropdown for students', () => {
    renderDefault({teacherResources: TEACHER_RESOURCES});

    expect(screen.queryByText('Teacher resources')).toBeNull();
  });

  it('renders student resource dropdown for students', () => {
    renderDefault({studentResources: TEACHER_RESOURCES});

    const dropdown = screen.getByText('Student Resources');
    fireEvent.click(dropdown);

    expect(
      screen.getByRole('link', {name: 'Curriculum'}).getAttribute('href')
    ).toEqual('/link/to/curriculum');

    expect(
      screen
        .getByRole('link', {name: 'Professional Learning'})
        .getAttribute('href')
    ).toEqual('/link/to/professional/learning');

    expect(
      screen.getByRole('link', {name: 'Teacher Forum'}).getAttribute('href')
    ).toEqual('https://forum.code.org/');

    expect(screen.getAllByRole('link')).toHaveLength(3);
  });

  it('renders assign to sections button', () => {
    renderDefault({isInstructor: true});

    const assignButton = screen.getByRole('button', {
      name: 'Assign to sections',
    });
    fireEvent.click(assignButton);

    screen.getByRole('dialog');

    screen.getByText(
      'Which section(s) do you want to assign "Course Title" to?'
    );

    expect(
      screen.getByRole('checkbox', {name: 'Period 1'}).getAttribute('checked')
    ).toEqual('');

    expect(
      screen.getByRole('checkbox', {name: 'Period 2'}).getAttribute('checked')
    ).toBeNull();

    expect(screen.getAllByRole('checkbox')).toHaveLength(2);
  });

  it('Does not render assign to sections button', () => {
    renderDefault({isInstructor: false});

    expect(
      screen.queryByRole('button', {
        name: 'Assign to sections',
      })
    ).toBeNull();
  });
});
