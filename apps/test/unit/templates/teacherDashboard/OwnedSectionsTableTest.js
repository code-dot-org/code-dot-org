import {assert, expect} from '../../../util/reconfiguredChai';
import React from 'react';
import {shallow, mount} from 'enzyme';
import * as Table from 'reactabular-table';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';
import {Provider} from 'react-redux';
import {
  getStore,
  registerReducers,
  __testing_stubRedux,
  __testing_restoreRedux,
} from '@cdo/apps/redux';
import {
  UnconnectedOwnedSectionsTable as OwnedSectionsTable,
  sectionLinkFormatter,
  courseLinkFormatter,
  loginInfoFormatter,
  studentsFormatter,
  COLUMNS,
} from '@cdo/apps/templates/teacherDashboard/OwnedSectionsTable';
import Button from '@cdo/apps/templates/Button';
import teacherSections, {
  setSections,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

const GRADE_COLUMN = COLUMNS.GRADE.toString();

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
    assignmentNames: [],
    assignmentPaths: [],
  },
];

const sectionGradesRowData = [
  {
    id: 1,
    name: 'sectionA',
    studentCount: 3,
    code: 'ABC',
    courseId: 29,
    grades: ['K'],
    loginType: SectionLoginType.picture,
    providerManaged: true,
    hidden: false,
    assignmentNames: [],
    assignmentPaths: [],
  },
  {
    id: 2,
    name: 'sectionB',
    studentCount: 4,
    code: 'DEF',
    courseId: 29,
    grades: ['1'],
    loginType: SectionLoginType.picture,
    providerManaged: true,
    hidden: false,
    assignmentNames: [],
    assignmentPaths: [],
  },
  {
    id: 3,
    name: 'sectionC',
    studentCount: 0,
    code: 'GHI',
    courseId: 29,
    scriptId: 168,
    grades: ['4'],
    loginType: SectionLoginType.picture,
    providerManaged: false,
    hidden: false,
    assignmentNames: [],
    assignmentPaths: [],
  },
  {
    id: 4,
    name: 'sectionD',
    studentCount: 0,
    code: 'JKL',
    grades: ['10'],
    loginType: SectionLoginType.picture,
    providerManaged: false,
    hidden: false,
    assignmentNames: [],
    assignmentPaths: [],
  },
  {
    id: 5,
    name: 'sectionE',
    studentCount: 0,
    code: 'MNO',
    courseId: 29,
    scriptId: 168,
    grades: ['12'],
    providerManaged: false,
    hidden: false,
    loginType: SectionLoginType.picture,
    assignmentNames: [],
    assignmentPaths: [],
  },
  {
    id: 6,
    name: 'sectionF',
    studentCount: 0,
    code: 'PQR',
    grades: ['Other'],
    providerManaged: false,
    hidden: false,
    loginType: SectionLoginType.picture,
    assignmentNames: [],
    assignmentPaths: [],
  },
  {
    id: 7,
    name: 'sectionG',
    studentCount: 0,
    code: 'STU',
    grades: null,
    providerManaged: false,
    hidden: false,
    loginType: SectionLoginType.picture,
    assignmentNames: [],
    assignmentPaths: [],
  },
];

const plSectionRowData = [
  {
    id: 1,
    name: 'sectionA',
    studentCount: 3,
    code: 'ABC',
    courseId: 29,
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
    name: 'sectionB',
    studentCount: 4,
    code: 'DEF',
    courseId: 29,
    grades: ['1'],
    loginType: SectionLoginType.picture,
    participantType: 'facilitator',
    providerManaged: true,
    hidden: false,
    assignmentNames: [],
    assignmentPaths: [],
  },
  {
    id: 3,
    name: 'sectionC',
    studentCount: 0,
    code: 'GHI',
    courseId: 29,
    scriptId: 168,
    grades: ['4'],
    loginType: SectionLoginType.picture,
    participantType: 'teacher',
    providerManaged: false,
    hidden: false,
    assignmentNames: [],
    assignmentPaths: [],
  },
];

// Scramble these for the table to start un-ordered
const sections = [
  sectionGradesRowData[5],
  sectionGradesRowData[0],
  sectionGradesRowData[2],
  sectionGradesRowData[4],
  sectionGradesRowData[3],
  sectionGradesRowData[1],
  sectionGradesRowData[6],
];

describe('OwnedSectionsTable Sorting', () => {
  let store;
  beforeEach(() => {
    __testing_stubRedux();
    registerReducers({teacherSections});
    store = getStore();
    store.dispatch(setSections(sections));
  });

  afterEach(() => {
    __testing_restoreRedux();
  });

  it('can be sorted correctly by grade', () => {
    const wrapper = mount(
      <Provider store={store}>
        <OwnedSectionsTable
          sectionIds={[1, 2, 3, 4, 5, 6, 7]}
          sectionRows={sectionGradesRowData}
          onEdit={() => {}}
        />
      </Provider>
    );

    // first click should sort sections K-12
    wrapper.find('.uitest-grade-header').simulate('click');
    const expectedGradeOrder = ['K', '1', '4', '10', '12', 'Other', ''];
    const tbody = wrapper.find('tbody');
    expect(tbody.length).to.equal(1);
    const rows = tbody.find('tr');
    expect(rows.length).to.equal(7);
    // Check grades for each row match expected order
    rows.forEach((tr, rowIndex) => {
      const cells = tr.find('td');
      expect(cells.at(GRADE_COLUMN).text()).to.equal(
        expectedGradeOrder[rowIndex]
      );
    });
  });

  it('can be sorted by grade in the reverse order with a second click', () => {
    const wrapper = mount(
      <Provider store={store}>
        <OwnedSectionsTable
          sectionIds={[1, 2, 3, 4, 5, 6, 7]}
          sectionRows={sectionGradesRowData}
          onEdit={() => {}}
        />
      </Provider>
    );

    // first click should sort sections K-12
    wrapper.find('.uitest-grade-header').simulate('click');
    // second click should sort sections in reverse order
    wrapper.find('.uitest-grade-header').simulate('click');

    const expectedGradeOrder = ['', 'Other', '12', '10', '4', '1', 'K'];
    const body = wrapper.find('tbody');
    const trows = body.find('tr');
    trows.forEach((tr, rowIndex) => {
      const cells = tr.find('td');
      expect(cells.at(GRADE_COLUMN).text()).to.equal(
        expectedGradeOrder[rowIndex]
      );
    });
  });

  it('table for pl sections shows participant type instead of grade', () => {
    const wrapper = mount(
      <Provider store={store}>
        <OwnedSectionsTable
          sectionIds={[1, 2, 3]}
          sectionRows={plSectionRowData}
          isPlSections={true}
          onEdit={() => {}}
        />
      </Provider>
    );
    expect(wrapper.find('.uitest-participant-type-header').length).to.equal(1);
    const expectedParticipantTypes = ['Teachers', 'Facilitators', 'Teachers'];

    let trows = wrapper.find('tbody').find('tr');
    trows.forEach((tr, rowIndex) => {
      const cells = tr.find('td');
      expect(cells.at(GRADE_COLUMN).text()).to.equal(
        expectedParticipantTypes[rowIndex]
      );
    });
  });
});

describe('OwnedSectionsTable', () => {
  it('has a header and a body', () => {
    const wrapper = shallow(
      <OwnedSectionsTable
        sectionIds={[1]}
        sectionRows={sectionRowData.slice(0, 1)}
        onEdit={() => {}}
      />
    );
    const header = wrapper.find(Table.Header);
    assert.equal(header.length, 1);

    const body = wrapper.find(Table.Body);
    assert.equal(body.length, 1);
  });

  it('is 970px wide', () => {
    const wrapper = shallow(
      <OwnedSectionsTable
        sectionIds={[1]}
        sectionRows={sectionRowData.slice(0, 1)}
        onEdit={() => {}}
      />
    );
    const style = wrapper.prop('style');
    expect(style).to.include({width: 970});
  });

  describe('OwnedSectionsTable Formatters', () => {
    it('studentsFormatter provides a link to add or manage students', () => {
      const rowData = sectionRowData[0];
      const studentsCol = shallow(studentsFormatter(null, {rowData}));
      const link = studentsCol.prop('href');
      assert.equal('/teacher_dashboard/sections/1/manage_students', link);
    });

    it('studentsFormatter shows the correct number of >0 students', () => {
      const rowData = sectionRowData[0];
      const studentsCol = shallow(studentsFormatter(null, {rowData}));
      const text = studentsCol.text();
      assert.equal('3', text);
    });

    it('studentsFormatter shows the mesage for 0 students', () => {
      const rowData = sectionRowData[2];
      const studentsCol = shallow(studentsFormatter(null, {rowData}));
      const text = studentsCol.text();
      assert.equal('Add students', text);
    });

    it('studentsFormatter shows a button with a link for 0 students', () => {
      const rowData = sectionRowData[2];
      const studentsCol = shallow(studentsFormatter(null, {rowData}));
      const link = studentsCol.prop('href');
      assert.equal('/teacher_dashboard/sections/3/manage_students', link);
    });

    it('loginInfoFormatter shows the section code for sections managed on Code.org', () => {
      const rowData = sectionRowData[0];
      const loginCol = shallow(loginInfoFormatter(null, {rowData}));
      const text = loginCol.text();
      assert.equal('ABC', text);
    });

    it('loginInfoFormatter shows the provider managed section code', () => {
      const rowData = sectionRowData[1];
      const loginCol = shallow(loginInfoFormatter(null, {rowData}));
      const text = loginCol.text();
      assert.include(text, 'Google Classroom');
    });

    it('loginInfoFormatter has a link to the sign in cards for picture login type', () => {
      const rowData = sectionRowData[0];
      const loginCol = shallow(loginInfoFormatter(null, {rowData}));
      const link = loginCol.prop('href');
      assert.equal(link, '/teacher_dashboard/sections/1/login_info');
    });

    it('loginInfoFormatter has a link to the sign in cards for third party login', () => {
      const rowData = sectionRowData[1];
      const loginCol = shallow(loginInfoFormatter(null, {rowData}));
      const link = loginCol.prop('href');
      assert.equal(link, '/teacher_dashboard/sections/2/login_info');
    });

    it('courseLinkFormatter provides links to course information and section information', () => {
      const rowData = sectionRowData[0];
      const courseLinkCol = shallow(courseLinkFormatter(null, {rowData}));
      const courseLink = courseLinkCol.find('a').at(0).props().href;
      const sectionLink = courseLinkCol.find('a').at(1).props().href;
      assert.equal(
        courseLink,
        '//localhost-studio.code.org:3000/courses/csd?section_id=1'
      );
      assert.equal(
        sectionLink,
        '//localhost-studio.code.org:3000/s/csd1-2019?section_id=1'
      );
    });

    it('courseLinkFormatter contains course text and section text', () => {
      const rowData = sectionRowData[0];
      const courseLinkCol = shallow(courseLinkFormatter(null, {rowData}));
      const courseText = courseLinkCol.find('a').at(0).text();
      const sectionText = courseLinkCol.find('a').at(1).text();
      assert.equal(courseText, 'CS Discoveries');
      assert.equal(sectionText, 'Unit 1: Problem Solving');
    });

    it('courseLinkFormatter contains button with correct link and text when no course provided', () => {
      const rowData = sectionRowData[3];
      const courseLinkCol = shallow(courseLinkFormatter(null, {rowData}));
      const button = courseLinkCol.text();
      const link = courseLinkCol.find(Button).prop('href');
      const text = courseLinkCol.find(Button).prop('text');
      assert.equal(button, '<Button />');
      assert.equal(link, '/courses');
      assert.equal(text, 'Find a course');
    });

    it('sectionLinkFormatter contains section link', () => {
      const rowData = sectionRowData[0];
      const sectionLinkCol = shallow(sectionLinkFormatter(null, {rowData}));
      const sectionLink = sectionLinkCol.prop('href');
      assert.equal(sectionLink, '/teacher_dashboard/sections/1');
    });

    it('sectionLinkFormatter contains section text', () => {
      const rowData = sectionRowData[0];
      const sectionLinkCol = shallow(sectionLinkFormatter(null, {rowData}));
      const sectionText = sectionLinkCol.text();
      assert.equal(sectionText, 'sectionA');
    });
  });
});
