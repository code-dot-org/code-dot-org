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
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';
import i18n from '@cdo/locale';

import {assert, expect} from '../../../util/reconfiguredChai';

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
    assignmentPaths: [
      '//localhost-studio.code.org:3000/courses/csd',
      '//localhost-studio.code.org:3000/s/csd1-2019',
    ],
  },
  {
    id: 2,
    name: 'sectionB',
    studentCount: 4,
    courseId: 29,
    grades: ['4'],
    loginType: 'google_classroom',
    providerManaged: true,
    hidden: false,
  },
  {
    id: 3,
    name: 'sectionC',
    studentCount: 0,
    code: 'GHI',
    courseId: 29,
    scriptId: 168,
    grades: ['3'],
    providerManaged: false,
    hidden: false,
  },
  {
    id: 4,
    name: 'sectionD',
    studentCount: 0,
    code: 'JKL',
    grades: ['3'],
    providerManaged: false,
    hidden: false,
    courseOfferingsAreLoaded: true,
    assignmentNames: [],
    assignmentPaths: [],
  },
  {
    id: 5,
    name: 'sectionE',
    studentCount: 0,
    code: 'MNO',
    grades: ['3'],
    providerManaged: false,
    hidden: false,
    courseOfferingsAreLoaded: false,
    assignmentNames: [],
    assignmentPaths: [],
  },
];

// Scramble these for the table to start un-ordered
const sections = [
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
    store.dispatch(setSections(sections));
  });

  afterEach(() => {
    restoreRedux();
  });

  const DEFAULT_PROPS = {
    sectionIds: [1, 2, 3, 4, 5],
    sectionRows: sections,
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
    renderOwnedSectionsTable();

    fireEvent.click(screen.getByText('Section'));

    const tableRows = screen.getAllByRole('row');
    for (let i = 1; i < tableRows.length; i++) {
      within(tableRows[i]).getByText(sectionRowData[i - 1]);
    }
  });

  it('can sort in reverse order by section name when clicked twice', () => {
    renderOwnedSectionsTable();

    fireEvent.click(screen.getByText('Section'));
    fireEvent.click(screen.getByText('Section'));

    const tableRows = screen.getAllByRole('row');
    for (let i = 1; i < tableRows.length; i++) {
      within(tableRows[i]).getByText(sectionRowData[i - 1]);
    }
  });

  it('studentsFormatter provides a link to add or manage students', () => {
    renderOwnedSectionsTable();

    let hasRowWithAddStudents = false;
    let hasRowWithNumStudnets = false;

    sectionRowData.forEach(section => {
      let rowButton = null;
      const numStudents = section.studentCount;

      if (numStudents === 0) {
        // If section has 0 students, shows "Add students" button
        rowButton = screen.getByText('Add students').closest('a');
        hasRowWithAddStudents = true;
      } else {
        // If section has 1+ students, displays number of students
        rowButton = screen.getByText(`${numStudents}`).closest('a');
        hasRowWithNumStudnets = true;
      }

      // Check that the button links to the "Manage Students" tab of the given section
      assert(
        rowButton.href.includes(
          `/teacher_dashboard/sections/${section.id}/manage_students`
        )
      );
    });

    // Ensure at least one section shows the "Add students" button and at least one shows
    // the linked student count.
    assert(hasRowWithAddStudents);
    assert(hasRowWithNumStudnets);
  });

  it('loginInfoFormatter shows the section code for sections managed on Code.org', () => {
    renderOwnedSectionsTable();

    let hasRowWithThirdParty = false;
    let hasRowWithSectionCode = false;

    sectionRowData.forEach(section => {
      let rowSection = null;
      const loginType = section.loginType;

      if (loginType === SectionLoginType.google_classroom) {
        // If third party login type, display the provider name rather than the section code
        rowSection = screen
          .getByText(i18n.loginTypeGoogleClassroom())
          .closest('a');
        expect(screen.queryByText(section.code)).to.be.null;
        hasRowWithThirdParty = true;
      } else {
        // Otherwise, show the section code
        rowSection = screen.getByText(section.code).closest('a');
        hasRowWithSectionCode = true;
      }

      // Check that the button links to the login info tab of the given section
      assert(
        rowSection.href.includes(
          `/teacher_dashboard/sections/${section.id}/login_info`
        )
      );
    });

    // Ensure at least one section has a third party login type and one does not to test
    // both cases.
    assert(hasRowWithThirdParty);
    assert(hasRowWithSectionCode);
  });

  it('courseLinkFormatter provides links to course information and section information', () => {
    renderOwnedSectionsTable();

    let hasRowWithNoAssignmentPaths = false;
    let hasRowWithOneAssignmentPath = false;
    let hasRowWithTwoPlusAssignmentPath = false;

    sectionRowData.forEach(section => {
      const assignmentPaths = section.assignmentPaths;

      if (assignmentPaths.length === 0) {
        // If no assignment paths, then show button to the catalog page
        const findCourseButton = screen.getByText('Find a course').closest('a');
        assert(findCourseButton.href.includes('/catalog'));
        hasRowWithNoAssignmentPaths = true;
      } else {
        // If 1+ assignment paths, show course name
        const courseName = screen
          .getByText(section.assignmentNames[0])
          .closest('a');
        assert(courseName.href.includes(section.assignmentPaths[0]));

        if (assignmentPaths.length === 1) {
          hasRowWithOneAssignmentPath = true;
        } else {
          // If 2 assignment paths, show course and unit names
          const unitName = screen
            .getByText(section.assignmentNames[1])
            .closest('a');
          assert(unitName.href.includes(section.assignmentPaths[1]));
          hasRowWithTwoPlusAssignmentPath = true;
        }
      }
    });

    // Ensure at least one section has no assignment paths, at least one with 1 assignment path,
    // and at least one with 2 assignment paths to test all 3 cases.
    assert(hasRowWithNoAssignmentPaths);
    assert(hasRowWithOneAssignmentPath);
    assert(hasRowWithTwoPlusAssignmentPath);
  });

  it('sectionLinkFormatter contains section link', () => {
    renderOwnedSectionsTable();

    sectionRowData.forEach(section => {
      const sectionName = screen.getByText(section.name).closest('a');
      assert(
        sectionName.href.includes(`/teacher_dashboard/sections/${section.id}`)
      );
    });
  });
});
