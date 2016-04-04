var testUtils = require('./util/testUtils');
var assert = testUtils.assert;
testUtils.setupLocales('applab');
testUtils.setExternalGlobals();

// used in design mode
window.Applab = {
  appWidth: 320,
  appHeight: 480
};

var Applab = require('@cdo/apps/applab/applab');
var RecordListener = require('@cdo/apps/applab/RecordListener');
var designMode = require('@cdo/apps/applab/designMode');
var applabCommands = require('@cdo/apps/applab/commands');
var constants = require('@cdo/apps/applab/constants');

function setupVizDom() {
  // Create a sample DOM to test against
  var sampleDom =
    '<div>' +
      '<div id="designModeViz">' +
        '<div class="screen" id="' + constants.DESIGN_ELEMENT_ID_PREFIX + 'screen1">' +
          '<div class="chart" id="' + constants.DESIGN_ELEMENT_ID_PREFIX + 'chart9"></div>' +
          '<img src="" class="chart-friend" id="' + constants.DESIGN_ELEMENT_ID_PREFIX + 'image1">' +
        '</div>' +
      '</div>' +
    '</div>';
  return $(sampleDom);
}

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
          '<button id="button1" style="padding: 0px; margin: 0px; height: 40px; width: 80px; font-size: 14px; color: rgb(0, 0, 0); position: absolute; left: 120px; top: 75px; background-color: rgb(238, 238, 238);">Button</button>' +
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
    documentRoot = setupVizDom();
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

describe('applab: getIdDropdownForCurrentScreen ordering', function () {
  var documentRoot;

  beforeEach(function () {
    documentRoot = setupVizDom();
  });

  it('returns the correct ordering', function () {
    assert.deepEqual(Applab.getIdDropdownForCurrentScreenFromDom_(documentRoot), [
      'screen1', 'chart9', 'image1'
    ]);
  });
});

describe('getText/setText commands', function () {
  describe('simplified innerText emulation', function () {
    var getInnerText = applabCommands.getElementInnerText_;
    var setInnerText = applabCommands.setElementInnerText_;
    var element;

    beforeEach(function () {
      element = document.createElement('div');
      element.setAttribute("contentEditable", true);
    });

    describe('getter', function () {
      it('reads plain text as-is', function () {
        element.innerHTML = 'plain text';
        assert.equal(getInnerText(element), 'plain text');
      });

      it('converts nonbreaking spaces to plain spaces', function () {
        element.innerHTML = 'text with &nbsp;lots &nbsp; of &nbsp; &nbsp;whitespace';
        assert.equal(getInnerText(element), 'text with  lots   of    whitespace');

        element.innerHTML = 'consecutive&nbsp;&nbsp;&nbsp;&nbsp;nonbreaking spaces';
        assert.equal(getInnerText(element), 'consecutive    nonbreaking spaces');
      });

      it('converts divs to newlines', function () {
        element.innerHTML = 'text<div>with</div><div>newlines</div>';
        assert.equal(getInnerText(element), 'text\nwith\nnewlines');
      });

      it('converts <div><br></div> to blank lines', function () {
        element.innerHTML = 'text<div><br></div><div>with</div><div><br></div><div><br></div><div>empty newlines</div>';
        assert.equal(getInnerText(element), 'text\n\nwith\n\n\nempty newlines');
      });

      it('does not add leading newline for leading nonempty div', function () {
        element.innerHTML = '<div>text</div><div>with</div><div>leading div</div>';
        assert.equal(getInnerText(element), 'text\nwith\nleading div');
      });

      it('does add leading newline for leading empty div', function () {
        element.innerHTML = '<div><br></div><div>text</div><div>with</div><div>leading empty div</div>';
        assert.equal(getInnerText(element), '\ntext\nwith\nleading empty div');
      });

      it('Unescapes < and >', function () {
        element.innerHTML = 'text with &lt;b&gt;markup&lt;/b&gt;';
        assert.equal(getInnerText(element), 'text with <b>markup</b>');
      });

      it('Unescapes &', function () {
        element.innerHTML = 'text with&amp;nbsp;HTML &amp;lt;escapes&amp;gt;';
        assert.equal(getInnerText(element), 'text with&nbsp;HTML &lt;escapes&gt;');
      });
    });

    describe('setter', function () {
      it('sets plain text as-is', function () {
        setInnerText(element, 'plain text');
        assert.equal(element.innerHTML, 'plain text');
      });

      it('adds nonbreaking spaces for extra whitespace', function () {
        setInnerText(element, 'text with  lots   of    whitespace');
        assert.equal(element.innerHTML, 'text with &nbsp;lots &nbsp; of &nbsp; &nbsp;whitespace');
      });

      it('adds divs for lines after the first line', function () {
        setInnerText(element, 'text\nwith\nnewlines');
        assert.equal(element.innerHTML, 'text<div>with</div><div>newlines</div>');
      });

      it('adds divs containing <br> for empty lines', function () {
        setInnerText(element, 'text\n\nwith\n\n\nempty newlines');
        assert.equal(element.innerHTML, 'text<div><br></div><div>with</div><div><br></div><div><br></div><div>empty newlines</div>');
      });

      it('html-escapes < and >', function () {
        setInnerText(element, 'text with <b>markup</b>');
        assert.equal(element.innerHTML, 'text with &lt;b&gt;markup&lt;/b&gt;');
      });

      it('html-escapes &', function () {
        setInnerText(element, 'text with&nbsp;HTML &lt;escapes&gt;');
        assert.equal(element.innerHTML, 'text with&amp;nbsp;HTML &amp;lt;escapes&amp;gt;');
      });

      it ('casts non-string arguments safely with toString', function () {
        var numberArgument = 3.14;
        setInnerText(element, numberArgument);
        assert.equal(numberArgument.toString(), '3.14');
        assert.equal(element.innerHTML, '3.14');

        var objectArgument = {x: 1, y: 2};
        setInnerText(element, objectArgument);
        assert.equal(objectArgument.toString(), '[object Object]');
        assert.equal(element.innerHTML, '[object Object]');

        var arrayArgument = ['list', 'of', 'strings'];
        setInnerText(element, arrayArgument);
        assert.equal(arrayArgument.toString(), 'list,of,strings');
        assert.equal(element.innerHTML, 'list,of,strings');
      });
    });

    describe('round-trips', function () {
      function roundTripTest(text) {
        setInnerText(element, text);
        // One extra round-trip for good measure
        setInnerText(element, getInnerText(element));
        assert.equal(getInnerText(element), text);
      }

      it('preserves plain text', function () {
        roundTripTest('plain text');
      });

      it('preserves whitespace', function () {
        roundTripTest('text with  lots   of    whitespace');
      });

      it('preserves newlines', function () {
        roundTripTest('text\nwith\nnewlines');
      });

      it('preserves empty newlines', function () {
        roundTripTest('text\n\nwith\n\n\nempty newlines');
      });

      it('preserves single leading newline', function () {
        roundTripTest('\ntext after newline');
      });

      it('preserves leading and trailing newlines', function () {
        roundTripTest('\n\n\ntext between newlines\n\n');
      });

      it('preserves markup', function () {
        roundTripTest('text with <b>markup</b>');
      });

      it('preserves escape characters', function () {
        roundTripTest('text with&nbsp;HTML &lt;escapes&gt;');
      });
    });
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

  it('returns true if we use setKeyValue', function () {
    var code = ['',
      'setKeyValue("key", "value", function () {',
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

    Applab.user = {};
    Applab.channelId = 'current_channel';
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

describe('RecordListener', function() {
  describe('TableHandler', function() {
    var TableHandler = RecordListener.__TestInterface.TableHandler;
    var records, oldIdToJsonMap, newIdToJsonMap, events, callback;

    beforeEach (function() {
      records = [];
      oldIdToJsonMap = {};
      newIdToJsonMap = {};
      events = [];
      callback = createSpyCallback(events);
    });

    function createSpyCallback(events) {
      return function (record, eventType) {
        events.push([record, eventType]);
      };
    }

    function createRecord(id, name, age) {
      return {id: id, name: name, age: age};
    }

    function addOldRecord(record) {
      oldIdToJsonMap[record.id] = JSON.stringify(record);
    }

    function addNewRecord(record) {
      records.push(record);
      newIdToJsonMap[record.id] = JSON.stringify(record);
    }

    it('reports "create" events', function() {
      var alice = createRecord(1, 'Alice', 7);
      addNewRecord(alice);

      TableHandler.reportEvents_(records, oldIdToJsonMap, newIdToJsonMap, callback);

      assert.equal(events.length, 1, 'One event is reported');
      var actualRecord = events[0][0];
      var actualEventType = events[0][1];
      assert.equal(JSON.stringify(actualRecord), JSON.stringify(alice),
        'Reported record has correct contents');
      assert.equal(actualEventType, 'create', 'Event has correct type');
    });

    it('reports "update" events', function() {
      var alice = createRecord(1, 'Alice', 7);
      var bob = createRecord(1, 'Bob', 8);
      addOldRecord(alice);
      addNewRecord(bob);

      TableHandler.reportEvents_(records, oldIdToJsonMap, newIdToJsonMap, callback);

      assert.equal(events.length, 1, 'One event is reported');
      var actualRecord = events[0][0];
      var actualEventType = events[0][1];
      assert.equal(JSON.stringify(actualRecord), JSON.stringify(bob),
        'Reported record has correct contents');
      assert.equal(actualEventType, 'update', 'Event has correct type');
    });

    it('reports "delete" events', function() {
      var bob = createRecord(1, 'Bob', 8);
      addOldRecord(bob);

      TableHandler.reportEvents_(records, oldIdToJsonMap, newIdToJsonMap, callback);

      assert.equal(events.length, 1, 'One event is reported');
      var actualRecord = events[0][0];
      var actualEventType = events[0][1];
      assert.equal(JSON.stringify(actualRecord), JSON.stringify({id: bob.id}),
        'Reported record has correct contents');
      assert.equal(actualEventType, 'delete', 'Event has correct type');
    });

    it('reports multiple events', function() {
      var alice = createRecord(1, 'Alice', 7);
      var bob = createRecord(2, 'Bob', 8);
      var charlie = createRecord(3, 'Charlie', 9);
      var eve = createRecord(2, 'Eve', 11);

      // create charlie, update bob to eve, delete alice

      addOldRecord(alice);
      addOldRecord(bob);
      addNewRecord(eve);
      addNewRecord(charlie);

      TableHandler.reportEvents_(records, oldIdToJsonMap, newIdToJsonMap, callback);

      var expectedEvents = [
        [eve, 'update'],
        [charlie, 'create'],
        [{id: alice.id}, 'delete']
      ];

      assert.equal(JSON.stringify(events), JSON.stringify(expectedEvents),
        'Create, update and delete events were reported');
    });
  });
});
