import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {
  COLUMNS,
  COLUMNS_WITHOUT_THUMBNAILS,
} from '@cdo/apps/templates/projects/ProjectsList';
import SectionProjectsList from '@cdo/apps/templates/projects/SectionProjectsList';

const CAT_IMAGE_URL = '/base/static/common_images/stickers/cat.png';

const STUB_PROJECTS_DATA = [
  {
    channel: 'ABCDEFGHIJKLM01234',
    name: 'Antelope Freeway',
    studentName: 'Alice',
    type: 'weblab',
    updatedAt: '2016-12-29T11:00:00-00:00',
  },
  {
    channel: 'AAAABBBBCCCCDDDDEE',
    name: 'Cats and Kittens',
    studentName: 'Charlie',
    thumbnailUrl: CAT_IMAGE_URL,
    type: 'weblab',
    updatedAt: '2016-11-30T11:00:00-00:00',
  },
  {
    channel: 'NOPQRSTUVWXYZ567879',
    name: 'Dominoes',
    studentName: 'Bob',
    type: 'gamelab',
    updatedAt: '2017-01-01T11:00:00-00:00',
  },
  {
    channel: 'VVVVWWWWXXXXYYYYZZ',
    name: 'A1 Locksmith',
    studentName: 'Alice',
    type: 'applab',
    updatedAt: '2016-10-29T11:00:00-00:00',
  },
];

const STUDIO_URL_PREFIX = '//foo-studio.code.org';

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
        expect(date.getUTCHours()).toBe(11);
      }
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
    expect(rows).toHaveLength(5);

    assertRowContentsWithoutThumbnail(
      getNode(rows, 0),
      'Project Name',
      'Student Name',
      'Type',
      'Last Edited'
    );
    assertRowContentsWithoutThumbnail(
      getNode(rows, 1),
      'Dominoes',
      'Bob',
      'Game Lab',
      'January 1, 2017'
    );
    assertRowContentsWithoutThumbnail(
      getNode(rows, 2),
      'Antelope Freeway',
      'Alice',
      'Web Lab',
      'December 29, 2016'
    );
    assertRowContentsWithoutThumbnail(
      getNode(rows, 3),
      'Cats and Kittens',
      'Charlie',
      'Web Lab',
      'November 30, 2016'
    );
    assertRowContentsWithoutThumbnail(
      getNode(rows, 4),
      'A1 Locksmith',
      'Alice',
      'App Lab',
      'October 29, 2016'
    );
  });

  it('initially shows all projects, most recently edited first', () => {
    let rows = root.find('tr');
    expect(rows).toHaveLength(5);
    assertRowContents(
      getNode(rows, 0),
      null,
      'Project Name',
      'Student Name',
      'Type',
      'Last Edited'
    );
    assertRowContents(
      getNode(rows, 1),
      null,
      'Dominoes',
      'Bob',
      'Game Lab',
      'January 1, 2017'
    );
    assertRowContents(
      getNode(rows, 2),
      null,
      'Antelope Freeway',
      'Alice',
      'Web Lab',
      'December 29, 2016'
    );
    assertRowContents(
      getNode(rows, 3),
      CAT_IMAGE_URL,
      'Cats and Kittens',
      'Charlie',
      'Web Lab',
      'November 30, 2016'
    );
    assertRowContents(
      getNode(rows, 4),
      null,
      'A1 Locksmith',
      'Alice',
      'App Lab',
      'October 29, 2016'
    );

    const lastEditedHeader = root.find('th').at(COLUMNS.LAST_EDITED);
    expect(getNode(lastEditedHeader).textContent).toContain('Last Edited');

    // Show least recently edited first
    lastEditedHeader.simulate('click');

    rows = root.find('tr');
    expect(rows).toHaveLength(5);
    assertRowContents(
      getNode(rows, 0),
      null,
      'Project Name',
      'Student Name',
      'Type',
      'Last Edited'
    );
    assertRowContents(
      getNode(rows, 1),
      null,
      'A1 Locksmith',
      'Alice',
      'App Lab',
      'October 29, 2016'
    );
    assertRowContents(
      getNode(rows, 2),
      CAT_IMAGE_URL,
      'Cats and Kittens',
      'Charlie',
      'Web Lab',
      'November 30, 2016'
    );
    assertRowContents(
      getNode(rows, 3),
      null,
      'Antelope Freeway',
      'Alice',
      'Web Lab',
      'December 29, 2016'
    );
    assertRowContents(
      getNode(rows, 4),
      null,
      'Dominoes',
      'Bob',
      'Game Lab',
      'January 1, 2017'
    );
  });

  it('can be sorted by project name', () => {
    const projectNameHeader = root.find('th').at(COLUMNS.PROJECT_NAME);
    expect(getNode(projectNameHeader).textContent).toContain('Project Name');

    // Sort in ascending order by project name
    projectNameHeader.simulate('click');

    let rows = root.find('tr');
    expect(rows).toHaveLength(5);
    assertRowContents(
      getNode(rows, 0),
      null,
      'Project Name',
      'Student Name',
      'Type',
      'Last Edited'
    );
    assertRowContents(
      getNode(rows, 1),
      null,
      'A1 Locksmith',
      'Alice',
      'App Lab',
      'October 29, 2016'
    );
    assertRowContents(
      getNode(rows, 2),
      null,
      'Antelope Freeway',
      'Alice',
      'Web Lab',
      'December 29, 2016'
    );
    assertRowContents(
      getNode(rows, 3),
      CAT_IMAGE_URL,
      'Cats and Kittens',
      'Charlie',
      'Web Lab',
      'November 30, 2016'
    );
    assertRowContents(
      getNode(rows, 4),
      null,
      'Dominoes',
      'Bob',
      'Game Lab',
      'January 1, 2017'
    );

    // Sort in descending order by project name
    projectNameHeader.simulate('click');

    rows = root.find('tr');
    expect(rows).toHaveLength(5);
    assertRowContents(
      getNode(rows, 0),
      null,
      'Project Name',
      'Student Name',
      'Type',
      'Last Edited'
    );
    assertRowContents(
      getNode(rows, 1),
      null,
      'Dominoes',
      'Bob',
      'Game Lab',
      'January 1, 2017'
    );
    assertRowContents(
      getNode(rows, 2),
      CAT_IMAGE_URL,
      'Cats and Kittens',
      'Charlie',
      'Web Lab',
      'November 30, 2016'
    );
    assertRowContents(
      getNode(rows, 3),
      null,
      'Antelope Freeway',
      'Alice',
      'Web Lab',
      'December 29, 2016'
    );
    assertRowContents(
      getNode(rows, 4),
      null,
      'A1 Locksmith',
      'Alice',
      'App Lab',
      'October 29, 2016'
    );
  });

  it('can be sorted by student name', () => {
    const projectNameHeader = root.find('th').at(COLUMNS.STUDENT_NAME);
    expect(getNode(projectNameHeader).textContent).toContain('Student Name');

    // Sort in ascending order by student name
    projectNameHeader.simulate('click');

    let rows = root.find('tr');
    expect(rows).toHaveLength(5);
    assertRowContents(
      getNode(rows, 0),
      null,
      'Project Name',
      'Student Name',
      'Type',
      'Last Edited'
    );
    assertRowContents(
      getNode(rows, 1),
      null,
      'Antelope Freeway',
      'Alice',
      'Web Lab',
      'December 29, 2016'
    );
    assertRowContents(
      getNode(rows, 2),
      null,
      'A1 Locksmith',
      'Alice',
      'App Lab',
      'October 29, 2016'
    );
    assertRowContents(
      getNode(rows, 3),
      null,
      'Dominoes',
      'Bob',
      'Game Lab',
      'January 1, 2017'
    );
    assertRowContents(
      getNode(rows, 4),
      CAT_IMAGE_URL,
      'Cats and Kittens',
      'Charlie',
      'Web Lab',
      'November 30, 2016'
    );

    // Sort in descending order by student name
    projectNameHeader.simulate('click');

    rows = root.find('tr');
    expect(rows).toHaveLength(5);
    assertRowContents(
      getNode(rows, 0),
      null,
      'Project Name',
      'Student Name',
      'Type',
      'Last Edited'
    );
    assertRowContents(
      getNode(rows, 1),
      CAT_IMAGE_URL,
      'Cats and Kittens',
      'Charlie',
      'Web Lab',
      'November 30, 2016'
    );
    assertRowContents(
      getNode(rows, 2),
      null,
      'Dominoes',
      'Bob',
      'Game Lab',
      'January 1, 2017'
    );
    // There is no secondary sort key. When the sort by name is reversed, elements with the same
    // primary sort key do not change in order relative to each other.
    assertRowContents(
      getNode(rows, 3),
      null,
      'Antelope Freeway',
      'Alice',
      'Web Lab',
      'December 29, 2016'
    );
    assertRowContents(
      getNode(rows, 4),
      null,
      'A1 Locksmith',
      'Alice',
      'App Lab',
      'October 29, 2016'
    );
  });

  it('can be sorted by app type', () => {
    const appTypeHeader = root.find('th').at(COLUMNS.APP_TYPE);
    expect(getNode(appTypeHeader).textContent).toContain('Type');

    // Sort in ascending order by app type
    appTypeHeader.simulate('click');

    let rows = root.find('tr');
    expect(rows).toHaveLength(5);
    assertRowContents(
      getNode(rows, 0),
      null,
      'Project Name',
      'Student Name',
      'Type',
      'Last Edited'
    );
    assertRowContents(
      getNode(rows, 1),
      null,
      'A1 Locksmith',
      'Alice',
      'App Lab',
      'October 29, 2016'
    );
    assertRowContents(
      getNode(rows, 2),
      null,
      'Dominoes',
      'Bob',
      'Game Lab',
      'January 1, 2017'
    );
    assertRowContents(
      getNode(rows, 3),
      null,
      'Antelope Freeway',
      'Alice',
      'Web Lab',
      'December 29, 2016'
    );
    assertRowContents(
      getNode(rows, 4),
      CAT_IMAGE_URL,
      'Cats and Kittens',
      'Charlie',
      'Web Lab',
      'November 30, 2016'
    );

    // Sort in descending order by student name
    appTypeHeader.simulate('click');

    rows = root.find('tr');
    expect(rows).toHaveLength(5);
    assertRowContents(
      getNode(rows, 0),
      null,
      'Project Name',
      'Student Name',
      'Type',
      'Last Edited'
    );
    // There is no secondary sort key. When the sort by name is reversed, elements with the same
    // primary sort key do not change in order relative to each other.
    assertRowContents(
      getNode(rows, 1),
      null,
      'Antelope Freeway',
      'Alice',
      'Web Lab',
      'December 29, 2016'
    );
    assertRowContents(
      getNode(rows, 2),
      CAT_IMAGE_URL,
      'Cats and Kittens',
      'Charlie',
      'Web Lab',
      'November 30, 2016'
    );
    assertRowContents(
      getNode(rows, 3),
      null,
      'Dominoes',
      'Bob',
      'Game Lab',
      'January 1, 2017'
    );
    assertRowContents(
      getNode(rows, 4),
      null,
      'A1 Locksmith',
      'Alice',
      'App Lab',
      'October 29, 2016'
    );
  });

  it('shows the correct list of students in the student filter dropdown', () => {
    const options = root.find('option');
    expect(options).toHaveLength(4);
    expect(getNode(options, 0).textContent).toBe('All students');
    expect(getNode(options, 1).textContent).toBe('Alice');
    expect(getNode(options, 2).textContent).toBe('Bob');
    expect(getNode(options, 3).textContent).toBe('Charlie');

    const select = root.find('select');
    expect(getNode(select).value).toBe('_all_students');
  });

  it('filters projects when a student is selected from the dropdown', () => {
    const select = root.find('select');
    select.simulate('change', {target: {value: 'Alice'}});
    expect(getNode(select).value).toBe('Alice');

    const rows = root.find('tr');
    expect(rows).toHaveLength(3);
    assertRowContents(
      getNode(rows, 0),
      null,
      'Project Name',
      'Student Name',
      'Type',
      'Last Edited'
    );
    assertRowContents(
      getNode(rows, 1),
      null,
      'Antelope Freeway',
      'Alice',
      'Web Lab',
      'December 29, 2016'
    );
    assertRowContents(
      getNode(rows, 2),
      null,
      'A1 Locksmith',
      'Alice',
      'App Lab',
      'October 29, 2016'
    );
  });

  it('can filter by student and then sort by app type', () => {
    const select = root.find('select');
    select.simulate('change', {target: {value: 'Alice'}});
    expect(getNode(select).value).toBe('Alice');

    const appTypeHeader = root.find('th').at(COLUMNS.APP_TYPE);
    expect(getNode(appTypeHeader).textContent).toContain('Type');

    // Sort in ascending order by app type
    appTypeHeader.simulate('click');

    const rows = root.find('tr');
    expect(rows).toHaveLength(3);
    assertRowContents(
      getNode(rows, 0),
      null,
      'Project Name',
      'Student Name',
      'Type',
      'Last Edited'
    );
    assertRowContents(
      getNode(rows, 1),
      null,
      'A1 Locksmith',
      'Alice',
      'App Lab',
      'October 29, 2016'
    );
    assertRowContents(
      getNode(rows, 2),
      null,
      'Antelope Freeway',
      'Alice',
      'Web Lab',
      'December 29, 2016'
    );
  });

  it('shows all students projects if the current students projects all disappear', () => {
    const select = root.find('select');
    select.simulate('change', {target: {value: 'Charlie'}});
    expect(getNode(select).value).toBe('Charlie');

    let rows = root.find('tr');
    expect(rows).toHaveLength(2);
    assertRowContents(
      getNode(rows, 0),
      null,
      'Project Name',
      'Student Name',
      'Type',
      'Last Edited'
    );
    assertRowContents(
      getNode(rows, 1),
      CAT_IMAGE_URL,
      'Cats and Kittens',
      'Charlie',
      'Web Lab',
      'November 30, 2016'
    );

    // Remove Charlie's project from the list
    const newProjectsData = Array.from(STUB_PROJECTS_DATA);
    const charlieProjectIndex = newProjectsData.findIndex(
      project => project.studentName === 'Charlie'
    );
    newProjectsData.splice(charlieProjectIndex, 1);
    root.setProps({projectsData: newProjectsData});

    // We should now see all students projects, except Charlie's
    rows = root.find('tr');
    expect(getNode(select).value).toBe('_all_students');
    expect(rows).toHaveLength(4);
    assertRowContents(
      getNode(rows, 0),
      null,
      'Project Name',
      'Student Name',
      'Type',
      'Last Edited'
    );
    assertRowContents(
      getNode(rows, 1),
      null,
      'Dominoes',
      'Bob',
      'Game Lab',
      'January 1, 2017'
    );
    assertRowContents(
      getNode(rows, 2),
      null,
      'Antelope Freeway',
      'Alice',
      'Web Lab',
      'December 29, 2016'
    );
    assertRowContents(
      getNode(rows, 3),
      null,
      'A1 Locksmith',
      'Alice',
      'App Lab',
      'October 29, 2016'
    );

    // Charlie should no longer appear in the dropdown
    const options = root.find('option');
    expect(options).toHaveLength(3);
    expect(getNode(options, 0).textContent).toBe('All students');
    expect(getNode(options, 1).textContent).toBe('Alice');
    expect(getNode(options, 2).textContent).toBe('Bob');
  });

  describe('getStudentNames', () => {
    it('shows students in alphabetical order and without duplicates', () => {
      expect(SectionProjectsList.getStudentNames(STUB_PROJECTS_DATA)).toEqual([
        'Alice',
        'Bob',
        'Charlie',
      ]);
    });
  });

  /**
   * @param {HTMLTableRowElement} rowElement HTML row element in the projects list table
   * @param {string} projectName Expected project name
   * @param {string} studentName Expected student name
   * @param {string} appType Expected app type (App Lab, Game Lab, etc)
   * @param {string} lastEdited Expected last edited date (Month DD, YYYY). Note that this
   *   format is used only in unit tests due to incorrect date formatting in PhantomJS.
   *   The desired date format which we will show in all browsers is MM/DD/YYYY.
   */
  function assertRowContents(
    rowElement,
    thumbnailUrl,
    projectName,
    studentName,
    appType,
    lastEdited
  ) {
    assertRowThumbnail(rowElement, thumbnailUrl);
    assertRowContentsWithoutThumbnail(
      rowElement,
      projectName,
      studentName,
      appType,
      lastEdited,
      COLUMNS
    );
  }

  /**
   * @param {HTMLTableRowElement} rowElement HTML row element in the projects list table
   * @param {string} projectName Expected project name
   * @param {string} studentName Expected student name
   * @param {string} appType Expected app type (App Lab, Game Lab, etc)
   * @param {string} lastEdited Expected last edited date (Month DD, YYYY). Note that this
   *   format is used only in unit tests due to incorrect date formatting in PhantomJS.
   *   The desired date format which we will show in all browsers is MM/DD/YYYY.
   * @param {object} [columnMap] Optional custom column map to use when comparing expected
   *   and actual values.
   */
  function assertRowContentsWithoutThumbnail(
    rowElement,
    projectName,
    studentName,
    appType,
    lastEdited,
    columnMap = COLUMNS_WITHOUT_THUMBNAILS
  ) {
    const projectNameActual =
      rowElement.childNodes[columnMap.PROJECT_NAME].textContent;
    const studentNameActual =
      rowElement.childNodes[columnMap.STUDENT_NAME].textContent;
    const appTypeActual = rowElement.childNodes[columnMap.APP_TYPE].textContent;
    const lastEditedActual =
      rowElement.childNodes[columnMap.LAST_EDITED].textContent;

    expect(projectNameActual).toBe(projectName);
    expect(studentNameActual).toBe(studentName);
    expect(appTypeActual).toBe(appType);
    assertDatesMatch(lastEdited, lastEditedActual);
  }

  function assertDatesMatch(expected, actual) {
    if (isNaN(Date.parse(expected))) {
      // If we're checking against non-date text (a header) just do an equality check
      expect(actual).toBe(expected);
    } else {
      // Otherwise convert our 'expected' value to a locale string, so tests are not
      // browser-implementation-dependent
      expect(actual).toBe(new Date(expected).toLocaleDateString());
    }
  }

  function assertRowThumbnail(rowElement, thumbnailUrl) {
    const td = rowElement.childNodes[COLUMNS.THUMBNAIL];
    const img = td.querySelector('img');
    const src = img && img.getAttribute('src');
    expect(src).toBe(thumbnailUrl);
  }

  /**
   * Get a particular DOM node out of a react wrapper in a way that's
   * both compatible with Enzyme 2.x and 3.x.
   */
  function getNode(wrapper, index = 0) {
    return wrapper.at(index).getDOMNode();
  }
});
