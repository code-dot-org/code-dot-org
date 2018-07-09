import React from 'react';
import SectionProjectsList from '@cdo/apps/templates/projects/SectionProjectsList';
import {COLUMNS, COLUMNS_WITHOUT_THUMBNAILS} from '@cdo/apps/templates/projects/ProjectsList';
import {mount} from 'enzyme';
import {expect} from '../../../util/configuredChai';

const CAT_IMAGE_URL = '/base/static/common_images/stickers/cat.png';

const STUB_PROJECTS_DATA = [
  {
    channel: 'ABCDEFGHIJKLM01234',
    name: 'Antelope Freeway',
    studentName: 'Alice',
    type: 'weblab',
    updatedAt: '2016-12-29T11:00:00-00:00'
  },
  {
    channel: 'AAAABBBBCCCCDDDDEE',
    name: 'Cats and Kittens',
    studentName: 'Charlie',
    thumbnailUrl: CAT_IMAGE_URL,
    type: 'weblab',
    updatedAt: '2016-11-30T11:00:00-00:00'
  },
  {
    channel: 'NOPQRSTUVWXYZ567879',
    name: 'Dominoes',
    studentName: 'Bob',
    type: 'gamelab',
    updatedAt: '2017-01-01T11:00:00-00:00'
  },
  {
    channel: 'VVVVWWWWXXXXYYYYZZ',
    name: 'A1 Locksmith',
    studentName: 'Alice',
    type: 'applab',
    updatedAt: '2016-10-29T11:00:00-00:00'
  },
];

const STUDIO_URL_PREFIX = '//foo-studio.code.org';

/**
 * @param {HTMLTableRowElement} rowElement HTML row element in the projects list table
 * @param {string} projectName Expected project name
 * @param {string} studentName Expected student name
 * @param {string} appType Expected app type (App Lab, Game Lab, etc)
 * @param {string} lastEdited Expected last edited date (Month DD, YYYY). Note that this
 *   format is used only in unit tests due to incorrect date formatting in PhantomJS.
 *   The desired date format which we will show in all browsers is MM/DD/YYYY.
 */
function assertRowContents(rowElement, thumbnailUrl, projectName, studentName, appType, lastEdited) {
  assertRowThumbnail(rowElement, thumbnailUrl);
  expect(rowElement.childNodes[COLUMNS.PROJECT_NAME].innerText).to.equal(projectName);
  expect(rowElement.childNodes[COLUMNS.STUDENT_NAME].innerText).to.equal(studentName);
  expect(rowElement.childNodes[COLUMNS.APP_TYPE].innerText).to.equal(appType);
  // Temporarily comment out this line to make tests pass locally in Chrome
  expect(rowElement.childNodes[COLUMNS.LAST_EDITED].innerText).to.equal(lastEdited);
}

function assertRowThumbnail(rowElement, thumbnailUrl) {
  const td = rowElement.childNodes[COLUMNS.THUMBNAIL];
  const img = td.querySelector('img');
  const src = img && img.getAttribute('src');
  expect(src).to.equal(thumbnailUrl);
}

/**
 * @param {HTMLTableRowElement} rowElement HTML row element in the projects list table
 * @param {string} projectName Expected project name
 * @param {string} studentName Expected student name
 * @param {string} appType Expected app type (App Lab, Game Lab, etc)
 * @param {string} lastEdited Expected last edited date (Month DD, YYYY). Note that this
 *   format is used only in unit tests due to incorrect date formatting in PhantomJS.
 *   The desired date format which we will show in all browsers is MM/DD/YYYY.
 */
function assertRowContentsWithoutThumbnail(rowElement, projectName, studentName, appType, lastEdited) {
  expect(rowElement.childNodes[COLUMNS_WITHOUT_THUMBNAILS.PROJECT_NAME].innerText).to.equal(projectName);
  expect(rowElement.childNodes[COLUMNS_WITHOUT_THUMBNAILS.STUDENT_NAME].innerText).to.equal(studentName);
  expect(rowElement.childNodes[COLUMNS_WITHOUT_THUMBNAILS.APP_TYPE].innerText).to.equal(appType);
  // Temporarily comment out this line to make tests pass locally in Chrome
  expect(rowElement.childNodes[COLUMNS_WITHOUT_THUMBNAILS.LAST_EDITED].innerText).to.equal(lastEdited);
}


describe('SectionProjectsList', () => {
  let root;

  beforeEach(() => {
    root = mount(
      <SectionProjectsList
        projectsData={STUB_PROJECTS_DATA}
        studioUrlPrefix={STUDIO_URL_PREFIX}
        showProjectThumbnails={true}
      />
    );
  });

  describe('test data', () => {
    // The Date object in PhantomJS does not respect the options to specify the
    // time zone when outputting the date in any localized format. Our unit tests
    // need to pass in UTC (for CircleCI and staging) as well as any time zones
    // in which developers are running unit tests locally. Therefore, use only
    // timestamps at 11am UTC, since it is the same calendar date in every time zone
    // in the world at that time of day (time zones range from GMT-11 to GMT+12).
    it('contains only timestamps at 11am UTC', () => {
      for (let i = 0; i < STUB_PROJECTS_DATA.length; i++) {
        const date = new Date(STUB_PROJECTS_DATA[i].updatedAt);
        expect(date.getUTCHours()).to.equal(11);
      }
    });

    it('is compatible with the time zone of the test browser', () => {
      const date = new Date(STUB_PROJECTS_DATA[0].updatedAt);
      expect(date.toLocaleDateString()).to.equal('December 29, 2016');
    });
  });

  it('hide thumbnail column when showProjectThumbnails is disabled', () => {
    root = mount(
      <SectionProjectsList
        projectsData={STUB_PROJECTS_DATA}
        studioUrlPrefix={STUDIO_URL_PREFIX}
        showProjectThumbnails={false}
      />
    );

    let rows = root.find('tr');
    expect(rows).to.have.length(5);

    assertRowContentsWithoutThumbnail(rows.nodes[0], 'Project Name', 'Student Name', 'Type', 'Last Edited');
    assertRowContentsWithoutThumbnail(rows.nodes[1], 'Dominoes', 'Bob', 'Game Lab', 'January 1, 2017');
    assertRowContentsWithoutThumbnail(rows.nodes[2], 'Antelope Freeway', 'Alice', 'Web Lab', 'December 29, 2016');
    assertRowContentsWithoutThumbnail(rows.nodes[3], 'Cats and Kittens', 'Charlie', 'Web Lab', 'November 30, 2016');
    assertRowContentsWithoutThumbnail(rows.nodes[4], 'A1 Locksmith', 'Alice', 'App Lab', 'October 29, 2016');
  });

    it('initially shows all projects, most recently edited first', () => {
    let rows = root.find('tr');
    expect(rows).to.have.length(5);
    assertRowContents(rows.nodes[0], null, 'Project Name', 'Student Name', 'Type', 'Last Edited');
    assertRowContents(rows.nodes[1], null, 'Dominoes', 'Bob', 'Game Lab', 'January 1, 2017');
    assertRowContents(rows.nodes[2], null, 'Antelope Freeway', 'Alice', 'Web Lab', 'December 29, 2016');
    assertRowContents(rows.nodes[3], CAT_IMAGE_URL, 'Cats and Kittens', 'Charlie', 'Web Lab', 'November 30, 2016');
    assertRowContents(rows.nodes[4], null, 'A1 Locksmith', 'Alice', 'App Lab', 'October 29, 2016');

    const lastEditedHeader = root.find('th').at(COLUMNS.LAST_EDITED);
    expect(lastEditedHeader.node.innerText).to.contain('Last Edited');

    // Show least recently edited first
    lastEditedHeader.simulate('click');

    rows = root.find('tr');
    expect(rows).to.have.length(5);
    assertRowContents(rows.nodes[0], null, 'Project Name', 'Student Name', 'Type', 'Last Edited');
    assertRowContents(rows.nodes[1], null, 'A1 Locksmith', 'Alice', 'App Lab', 'October 29, 2016');
    assertRowContents(rows.nodes[2], CAT_IMAGE_URL, 'Cats and Kittens', 'Charlie', 'Web Lab', 'November 30, 2016');
    assertRowContents(rows.nodes[3], null, 'Antelope Freeway', 'Alice', 'Web Lab', 'December 29, 2016');
    assertRowContents(rows.nodes[4], null, 'Dominoes', 'Bob', 'Game Lab', 'January 1, 2017');
  });

  it('can be sorted by project name', () => {
    const projectNameHeader = root.find('th').at(COLUMNS.PROJECT_NAME);
    expect(projectNameHeader.node.innerText).to.contain('Project Name');

    // Sort in ascending order by project name
    projectNameHeader.simulate('click');

    let rows = root.find('tr');
    expect(rows).to.have.length(5);
    assertRowContents(rows.nodes[0], null, 'Project Name', 'Student Name', 'Type', 'Last Edited');
    assertRowContents(rows.nodes[1], null, 'A1 Locksmith', 'Alice', 'App Lab', 'October 29, 2016');
    assertRowContents(rows.nodes[2], null, 'Antelope Freeway', 'Alice', 'Web Lab', 'December 29, 2016');
    assertRowContents(rows.nodes[3], CAT_IMAGE_URL, 'Cats and Kittens', 'Charlie', 'Web Lab', 'November 30, 2016');
    assertRowContents(rows.nodes[4], null, 'Dominoes', 'Bob', 'Game Lab', 'January 1, 2017');

    // Sort in descending order by project name
    projectNameHeader.simulate('click');

    rows = root.find('tr');
    expect(rows).to.have.length(5);
    assertRowContents(rows.nodes[0], null, 'Project Name', 'Student Name', 'Type', 'Last Edited');
    assertRowContents(rows.nodes[1], null, 'Dominoes', 'Bob', 'Game Lab', 'January 1, 2017');
    assertRowContents(rows.nodes[2], CAT_IMAGE_URL, 'Cats and Kittens', 'Charlie', 'Web Lab', 'November 30, 2016');
    assertRowContents(rows.nodes[3], null, 'Antelope Freeway', 'Alice', 'Web Lab', 'December 29, 2016');
    assertRowContents(rows.nodes[4], null, 'A1 Locksmith', 'Alice', 'App Lab', 'October 29, 2016');
  });

  it('can be sorted by student name', () => {
    const projectNameHeader = root.find('th').at(COLUMNS.STUDENT_NAME);
    expect(projectNameHeader.node.innerText).to.contain('Student Name');

    // Sort in ascending order by student name
    projectNameHeader.simulate('click');

    let rows = root.find('tr');
    expect(rows).to.have.length(5);
    assertRowContents(rows.nodes[0], null, 'Project Name', 'Student Name', 'Type', 'Last Edited');
    assertRowContents(rows.nodes[1], null, 'Antelope Freeway', 'Alice', 'Web Lab', 'December 29, 2016');
    assertRowContents(rows.nodes[2], null, 'A1 Locksmith', 'Alice', 'App Lab', 'October 29, 2016');
    assertRowContents(rows.nodes[3], null, 'Dominoes', 'Bob', 'Game Lab', 'January 1, 2017');
    assertRowContents(rows.nodes[4], CAT_IMAGE_URL, 'Cats and Kittens', 'Charlie', 'Web Lab', 'November 30, 2016');

    // Sort in descending order by student name
    projectNameHeader.simulate('click');

    rows = root.find('tr');
    expect(rows).to.have.length(5);
    assertRowContents(rows.nodes[0], null, 'Project Name', 'Student Name', 'Type', 'Last Edited');
    assertRowContents(rows.nodes[1], CAT_IMAGE_URL, 'Cats and Kittens', 'Charlie', 'Web Lab', 'November 30, 2016');
    assertRowContents(rows.nodes[2], null, 'Dominoes', 'Bob', 'Game Lab', 'January 1, 2017');
    // There is no secondary sort key. When the sort by name is reversed, elements with the same
    // primary sort key do not change in order relative to each other.
    assertRowContents(rows.nodes[3], null, 'Antelope Freeway', 'Alice', 'Web Lab', 'December 29, 2016');
    assertRowContents(rows.nodes[4], null, 'A1 Locksmith', 'Alice', 'App Lab', 'October 29, 2016');
  });

  it('can be sorted by app type', () => {
    const appTypeHeader = root.find('th').at(COLUMNS.APP_TYPE);
    expect(appTypeHeader.node.innerText).to.contain('Type');

    // Sort in ascending order by app type
    appTypeHeader.simulate('click');

    let rows = root.find('tr');
    expect(rows).to.have.length(5);
    assertRowContents(rows.nodes[0], null, 'Project Name', 'Student Name', 'Type', 'Last Edited');
    assertRowContents(rows.nodes[1], null, 'A1 Locksmith', 'Alice', 'App Lab', 'October 29, 2016');
    assertRowContents(rows.nodes[2], null, 'Dominoes', 'Bob', 'Game Lab', 'January 1, 2017');
    assertRowContents(rows.nodes[3], null, 'Antelope Freeway', 'Alice', 'Web Lab', 'December 29, 2016');
    assertRowContents(rows.nodes[4], CAT_IMAGE_URL, 'Cats and Kittens', 'Charlie', 'Web Lab', 'November 30, 2016');

    // Sort in descending order by student name
    appTypeHeader.simulate('click');

    rows = root.find('tr');
    expect(rows).to.have.length(5);
    assertRowContents(rows.nodes[0], null, 'Project Name', 'Student Name', 'Type', 'Last Edited');
    // There is no secondary sort key. When the sort by name is reversed, elements with the same
    // primary sort key do not change in order relative to each other.
    assertRowContents(rows.nodes[1], null, 'Antelope Freeway', 'Alice', 'Web Lab', 'December 29, 2016');
    assertRowContents(rows.nodes[2], CAT_IMAGE_URL, 'Cats and Kittens', 'Charlie', 'Web Lab', 'November 30, 2016');
    assertRowContents(rows.nodes[3], null, 'Dominoes', 'Bob', 'Game Lab', 'January 1, 2017');
    assertRowContents(rows.nodes[4], null, 'A1 Locksmith', 'Alice', 'App Lab', 'October 29, 2016');
  });

  it('shows the correct list of students in the student filter dropdown', () => {
    const options = root.find('option');
    expect(options).to.have.length(4);
    expect(options.nodes[0].innerText).to.equal('All students');
    expect(options.nodes[1].innerText).to.equal('Alice');
    expect(options.nodes[2].innerText).to.equal('Bob');
    expect(options.nodes[3].innerText).to.equal('Charlie');

    const select = root.find('select');
    expect(select.nodes[0].value).to.equal('_all_students');
  });

  it('filters projects when a student is selected from the dropdown', () => {
    const select = root.find('select');
    select.simulate('change', {target: {value: 'Alice'}});
    expect(select.nodes[0].value).to.equal('Alice');

    const rows = root.find('tr');
    expect(rows).to.have.length(3);
    assertRowContents(rows.nodes[0], null, 'Project Name', 'Student Name', 'Type', 'Last Edited');
    assertRowContents(rows.nodes[1], null, 'Antelope Freeway', 'Alice', 'Web Lab', 'December 29, 2016');
    assertRowContents(rows.nodes[2], null, 'A1 Locksmith', 'Alice', 'App Lab', 'October 29, 2016');
  });

  it('can filter by student and then sort by app type', () => {
    const select = root.find('select');
    select.simulate('change', {target: {value: 'Alice'}});
    expect(select.nodes[0].value).to.equal('Alice');

    const appTypeHeader = root.find('th').at(COLUMNS.APP_TYPE);
    expect(appTypeHeader.node.innerText).to.contain('Type');

    // Sort in ascending order by app type
    appTypeHeader.simulate('click');

    const rows = root.find('tr');
    expect(rows).to.have.length(3);
    assertRowContents(rows.nodes[0], null, 'Project Name', 'Student Name', 'Type', 'Last Edited');
    assertRowContents(rows.nodes[1], null, 'A1 Locksmith', 'Alice', 'App Lab', 'October 29, 2016');
    assertRowContents(rows.nodes[2], null, 'Antelope Freeway', 'Alice', 'Web Lab', 'December 29, 2016');
  });

  it('shows all students projects if the current students projects all disappear', () => {
    const select = root.find('select');
    select.simulate('change', {target: {value: 'Charlie'}});
    expect(select.nodes[0].value).to.equal('Charlie');

    let rows = root.find('tr');
    expect(rows).to.have.length(2);
    assertRowContents(rows.nodes[0], null, 'Project Name', 'Student Name', 'Type', 'Last Edited');
    assertRowContents(rows.nodes[1], CAT_IMAGE_URL, 'Cats and Kittens', 'Charlie', 'Web Lab', 'November 30, 2016');

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
    assertRowContents(rows.nodes[0], null, 'Project Name', 'Student Name', 'Type', 'Last Edited');
    assertRowContents(rows.nodes[1], null, 'Dominoes', 'Bob', 'Game Lab', 'January 1, 2017');
    assertRowContents(rows.nodes[2], null, 'Antelope Freeway', 'Alice', 'Web Lab', 'December 29, 2016');
    assertRowContents(rows.nodes[3], null, 'A1 Locksmith', 'Alice', 'App Lab', 'October 29, 2016');

    // Charlie should no longer appear in the dropdown
    const options = root.find('option');
    expect(options).to.have.length(3);
    expect(options.nodes[0].innerText).to.equal('All students');
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
