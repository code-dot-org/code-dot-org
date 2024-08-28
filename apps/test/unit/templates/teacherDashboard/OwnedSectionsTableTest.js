import {fireEvent, render, screen, within} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';

import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';
import {UnconnectedOwnedSectionsTable as OwnedSectionsTable} from '@cdo/apps/templates/teacherDashboard/OwnedSectionsTable';
import teacherSections, {
  setSections,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import i18n from '@cdo/locale';

const sectionRowData = [
  {
    id: 1,
    name: 'sectionA',
    studentCount: 3,
    code: 'ABC',
    courseId: 29,
    scriptId: 168,
    grades: ['5'],
    loginType: 'picture',
    lessonExtras: true,
    pairingAllowed: true,
    providerManaged: false,
    hidden: false,
    courseOfferingsAreLoaded: true,
    assignmentNames: ['CS Discoveries', 'Unit 1: Problem Solving'],
    assignmentPaths: ['/courses/csd', '/s/csd1-2019'],
  },
  {
    id: 2,
    name: 'sectionB',
    studentCount: 4,
    code: 'XYZ',
    courseId: 29,
    grades: ['6'],
    loginType: 'google_classroom',
    providerManaged: true,
    hidden: false,
    courseOfferingsAreLoaded: true,
    assignmentNames: ['CS Principles'],
    assignmentPaths: ['/courses/csp'],
  },
  {
    id: 3,
    name: 'sectionC',
    studentCount: 1,
    code: 'GHI',
    courseId: 29,
    scriptId: 168,
    grades: ['7'],
    loginType: 'email',
    providerManaged: false,
    hidden: false,
  },
  {
    id: 4,
    name: 'sectionD',
    studentCount: 0,
    code: 'JKL',
    grades: ['8'],
    loginType: 'email',
    providerManaged: false,
    hidden: false,
    courseOfferingsAreLoaded: true,
    assignmentNames: [],
    assignmentPaths: [],
  },
  {
    id: 5,
    name: 'sectionE',
    studentCount: 2,
    code: 'MNO',
    grades: ['9'],
    loginType: 'email',
    providerManaged: false,
    hidden: false,
    courseOfferingsAreLoaded: false,
    assignmentNames: [],
    assignmentPaths: [],
  },
];

// Scramble these for the table to start un-ordered
const scrambledSections = [
  sectionRowData[0],
  sectionRowData[2],
  sectionRowData[4],
  sectionRowData[3],
  sectionRowData[1],
];

describe('OwnedSectionsTable', () => {
  let store;

  beforeEach(() => {
    stubRedux();
    registerReducers({teacherSections});
    store = getStore();
    store.dispatch(setSections(sectionRowData));
  });

  afterEach(() => {
    restoreRedux();
  });

  const DEFAULT_PROPS = {
    sectionIds: [1, 2, 3, 4, 5],
    sectionRows: sectionRowData,
    onEdit: () => {},
  };

  const renderOwnedSectionsTable = (overrideProps = {}) =>
    render(
      <Provider store={store}>
        <OwnedSectionsTable {...DEFAULT_PROPS} {...overrideProps} />
      </Provider>
    );

  it('shows all column headers', () => {
    renderOwnedSectionsTable();

    screen.getByText('Section');
    screen.getByText('Grade');
    screen.getByText('Course');
    screen.getByText('Students');
    screen.getByText('Login Info');
  });

  it('can be sorted correctly by section name', () => {
    renderOwnedSectionsTable({sectionRows: scrambledSections});

    fireEvent.click(screen.getByText('Section'));

    const tableRows = screen.getAllByRole('row');
    for (let i = 1; i < tableRows.length; i++) {
      within(tableRows[i]).getByText(sectionRowData[i - 1].name);
    }
  });

  it('can sort in reverse order by section name when clicked twice', () => {
    renderOwnedSectionsTable({sectionRows: scrambledSections});

    fireEvent.click(screen.getByText('Section'));
    fireEvent.click(screen.getByText('Section'));

    const tableRows = screen.getAllByRole('row');
    for (let i = 1; i < tableRows.length; i++) {
      within(tableRows[i]).getByText(
        sectionRowData[sectionRowData.length - i].name
      );
    }
  });

  it('studentsFormatter provides a link to add or manage students', () => {
    renderOwnedSectionsTable();

    // If section has 0 students, shows "Add students" button
    const noStudentsButton = screen.getByText('Add students').closest('a');
    expect(
      noStudentsButton.href.includes(
        `/teacher_dashboard/sections/${sectionRowData[3].id}/manage_students`
      )
    ).toBeTruthy();

    // If section has 1+ students, displays number of students
    const someStudentsButton = screen
      .getByText(`${sectionRowData[0].studentCount}`)
      .closest('a');
    expect(
      someStudentsButton.href.includes(
        `/teacher_dashboard/sections/${sectionRowData[0].id}/manage_students`
      )
    ).toBeTruthy();
  });

  it('loginInfoFormatter shows the section code for sections managed on Code.org', () => {
    renderOwnedSectionsTable();

    // For sections with third-party login types, display the provider name rather than the section code
    const googleClassroomSection = screen
      .getByText(i18n.loginTypeGoogleClassroom())
      .closest('a');
    expect(
      googleClassroomSection.href.includes(
        `/teacher_dashboard/sections/${sectionRowData[1].id}/login_info`
      )
    ).toBeTruthy();
    expect(screen.queryByText(sectionRowData[1].code)).toBeNull();

    // For sections with non-third-party login types, display section code
    const pictureSection = screen
      .getByText(sectionRowData[0].code)
      .closest('a');
    expect(
      pictureSection.href.includes(
        `/teacher_dashboard/sections/${sectionRowData[0].id}/login_info`
      )
    ).toBeTruthy();
  });

  it('courseLinkFormatter provides links to course information and section information', () => {
    renderOwnedSectionsTable();

    // For sections with no assignment paths, show button to the catalog page
    const findCourseButton = screen.getByText('Find a course').closest('a');
    expect(findCourseButton.href.includes('/catalog')).toBeTruthy();

    // For sections with 1 assignment path, show course name
    const oneAssignmentPathCourseName = screen
      .getByText(sectionRowData[1].assignmentNames[0])
      .closest('a');
    expect(
      oneAssignmentPathCourseName.href.includes(
        sectionRowData[1].assignmentPaths[0]
      )
    ).toBeTruthy();

    // For sections with 2 assignment paths, show course name and unit name
    const twoAssignmentPathsCourseName = screen
      .getByText(sectionRowData[0].assignmentNames[0])
      .closest('a');
    expect(
      twoAssignmentPathsCourseName.href.includes(
        sectionRowData[0].assignmentPaths[0]
      )
    ).toBeTruthy();
    const twoAssignmentPathsUnitName = screen
      .getByText(sectionRowData[0].assignmentNames[1])
      .closest('a');
    expect(
      twoAssignmentPathsUnitName.href.includes(
        sectionRowData[0].assignmentPaths[1]
      )
    ).toBeTruthy();
  });

  it('sectionLinkFormatter contains section link', () => {
    renderOwnedSectionsTable();

    sectionRowData.forEach(section => {
      const sectionName = screen.getByText(section.name).closest('a');
      expect(
        sectionName.href.includes(`/teacher_dashboard/sections/${section.id}`)
      ).toBeTruthy();
    });
  });
});
