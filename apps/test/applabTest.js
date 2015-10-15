var testUtils = require('./util/testUtils');
var assert = testUtils.assert;
testUtils.setupLocales('Applab');

var $ = require('jquery');
var React = require('react');
window.$ = $;
window.jQuery = window.$;
window.React = React;

// used in design mode
window.Applab = {
  appWidth: 320,
  appHeight: 480
};

var Applab = require('@cdo/apps/Applab/Applab');
var designMode = require('@cdo/apps/Applab/designMode');

describe('applab: designMode.addScreenIfNecessary', function () {
  it ('adds a screen if we dont have one', function () {
    var html =
      '<div xmlns="http://www.w3.org/1999/xhtml" id="designModeViz" tabindex="1" style="width: 320px; height: 480px;">' +
        '<button id="button1" style="padding: 0px; margin: 0px; height: 40px; width: 80px; font-size: 14px; color: rgb(0, 0, 0); position: absolute; left: 95px; top: 55px; background-color: rgb(238, 238, 238);" class="">Button</button>' +
        '<button id="button2" style="padding: 0px; margin: 0px; height: 40px; width: 80px; font-size: 14px; color: rgb(0, 0, 0); position: absolute; left: 100px; top: 160px; background-color: rgb(238, 238, 238);" class="">Button</button>' +
      '</div>';

    var converted = designMode.addScreenIfNecessary(html);
    var children = $(converted).children();
    assert.equal(children.length, 1);

    var screenObj = children.eq(0);
    assert.equal(screenObj.hasClass('screen'), true);
    assert.equal(screenObj.children().length, 2);
  });

  it('changes nothing if we already have a screen', function () {
    var html =
      '<div xmlns="http://www.w3.org/1999/xhtml" id="designModeViz" tabindex="1" style="width: 320px; height: 480px;">' +
        '<div class="screen" id="screen1" style="display: block; height: 480px; width: 320px; left: 0px; top: 0px; position: relative;">' +
          '<button id="button1" class="" style="padding: 0px; margin: 0px; height: 40px; width: 80px; font-size: 14px; color: rgb(0, 0, 0); position: absolute; left: 120px; top: 75px; background-color: rgb(238, 238, 238);">Button</button>' +
        '</div>' +
      '</div>';

    var converted = designMode.addScreenIfNecessary(html);
    assert.equal(converted, html);
  });

  it('succeeds if we have no startHtml', function () {
    var html = '';
    var converted = designMode.addScreenIfNecessary(html);
    assert.equal(converted, html);
  });
});

describe('applab: getIdDropdown filtering modes', function () {
  var documentRoot;

  beforeEach(function () {
    // Create a sample DOM to test against
    var sampleDom =
        '<div>' +
          '<div id="divApplab">' +
            '<div class="screen" id="screen1">' +
              '<div class="chart" id="chart9"></div>' +
              '<img src="" class="chart-friend" id="image1">' +
            '</div>' +
          '</div>' +
        '</div>';
    documentRoot = $(sampleDom);
  });

  it('produces all IDs when no filter is given', function () {
    assert.deepEqual(Applab.getIdDropdownFromDom_(documentRoot), [
      { "display": '"chart9"', "text": '"chart9"' },
      { "display": '"image1"', "text": '"image1"' },
      { "display": '"screen1"', "text": '"screen1"' }
    ]);
  });

  it('can filter on tag type', function () {
    assert.deepEqual(Applab.getIdDropdownFromDom_(documentRoot, 'div'), [
      { "display": '"chart9"', "text": '"chart9"' },
      { "display": '"screen1"', "text": '"screen1"' }
    ]);
    assert.deepEqual(Applab.getIdDropdownFromDom_(documentRoot, 'img'), [
      { "display": '"image1"', "text": '"image1"' }
    ]);
  });

  it('can filter on class', function () {
    assert.deepEqual(Applab.getIdDropdownFromDom_(documentRoot, '.chart'), [
      { "display": '"chart9"', "text": '"chart9"' }
    ]);
    assert.deepEqual(Applab.getIdDropdownFromDom_(documentRoot, '.screen'), [
      { "display": '"screen1"', "text": '"screen1"' }
    ]);
  });

  it('can filter on ID', function () {
    assert.deepEqual(Applab.getIdDropdownFromDom_(documentRoot, '#screen1'), [
      { "display": '"screen1"', "text": '"screen1"' }
    ]);
    assert.deepEqual(Applab.getIdDropdownFromDom_(documentRoot, '#chart9'), [
      { "display": '"chart9"', "text": '"chart9"' }
    ]);
    assert.deepEqual(Applab.getIdDropdownFromDom_(documentRoot, '#image1'), [
      { "display": '"image1"', "text": '"image1"' }
    ]);
  });

  it('does not accidentally pick up superset classes', function () {
    // Make sure searching for elements with class ".chart" does not also pick
    // up elements with class ".chart-friend"
    assert.deepEqual(Applab.getIdDropdownFromDom_(documentRoot, '.chart'), [
      { "display": '"chart9"', "text": '"chart9"' }
    ]);
    assert.deepEqual(Applab.getIdDropdownFromDom_(documentRoot, '.chart-friend'), [
      { "display": '"image1"', "text": '"image1"' }
    ]);
  });
});

describe('hasDataStoreAPIs', function () {
  it('returns true if we use createRecord', function () {
    var code = ['',
      'createRecord("mytable", {name:\'Alice\'}, function(record) {' +
      '  ',
      '});'
    ].join('\n');
    assert.strictEqual(Applab.hasDataStoreAPIs(code), true);
  });

  it('returns true if we use updateRecord', function () {
    var code = ['',
      'updateRecord("mytable", {name:\'Bob\'}, function(record) {' +
      '  ',
      '});'
    ].join('\n');
    assert.strictEqual(Applab.hasDataStoreAPIs(code), true);
  });

  it('returns false if we just read records', function () {
    var code = ['',
      'readRecords("mytable", {}, function(records) {',
      '  for (var i =0; i < records.length; i++) {',
      '    textLabel(\'id\', records[i].id + \': \' + records[i].name);',
      '  }',
      '});'
    ].join('\n');
    assert.strictEqual(Applab.hasDataStoreAPIs(code), false);
  });
});

describe('startSharedAppAfterWarnings', function () {
  var originalState = {};
  var mockedApplabItems = ['user', 'getCode', 'runButtonClick'];

  beforeEach(function () {
    localStorage.clear();
    mockedApplabItems.forEach(function (item) {
      originalState[item] = Applab[item];
    });
    originalState.dashboard = window.dashboard;

    window.dashboard = {
      project: {
        getCurrentId: function () { return 'current_channel'; }
      }
    };

    Applab.user = {};
    Applab.getCode = function () {
      return 'createRecord'; // use data API
    };
    Applab.runButtonClick = function () {};
  });

  afterEach(function () {
    mockedApplabItems.forEach(function (item) {
      Applab[item] = originalState[item];
    });
    window.dashboard = originalState.dashboard;
  });

  describe('is13plus', function () {
    it('is true if user is signed in', function () {
      Applab.user = { isSignedIn: true };
      var component = Applab.startSharedAppAfterWarnings();
      assert.equal(component.props.is13Plus, true);
    });

    it('is true if user is not signed in but has local storage set', function () {
      Applab.user = { isSignedIn: false };
      localStorage.setItem('is13Plus', 'true');
      var component = Applab.startSharedAppAfterWarnings();
      assert.equal(component.props.is13Plus, true);
    });

    it('is false if user is not signed in and has no local storage set', function () {
      Applab.user = { isSignedIn: false };
      var component = Applab.startSharedAppAfterWarnings();
      assert.equal(component.props.is13Plus, false);
    });
  });

  describe('showStoreDataAlert', function () {
    it('is true if user has viewed no channels', function () {
      var component = Applab.startSharedAppAfterWarnings();
      assert.equal(component.props.showStoreDataAlert, true);
    });

    it('is true if user has viewed only other channels', function () {
      localStorage.setItem('dataAlerts', JSON.stringify(['other_channel']));
      var component = Applab.startSharedAppAfterWarnings();
      assert.equal(component.props.showStoreDataAlert, true);
    });

    it('is false if user has viewed this channel', function () {
      localStorage.setItem('dataAlerts', JSON.stringify(['other_channel', 'current_channel']));
      var component = Applab.startSharedAppAfterWarnings();
      assert.equal(component.props.showStoreDataAlert, false);
    });

    it('is false if code has no data storage APIs', function () {
      Applab.getCode = function () {
        return 'asdf';
      };
      var component = Applab.startSharedAppAfterWarnings();
      assert.equal(component.props.showStoreDataAlert, false);
    });
  });

  it('sets is13Plus to true on close', function () {
    var component = Applab.startSharedAppAfterWarnings();
    component.props.handleClose();
    assert.strictEqual(localStorage.getItem('is13Plus'), 'true');
  });

  it('sets is13Plus to false on too young', function () {
    var component = Applab.startSharedAppAfterWarnings();
    component.props.handleTooYoung();
    assert.strictEqual(localStorage.getItem('is13Plus'), 'false');
  });

  it('adds our channelId on close', function () {
    localStorage.setItem('dataAlerts', JSON.stringify(['other_channel']));
    var component = Applab.startSharedAppAfterWarnings();
    component.props.handleClose();
    assert.strictEqual(localStorage.getItem('dataAlerts'),
      JSON.stringify(['other_channel', 'current_channel']));
  });
});
