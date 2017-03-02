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
    channel: 'NOPQRSTUVWXYZ567879',
    name: 'Batyote',
    studentName: 'Bob',
    type: 'gamelab',
    updatedAt: '2017-01-01T00:00:00.001-08:00'
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
    expect(rows).to.have.length(3);
    assertRowContents(rows.nodes[0], 'Project Name', 'Student Name');
    assertRowContents(rows.nodes[1], 'Antelope Freeway', 'Alice');
    assertRowContents(rows.nodes[2], 'Batyote', 'Bob');
  });

  it ('filters projects when a student is selected from the dropdown', () => {
    root.find('select').simulate('change', {target: {value: 'Alice'}});

    const rows = root.find('tr');
    expect(rows).to.have.length(2);
    assertRowContents(rows.nodes[0], 'Project Name', 'Student Name');
    assertRowContents(rows.nodes[1], 'Antelope Freeway', 'Alice');
  });
});
