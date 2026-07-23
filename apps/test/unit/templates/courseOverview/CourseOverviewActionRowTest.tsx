import teacherSections, {
  setSections,
} from '@code-dot-org/teacher-dashboard/redux';
import {fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  aiChatToolsDependency: 'none' as 'none' | 'essential' | 'available',
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

  it('renders teacher resource dropdown', async () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation();
    renderDefault({teacherResources: TEACHER_RESOURCES, isInstructor: true});

    // DSCO ActionDropdown options only render when the menu is open, and the
    // open state is keyed off a real click (mousedown→mouseup→click). Use
    // userEvent to simulate that sequence; fireEvent.click on a text node
    // doesn't dispatch the full chain.
    const user = userEvent.setup();
    await user.click(
      screen.getByRole('button', {
        name: 'teacher-resources-dropdown filter dropdown',
      })
    );

    // DSCO ActionDropdown renders each option as a <button> that calls
    // `window.open` rather than as an <a href>. Verify the click forwards
    // the resource URL through window.open.
    fireEvent.click(screen.getByRole('button', {name: 'Curriculum'}));
    expect(openSpy).toHaveBeenLastCalledWith(
      '/link/to/curriculum',
      '_blank',
      'noopener,noreferrer'
    );

    fireEvent.click(
      screen.getByRole('button', {name: 'Professional Learning'})
    );
    expect(openSpy).toHaveBeenLastCalledWith(
      '/link/to/professional/learning',
      '_blank',
      'noopener,noreferrer'
    );

    fireEvent.click(screen.getByRole('button', {name: 'Teacher Forum'}));
    expect(openSpy).toHaveBeenLastCalledWith(
      'https://forum.code.org/',
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('doesnt render teacher resource dropdown for students', () => {
    renderDefault({teacherResources: TEACHER_RESOURCES});

    expect(screen.queryByText('Teacher resources')).toBeNull();
  });

  it('renders student resource dropdown for students', async () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation();
    renderDefault({studentResources: TEACHER_RESOURCES});

    const user = userEvent.setup();
    await user.click(
      screen.getByRole('button', {
        name: 'student-resources-dropdown filter dropdown',
      })
    );

    fireEvent.click(screen.getByRole('button', {name: 'Curriculum'}));
    expect(openSpy).toHaveBeenLastCalledWith(
      '/link/to/curriculum',
      '_blank',
      'noopener,noreferrer'
    );

    fireEvent.click(
      screen.getByRole('button', {name: 'Professional Learning'})
    );
    expect(openSpy).toHaveBeenLastCalledWith(
      '/link/to/professional/learning',
      '_blank',
      'noopener,noreferrer'
    );

    fireEvent.click(screen.getByRole('button', {name: 'Teacher Forum'}));
    expect(openSpy).toHaveBeenLastCalledWith(
      'https://forum.code.org/',
      '_blank',
      'noopener,noreferrer'
    );
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
