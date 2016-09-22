/** @file Tests for tutorialSet.js */

var assert = require('assert');
import TutorialSet from '@cdo/apps/tutorialExplorer/tutorialSet';

describe("TutorialSet filterFn tests", function () {
  const tutorials = [
    {name: "tut1", languages_supported: null, tags_platform: "browser,ipad", tags_subject: "english,history"},
    {name: "tut2", languages_supported: "en,fr", tags_platform: "browser,ipad,mac", tags_subject: "english,history"},
    {name: "tut3", languages_supported: "en,fr,gr", tags_platform: "browser,ipad", tags_subject: "english,history"},
    {name: "tut4", languages_supported: "en,fr,gr-gr", tags_platform: "browser,ipad", tags_subject: "english,history"},
    {name: "tut5", languages_supported: "en,fr", tags_platform: "browser,ipad,iphone", tags_subject: "english,history,science"},
    {name: "tut6", languages_supported: "en,fr", tags_platform: "browser,ipad,iphone", tags_subject: "english,history"},
    {name: "tut7", languages_supported: "en,fr", tags_platform: "browser,ipad", tags_subject: "english,history,science"},
  ];

  it("no filter", function () {
    const props = {
      filters: {
      },
      locale: "en-us"
    };

    const filtered = TutorialSet.filterTutorials(tutorials, props);

    assert.equal(filtered.length, tutorials.length);
  });

  it("filter on platform", function () {
    const props = {
      filters: {
        platform: ["mac"]
      },
      locale: "en-us"
    };

    const filtered = TutorialSet.filterTutorials(tutorials, props);

    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].name, "tut2");
  });

  it("filter on platform and subject", function () {
    const props = {
      filters: {
        platform: ["iphone"],
        subject: ["science"]
      },
      locale: "en-us"
    };

    const filtered = TutorialSet.filterTutorials(tutorials, props);

    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].name, "tut5");
  });

  it("filter on subject and language", function () {
    const props = {
      filters: {
        subject: ["history"]
      },
      locale: "gr-gr"
    };

    const filtered = TutorialSet.filterTutorials(tutorials, props);

    assert.equal(filtered.length, 3);
    assert.equal(filtered[0].name, "tut1");
    assert.equal(filtered[1].name, "tut3");
    assert.equal(filtered[2].name, "tut4");
  });

  it("show only one language", function () {
    const props = {
      filters: {
      },
      locale: "gr-gr",
      specificLocale: true
    };

    const filtered = TutorialSet.filterTutorials(tutorials, props);

    assert.equal(filtered.length, 2);
    assert.equal(filtered[0].name, "tut3");
    assert.equal(filtered[1].name, "tut4");
  });

});
