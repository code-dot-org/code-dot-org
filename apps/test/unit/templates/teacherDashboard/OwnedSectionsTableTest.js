import {assert, expect} from '../../../util/configuredChai';
import React from 'react';
import {shallow} from 'enzyme';
import {Table} from 'reactabular';
import {
  UnconnectedOwnedSectionsTable as OwnedSectionsTable,
  sectionLinkFormatter,
  courseLinkFormatter,
  gradeFormatter,
  loginInfoFormatter,
  studentsFormatter
} from '@cdo/apps/templates/teacherDashboard/OwnedSectionsTable';
import Button from '@cdo/apps/templates/Button';

const sectionRowData = [
  {
    id: 1,
    name: 'sectionA',
    studentCount: 3,
    code: 'ABC',
    courseId: 29,
    scriptId: 168,
    grade: '5',
    loginType: 'picture',
    stageExtras: true,
    pairingAllowed: true,
    providerManaged: false,
    hidden: false,
    assignmentNames: ['CS Discoveries', 'Unit 1: Problem Solving'],
    assignmentPaths: [
      '//localhost-studio.code.org:3000/courses/csd',
      '//localhost-studio.code.org:3000/s/csd1'
    ]
  },
  {
    id: 2,
    name: 'sectionB',
    studentCount: 4,
    courseId: 29,
    grade: '4',
    loginType: 'google_classroom',
    providerManaged: true,
    hidden: false
  },
  {
    id: 3,
    name: 'sectionC',
    studentCount: 0,
    code: 'GHI',
    courseId: 29,
    scriptId: 168,
    grade: '3',
    providerManaged: false,
    hidden: false
  },
  {
    id: 4,
    name: 'sectionD',
    studentCount: 0,
    code: 'JKL',
    grade: '3',
    providerManaged: false,
    hidden: false,
    assignmentNames: [],
    assignmentPaths: []
  }
];

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

    it('gradeFormatter has grade text', () => {
      const rowData = sectionRowData[0];
      const gradeCol = shallow(gradeFormatter(null, {rowData}));
      const text = gradeCol
        .find('div')
        .at(0)
        .text();
      assert.equal('5', text);
    });

    it('courseLinkFormatter provides links to course information and section information', () => {
      const rowData = sectionRowData[0];
      const courseLinkCol = shallow(courseLinkFormatter(null, {rowData}));
      const courseLink = courseLinkCol
        .find('a')
        .at(0)
        .props().href;
      const sectionLink = courseLinkCol
        .find('a')
        .at(1)
        .props().href;
      assert.equal(
        courseLink,
        '//localhost-studio.code.org:3000/courses/csd?section_id=1'
      );
      assert.equal(
        sectionLink,
        '//localhost-studio.code.org:3000/s/csd1?section_id=1'
      );
    });

    it('courseLinkFormatter contains course text and section text', () => {
      const rowData = sectionRowData[0];
      const courseLinkCol = shallow(courseLinkFormatter(null, {rowData}));
      const courseText = courseLinkCol
        .find('a')
        .at(0)
        .text();
      const sectionText = courseLinkCol
        .find('a')
        .at(1)
        .text();
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
