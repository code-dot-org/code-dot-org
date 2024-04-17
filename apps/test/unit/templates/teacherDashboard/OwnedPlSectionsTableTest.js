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
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';
import i18n from '@cdo/locale';

import {assert, expect} from '../../../util/reconfiguredChai';

const plSectionRowData = [
  {
    id: 1,
    name: 'first section',
    studentCount: 3,
    code: 'ABC',
    courseOfferingsAreLoaded: true,
    grades: ['K'],
    loginType: SectionLoginType.picture,
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
    grades: ['1'],
    loginType: SectionLoginType.picture,
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
    grades: ['4'],
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

    let hasRowWithAddStudents = false;
    let hasRowWithNumStudnets = false;

    plSectionRowData.forEach(plSection => {
      let rowButton = null;
      const numStudents = plSection.studentCount;

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
          `/teacher_dashboard/sections/${plSection.id}/manage_students`
        )
      );
    });

    // Ensure at least one section shows the "Add students" button and at least one shows
    // the linked student count.
    assert(hasRowWithAddStudents);
    assert(hasRowWithNumStudnets);
  });

  it('loginInfoFormatter shows the section code for sections managed on Code.org', () => {
    renderOwnedPlSectionsTable();

    let hasRowWithThirdParty = false;
    let hasRowWithSectionCode = false;

    plSectionRowData.forEach(plSection => {
      let rowSection = null;
      const loginType = plSection.loginType;

      if (loginType === SectionLoginType.google_classroom) {
        // If third party login type, display the provider name rather than the section code
        rowSection = screen
          .getByText(i18n.loginTypeGoogleClassroom())
          .closest('a');
        expect(screen.queryByText(plSection.code)).to.be.null;
        hasRowWithThirdParty = true;
      } else {
        // Otherwise, show the section code
        rowSection = screen.getByText(plSection.code).closest('a');
        hasRowWithSectionCode = true;
      }

      // Check that the button links to the login info tab of the given section
      assert(
        rowSection.href.includes(
          `/teacher_dashboard/sections/${plSection.id}/login_info`
        )
      );
    });

    // Ensure at least one section has a third party login type and one does not to test
    // both cases.
    assert(hasRowWithThirdParty);
    assert(hasRowWithSectionCode);
  });

  it('courseLinkFormatter provides links to course information and section information', () => {
    renderOwnedPlSectionsTable();

    let hasRowWithNoAssignmentPaths = false;
    let hasRowWithOneAssignmentPath = false;
    let hasRowWithTwoPlusAssignmentPath = false;

    plSectionRowData.forEach(plSection => {
      const assignmentPaths = plSection.assignmentPaths;

      if (assignmentPaths.length === 0) {
        // If no assignment paths, then show button to the catalog page
        const findCourseButton = screen.getByText('Find a course').closest('a');
        assert(findCourseButton.href.includes('/catalog'));
        hasRowWithNoAssignmentPaths = true;
      } else {
        // If 1+ assignment paths, show course name
        const courseName = screen
          .getByText(plSection.assignmentNames[0])
          .closest('a');
        assert(courseName.href.includes(plSection.assignmentPaths[0]));

        if (assignmentPaths.length === 1) {
          hasRowWithOneAssignmentPath = true;
        } else {
          // If 2 assignment paths, show course and unit names
          const unitName = screen
            .getByText(plSection.assignmentNames[1])
            .closest('a');
          assert(unitName.href.includes(plSection.assignmentPaths[1]));
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
    renderOwnedPlSectionsTable();

    plSectionRowData.forEach(plSection => {
      const sectionName = screen.getByText(plSection.name).closest('a');
      assert(
        sectionName.href.includes(`/teacher_dashboard/sections/${plSection.id}`)
      );
    });
  });
});
