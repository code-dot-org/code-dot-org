/** @file Tests for tutorialExplorer.js */

import TutorialExplorer from '@cdo/apps/tutorialExplorer/tutorialExplorer';
import {
  orgNameCodeOrg,
  orgNameMinecraft,
} from '@cdo/apps/tutorialExplorer/util';

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

    expect(filtered.length).toEqual(tutorials.length - 1);
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

    expect(filtered.length).toEqual(4);
    expect(filtered[0].name).toEqual('tut3');
    expect(filtered[1].name).toEqual('tut2');
    expect(filtered[2].name).toEqual('tut4');
    expect(filtered[3].name).toEqual('tut1');
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

    expect(filtered.length).toEqual(1);
    expect(filtered[0].name).toEqual('tut2');
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

    expect(filtered.length).toEqual(1);
    expect(filtered[0].name).toEqual('tut5');
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

    expect(filtered.length).toEqual(2);
    expect(filtered[0].name).toEqual('tut5');
    expect(filtered[1].name).toEqual('tut6');
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

    expect(filtered.length).toEqual(2);
    expect(filtered[0].name).toEqual('tut3');
    expect(filtered[1].name).toEqual('tut1');
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

    expect(filtered.length).toEqual(3);
    expect(filtered[0].name).toEqual('tut3');
    expect(filtered[1].name).toEqual('tut4');
    expect(filtered[2].name).toEqual('tut1');
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

    expect(filtered.length).toEqual(3);
    expect(filtered[0].name).toEqual('tut4');
    expect(filtered[1].name).toEqual('tut1');
    expect(filtered[2].name).toEqual('tut3');
  });

  it('show only one language', function () {
    const props = {
      filters: {},
      locale: 'gr-gr',
      specificLocale: true,
      sortByFieldName: 'displayweight',
    };

    const filtered = TutorialExplorer.filterTutorials(tutorials, props);

    expect(filtered.length).toEqual(2);
    expect(filtered[0].name).toEqual('tut3');
    expect(filtered[1].name).toEqual('tut4');
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

    expect(filtered.length).toEqual(1);
    expect(filtered[0].name).toEqual('minecraft');
  });

  it('get unique orgnames', function () {
    const uniqueOrgNames =
      TutorialExplorer.getUniqueOrgNamesFromTutorials(tutorials);

    expect(uniqueOrgNames.length).toEqual(3);
    expect(uniqueOrgNames[0]).toEqual('code');
    expect(uniqueOrgNames[1]).toEqual('tech');
    expect(uniqueOrgNames[2]).toEqual(longOrgName);
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
    expect(filtered.length).toEqual(2);
    expect(filtered[0].name).toEqual('specific');
    expect(filtered[1].name).toEqual('special');

    props.searchTerm = 'specific';

    const filtered2 = TutorialExplorer.filterTutorials(
      tutorialsWithSpec,
      props
    );
    expect(filtered2.length).toEqual(1);
    expect(filtered2[0].name).toEqual('specific');

    props.searchTerm = 'dinosaur';

    const filtered3 = TutorialExplorer.filterTutorials(
      tutorialsWithSpec,
      props
    );
    expect(filtered3.length).toEqual(0);
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
    expect(filtered.length).toEqual(1);
    expect(filtered[0].name).toEqual('special');

    props.searchTerm = 'specific';

    const filtered2 = TutorialExplorer.filterTutorials(
      tutorialsWithSpec,
      props
    );
    expect(filtered2.length).toEqual(0);
  });
});
