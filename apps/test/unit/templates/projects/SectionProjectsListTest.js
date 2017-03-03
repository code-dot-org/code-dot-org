import React from 'react';
import SectionProjectsList from '@cdo/apps/templates/projects/SectionProjectsList';
import {mount} from 'enzyme';
import {expect} from '../../../util/configuredChai';

const STUB_PROJECTS_DATA = [
  {
    channel: 'ABCDEFGHIJKLM01234',
    name: 'Antelope Freeway',
    studentName: 'Alice',
    type: 'applab',
    updatedAt: '2016-12-31T23:59:59.999-08:00'
  },
  {
    channel: 'AAAABBBBCCCCDDDDEE',
    name: 'Cats and Kittens',
    studentName: 'Charlie',
    type: 'weblab',
    updatedAt: '2016-11-30T00:00:00.001-08:00'
  },
  {
    channel: 'NOPQRSTUVWXYZ567879',
    name: 'Batyote',
    studentName: 'Bob',
    type: 'gamelab',
    updatedAt: '2017-01-01T00:00:00.001-08:00'
  },
  {
    channel: 'VVVVWWWWXXXXYYYYZZ',
    name: 'Another App',
    studentName: 'Alice',
    type: 'applab',
    updatedAt: '2016-10-29T00:00:00.001-08:00'
  },
];

const STUDIO_URL_PREFIX = '//foo-studio.code.org';

const PROJECT_NAME_COLUMN_INDEX = 0;
const STUDENT_NAME_COLUMN_INDEX = 1;

/**
 * @param {HTMLTableRowElement} rowElement HTML row element in the projects list table
 * @param {string} projectName Expected project name
 * @param {string} studentName Expected student name
 */
function assertRowContents(rowElement, projectName, studentName) {
  expect(rowElement.childNodes[PROJECT_NAME_COLUMN_INDEX].innerText).to.equal(projectName);
  expect(rowElement.childNodes[STUDENT_NAME_COLUMN_INDEX].innerText).to.equal(studentName);
}

describe('SectionProjectsList', () => {
  let root;

  beforeEach(() => {
    root = mount(
      <SectionProjectsList
        projectsData={STUB_PROJECTS_DATA}
        studioUrlPrefix={STUDIO_URL_PREFIX}
      />
    );
  });

  it ('initially shows all projects', () => {
    const rows = root.find('tr');
    expect(rows).to.have.length(5);
    assertRowContents(rows.nodes[0], 'Project Name', 'Student Name');
    assertRowContents(rows.nodes[1], 'Antelope Freeway', 'Alice');
    assertRowContents(rows.nodes[2], 'Cats and Kittens', 'Charlie');
    assertRowContents(rows.nodes[3], 'Batyote', 'Bob');
    assertRowContents(rows.nodes[4], 'Another App', 'Alice');
  });

  it ('shows the correct list of students in the student filter dropdown', () => {
    const options = root.find('option');
    expect(options).to.have.length(4);
    expect(options.nodes[0].innerText).to.equal('All');
    expect(options.nodes[1].innerText).to.equal('Alice');
    expect(options.nodes[2].innerText).to.equal('Bob');
    expect(options.nodes[3].innerText).to.equal('Charlie');

    const select = root.find('select');
    expect(select.nodes[0].value).to.equal('_all_students');
  });

  it ('filters projects when a student is selected from the dropdown', () => {
    const select = root.find('select');
    select.simulate('change', {target: {value: 'Alice'}});
    expect(select.nodes[0].value).to.equal('Alice');

    const rows = root.find('tr');
    expect(rows).to.have.length(3);
    assertRowContents(rows.nodes[0], 'Project Name', 'Student Name');
    assertRowContents(rows.nodes[1], 'Antelope Freeway', 'Alice');
    assertRowContents(rows.nodes[2], 'Another App', 'Alice');
  });

  it('shows all students projects if the current students projects all disappear', () => {
    const select = root.find('select');
    select.simulate('change', {target: {value: 'Charlie'}});
    expect(select.nodes[0].value).to.equal('Charlie');

    let rows = root.find('tr');
    expect(rows).to.have.length(2);
    assertRowContents(rows.nodes[0], 'Project Name', 'Student Name');
    assertRowContents(rows.nodes[1], 'Cats and Kittens', 'Charlie');

    // Remove Charlie's project from the list
    const newProjectsData = Array.from(STUB_PROJECTS_DATA);
    const charlieProjectIndex = newProjectsData.findIndex(project => (
      project.studentName === 'Charlie'
    ));
    newProjectsData.splice(charlieProjectIndex, 1);
    root.setProps({projectsData: newProjectsData});

    // We should now see all students projects, except Charlie's
    rows = root.find('tr');
    expect(select.nodes[0].value).to.equal('_all_students');
    expect(rows).to.have.length(4);
    assertRowContents(rows.nodes[0], 'Project Name', 'Student Name');
    assertRowContents(rows.nodes[1], 'Antelope Freeway', 'Alice');
    assertRowContents(rows.nodes[2], 'Batyote', 'Bob');
    assertRowContents(rows.nodes[3], 'Another App', 'Alice');

    // Charlie should no longer appear in the dropdown
    const options = root.find('option');
    expect(options).to.have.length(3);
    expect(options.nodes[0].innerText).to.equal('All');
    expect(options.nodes[1].innerText).to.equal('Alice');
    expect(options.nodes[2].innerText).to.equal('Bob');
  });

  describe('getStudentNames', () => {
    it('shows students in alphabetical order and without duplicates', () => {
      expect(SectionProjectsList.getStudentNames(STUB_PROJECTS_DATA)).to.deep.equal(
        ['Alice', 'Bob', 'Charlie']);
    });
  });
});
