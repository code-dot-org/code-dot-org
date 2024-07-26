import {fireEvent, render, screen, within} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';

import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';
import {UnconnectedOwnedPlSectionsTable as OwnedPlSectionsTable} from '@cdo/apps/templates/teacherDashboard/OwnedPlSectionsTable';
import teacherSections, {
  setSections,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {SectionLoginType} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

const plSectionRowData = [
  {
    id: 1,
    name: 'first section',
    studentCount: 3,
    code: 'ABC',
    courseOfferingsAreLoaded: true,
    loginType: SectionLoginType.email,
    participantType: 'teacher',
    providerManaged: true,
    hidden: false,
    assignmentNames: [],
    assignmentPaths: [],
  },
  {
    id: 2,
    name: '2nd section',
    studentCount: 4,
    code: 'DEF',
    courseId: 29,
    courseOfferingsAreLoaded: true,
    loginType: SectionLoginType.email,
    participantType: 'facilitator',
    providerManaged: false,
    hidden: false,
    assignmentNames: ['Test Course 2'],
    assignmentPaths: ['/test-course-2'],
  },
  {
    id: 3,
    name: 'third section',
    studentCount: 0,
    code: 'GHI',
    courseId: 29,
    scriptId: 168,
    courseOfferingsAreLoaded: true,
    loginType: SectionLoginType.google_classroom,
    participantType: 'teacher',
    providerManaged: true,
    hidden: false,
    assignmentNames: ['Test Course 3', 'Unit 1'],
    assignmentPaths: ['/test-course-3', '/course3-unit1'],
  },
];

describe('OwnedPlSectionsTable', () => {
  let store;

  beforeEach(() => {
    stubRedux();
    registerReducers({teacherSections});
    store = getStore();
    store.dispatch(setSections(plSectionRowData));
  });

  afterEach(() => {
    restoreRedux();
  });

  const DEFAULT_PROPS = {
    sectionIds: [1, 2, 3],
    sectionRows: plSectionRowData,
    onEdit: () => {},
  };

  const renderOwnedPlSectionsTable = (overrideProps = {}) =>
    render(
      <Provider store={store}>
        <OwnedPlSectionsTable {...DEFAULT_PROPS} {...overrideProps} />
      </Provider>
    );

  it('shows all column headers', () => {
    renderOwnedPlSectionsTable();

    screen.getByText('Section');
    screen.getByText('Participants');
    screen.getByText('Course');
    screen.getByText('Students');
    screen.getByText('Login Info');
  });

  it('can be sorted correctly by section name', () => {
    const expectedOrder = [
      plSectionRowData[1].name,
      plSectionRowData[0].name,
      plSectionRowData[2].name,
    ];

    renderOwnedPlSectionsTable();

    fireEvent.click(screen.getByText('Section'));

    const tableRows = screen.getAllByRole('row');
    for (let i = 1; i < tableRows.length; i++) {
      within(tableRows[i]).getByText(expectedOrder[i - 1]);
    }
  });

  it('can sort in reverse order by section name when clicked twice', () => {
    const expectedOrder = [
      plSectionRowData[2].name,
      plSectionRowData[0].name,
      plSectionRowData[1].name,
    ];

    renderOwnedPlSectionsTable();

    fireEvent.click(screen.getByText('Section'));
    fireEvent.click(screen.getByText('Section'));

    const tableRows = screen.getAllByRole('row');
    for (let i = 1; i < tableRows.length; i++) {
      within(tableRows[i]).getByText(expectedOrder[i - 1]);
    }
  });

  it('studentsFormatter provides a link to add or manage students', () => {
    renderOwnedPlSectionsTable();

    // If section has 0 students, shows "Add students" button
    const noStudentsButton = screen.getByText('Add students').closest('a');
    expect(
      noStudentsButton.href.includes(
        `/teacher_dashboard/sections/${plSectionRowData[2].id}/manage_students`
      )
    ).toBeTruthy();

    // If section has 1+ students, displays number of students
    const someStudentsButton = screen
      .getByText(`${plSectionRowData[0].studentCount}`)
      .closest('a');
    expect(
      someStudentsButton.href.includes(
        `/teacher_dashboard/sections/${plSectionRowData[0].id}/manage_students`
      )
    ).toBeTruthy();
  });

  it('loginInfoFormatter shows the section code for sections managed on Code.org', () => {
    renderOwnedPlSectionsTable();

    // For sections with third-party login types, display the provider name rather than the section code
    const googleClassroomSection = screen
      .getByText(i18n.loginTypeGoogleClassroom())
      .closest('a');
    expect(
      googleClassroomSection.href.includes(
        `/teacher_dashboard/sections/${plSectionRowData[2].id}/login_info`
      )
    ).toBeTruthy();
    expect(screen.queryByText(plSectionRowData[2].code)).toBeNull();

    // For sections with non-third-party login types, display section code
    const pictureSection = screen
      .getByText(plSectionRowData[0].code)
      .closest('a');
    expect(
      pictureSection.href.includes(
        `/teacher_dashboard/sections/${plSectionRowData[0].id}/login_info`
      )
    ).toBeTruthy();
  });

  it('courseLinkFormatter provides links to course information and section information', () => {
    renderOwnedPlSectionsTable();

    // For sections with no assignment paths, show button to the catalog page
    const findCourseButton = screen.getByText('Find a course').closest('a');
    expect(findCourseButton.href.includes('/catalog')).toBeTruthy();

    // For sections with 1 assignment path, show course name
    const oneAssignmentPathCourseName = screen
      .getByText(plSectionRowData[1].assignmentNames[0])
      .closest('a');
    expect(
      oneAssignmentPathCourseName.href.includes(
        plSectionRowData[1].assignmentPaths[0]
      )
    ).toBeTruthy();

    // For sections with 2 assignment paths, show course name and unit name
    const twoAssignmentPathsCourseName = screen
      .getByText(plSectionRowData[2].assignmentNames[0])
      .closest('a');
    expect(
      twoAssignmentPathsCourseName.href.includes(
        plSectionRowData[2].assignmentPaths[0]
      )
    ).toBeTruthy();
    const twoAssignmentPathsUnitName = screen
      .getByText(plSectionRowData[2].assignmentNames[1])
      .closest('a');
    expect(
      twoAssignmentPathsUnitName.href.includes(
        plSectionRowData[2].assignmentPaths[1]
      )
    ).toBeTruthy();
  });

  it('sectionLinkFormatter contains section link', () => {
    renderOwnedPlSectionsTable();

    plSectionRowData.forEach(plSection => {
      const sectionName = screen.getByText(plSection.name).closest('a');
      expect(
        sectionName.href.includes(`/teacher_dashboard/sections/${plSection.id}`)
      ).toBeTruthy();
    });
  });
});
