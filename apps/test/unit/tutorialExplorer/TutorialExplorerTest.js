/** @file Tests for tutorialExplorer.js */

import TutorialExplorer from '@cdo/apps/tutorialExplorer/tutorialExplorer';
import {
  orgNameCodeOrg,
  orgNameMinecraft,
} from '@cdo/apps/tutorialExplorer/util';

var assert = require('assert');

describe('TutorialExplorer filterTutorials tests', function () {
  const longOrgName = 'them-012345678901234567890123456789';
  const tutorials = [
    {
      name: 'tut1',
      orgname: 'code',
      tags: '',
      languages_supported: null,
      tags_platform: 'browser,ipad',
      tags_subject: 'english,history',
      tags_activity_type: '',
      displayweight: 2,
      popularityrank: 2,
    },
    {
      name: 'tut2',
      orgname: 'code',
      tags: '',
      languages_supported: 'en,fr',
      tags_platform: 'browser,ipad,mac',
      tags_subject: 'english,history',
      tags_activity_type: '',
      displayweight: 5,
      popularityrank: 3,
    },
    {
      name: 'tut3',
      orgname: 'code',
      tags: '',
      languages_supported: 'en,fr,gr',
      tags_platform: 'browser,ipad',
      tags_subject: 'english,history',
      tags_activity_type: '',
      displayweight: 9,
      popularityrank: 4,
    },
    {
      name: 'tut4',
      orgname: 'code',
      tags: '',
      languages_supported: 'en,fr,gr-gr',
      tags_platform: 'browser,ipad,android',
      tags_subject: 'english,history',
      displayweight: 5,
      popularityrank: 1,
    },
    {
      name: 'tut5',
      orgname: longOrgName,
      tags: '',
      languages_supported: 'en,fr',
      tags_platform: 'browser,ipad,iphone',
      tags_subject: 'english,history,science',
      tags_activity_type: '',
      displayweight: 5,
      popularityrank: 5,
    },
    {
      name: 'tut6',
      orgname: longOrgName,
      tags: '',
      languages_supported: 'en,fr',
      tags_platform: 'browser,ipad,iphone',
      tags_subject: 'english,history',
      tags_activity_type: '',
      displayweight: 5,
      popularityrank: 6,
    },
    {
      name: 'tut7',
      orgname: longOrgName,
      tags: '',
      languages_supported: 'en,fr',
      tags_platform: 'browser,ipad',
      tags_subject: 'english,history,science',
      displayweight: 5,
      popularityrank: 7,
    },
    {
      name: 'tut8',
      orgname: longOrgName,
      tags: 'do-not-show',
      languages_supported: 'en,fr',
      tags_platform: 'browser,ipad',
      tags_subject: 'english,history,science',
      tags_activity_type: '',
      displayweight: 5,
      popularityrank: 8,
    },
    {
      name: 'tut9',
      orgname: 'tech',
      tags: '',
      languages_supported: 'en,fr',
      tags_platform: 'browser,ipad',
      tags_subject: '',
      displayweight: 5,
      popularityrank: 9,
    },
  ];
  const specTutorials = [
    {
      name: 'specific',
      orgname: 'tech',
      tags: '',
      languages_supported: 'en',
      tags_platform: 'browser,ipad',
      tags_subject: 'art',
      tags_activity_type: '',
      displayweight: 5,
      popularityrank: 9,
    },
    {
      name: 'special',
      orgname: 'code',
      tags: '',
      languages_supported: 'en',
      tags_platform: 'browser,ipad',
      tags_subject: 'math',
      tags_activity_type: '',
      displayweight: 5,
      popularityrank: 10,
    },
  ];
  const tutorialsWithSpec = tutorials.concat(specTutorials);

  it('no filter, but do-not-show works', function () {
    const props = {
      filters: {},
      locale: 'en-us',
      sortBy: 'displayweight',
      orgname: 'all',
      sortByFieldName: 'displayweight',
    };

    const filtered = TutorialExplorer.filterTutorials(tutorials, props);

    assert.equal(filtered.length, tutorials.length - 1);
  });

  it('no filter, but do-not-show and orgname work', function () {
    const props = {
      filters: {},
      locale: 'en-us',
      sortBy: 'displayweight',
      orgName: 'code',
      sortByFieldName: 'displayweight',
    };

    const filtered = TutorialExplorer.filterTutorials(tutorials, props);

    assert.equal(filtered.length, 4);
    assert.equal(filtered[0].name, 'tut3');
    assert.equal(filtered[1].name, 'tut2');
    assert.equal(filtered[2].name, 'tut4');
    assert.equal(filtered[3].name, 'tut1');
  });

  it('filter on platform', function () {
    const props = {
      filters: {
        platform: ['mac'],
      },
      locale: 'en-us',
      sortByFieldName: 'displayweight',
    };

    const filtered = TutorialExplorer.filterTutorials(tutorials, props);

    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].name, 'tut2');
  });

  it('filter on platform and subject', function () {
    const props = {
      filters: {
        platform: ['iphone'],
        subject: ['science'],
      },
      locale: 'en-us',
      sortByFieldName: 'displayweight',
    };

    const filtered = TutorialExplorer.filterTutorials(tutorials, props);

    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].name, 'tut5');
  });

  it('filter on platform, no locale provided', function () {
    const props = {
      filters: {
        platform: ['iphone'],
      },
      locale: null,
      sortByFieldName: 'displayweight',
    };

    const filtered = TutorialExplorer.filterTutorials(tutorials, props);

    assert.equal(filtered.length, 2);
    assert.equal(filtered[0].name, 'tut5');
    assert.equal(filtered[1].name, 'tut6');
  });

  it('filter on subject and language, use hideFilters', function () {
    const props = {
      filters: {
        subject: ['history'],
      },
      hideFilters: {
        platform: ['android'],
      },
      locale: 'gr-gr',
      sortByFieldName: 'displayweight',
    };

    const filtered = TutorialExplorer.filterTutorials(tutorials, props);

    assert.equal(filtered.length, 2);
    assert.equal(filtered[0].name, 'tut3');
    assert.equal(filtered[1].name, 'tut1');
  });

  it('filter on subject and language, sort by displayweight', function () {
    const props = {
      filters: {
        subject: ['history'],
      },
      locale: 'gr-gr',
      sortByFieldName: 'displayweight',
    };

    const filtered = TutorialExplorer.filterTutorials(tutorials, props);

    assert.equal(filtered.length, 3);
    assert.equal(filtered[0].name, 'tut3');
    assert.equal(filtered[1].name, 'tut4');
    assert.equal(filtered[2].name, 'tut1');
  });

  it('filter on subject and language, sort by popularityrank', function () {
    const props = {
      filters: {
        subject: ['history'],
      },
      locale: 'gr-gr',
      sortByFieldName: 'popularityrank',
    };

    const filtered = TutorialExplorer.filterTutorials(tutorials, props);

    assert.equal(filtered.length, 3);
    assert.equal(filtered[0].name, 'tut4');
    assert.equal(filtered[1].name, 'tut1');
    assert.equal(filtered[2].name, 'tut3');
  });

  it('show only one language', function () {
    const props = {
      filters: {},
      locale: 'gr-gr',
      specificLocale: true,
      sortByFieldName: 'displayweight',
    };

    const filtered = TutorialExplorer.filterTutorials(tutorials, props);

    assert.equal(filtered.length, 2);
    assert.equal(filtered[0].name, 'tut3');
    assert.equal(filtered[1].name, 'tut4');
  });

  it('shows Minecraft as Codeorg tutorial', function () {
    const tutorialsWithMinecraft = tutorials.concat([
      {
        name: 'minecraft',
        orgname: orgNameMinecraft,
        tags: '',
        languages_supported: 'en,fr',
        tags_platform: 'browser,ipad',
        tags_subject: '',
        displayweight: 5,
        popularityrank: 9,
      },
    ]);

    const props = {
      filters: {},
      orgName: orgNameCodeOrg,
      locale: 'en-us',
      sortByFieldName: 'displayweight',
    };

    const filtered = TutorialExplorer.filterTutorials(
      tutorialsWithMinecraft,
      props
    );

    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].name, 'minecraft');
  });

  it('get unique orgnames', function () {
    const uniqueOrgNames =
      TutorialExplorer.getUniqueOrgNamesFromTutorials(tutorials);

    assert.equal(uniqueOrgNames.length, 3);
    assert.equal(uniqueOrgNames[0], 'code');
    assert.equal(uniqueOrgNames[1], 'tech');
    assert.equal(uniqueOrgNames[2], longOrgName);
  });

  it('get tutorials by search term', function () {
    const props = {
      filters: {},
      locale: 'en-us',
      sortBy: 'displayweight',
      orgname: 'all',
      sortByFieldName: 'displayweight',
      searchTerm: 'spec',
    };

    const filtered = TutorialExplorer.filterTutorials(tutorialsWithSpec, props);
    assert.equal(filtered.length, 2);
    assert.equal(filtered[0].name, 'specific');
    assert.equal(filtered[1].name, 'special');

    props.searchTerm = 'specific';

    const filtered2 = TutorialExplorer.filterTutorials(
      tutorialsWithSpec,
      props
    );
    assert.equal(filtered2.length, 1);
    assert.equal(filtered2[0].name, 'specific');

    props.searchTerm = 'dinosaur';

    const filtered3 = TutorialExplorer.filterTutorials(
      tutorialsWithSpec,
      props
    );
    assert.equal(filtered3.length, 0);
  });

  it('get tutorials by search term and subject filter', function () {
    const props = {
      filters: {
        subject: ['math'],
      },
      locale: 'en-us',
      sortBy: 'displayweight',
      orgname: 'code',
      sortByFieldName: 'displayweight',
      searchTerm: 'spec',
    };

    const filtered = TutorialExplorer.filterTutorials(tutorialsWithSpec, props);
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].name, 'special');

    props.searchTerm = 'specific';

    const filtered2 = TutorialExplorer.filterTutorials(
      tutorialsWithSpec,
      props
    );
    assert.equal(filtered2.length, 0);
  });
});
