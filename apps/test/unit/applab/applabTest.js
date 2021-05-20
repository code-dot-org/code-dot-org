import $ from 'jquery';
import sinon from 'sinon';
import {assert, expect} from '../../util/reconfiguredChai';
import project from '@cdo/apps/code-studio/initApp/project';
import commonMsg from '@cdo/locale';
import applabMsg from '@cdo/applab/locale';
import * as testUtils from '../../util/testUtils';
import {isOpen as isDebuggerOpen} from '@cdo/apps/lib/tools/jsdebugger/redux';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux
} from '@cdo/apps/redux';
import {reducers} from '@cdo/apps/applab/redux/applab';
import pageConstantsReducer from '@cdo/apps/redux/pageConstants';
import Applab from '@cdo/apps/applab/applab';
import designMode from '@cdo/apps/applab/designMode';
import applabCommands from '@cdo/apps/applab/commands';
import * as constants from '@cdo/apps/applab/constants';
import shareWarnings from '@cdo/apps/shareWarnings';

function setupVizDom() {
  // Create a sample DOM to test against
  var sampleDom =
    '<div>' +
    '<div id="designModeViz">' +
    '<div class="screen" id="' +
    constants.DESIGN_ELEMENT_ID_PREFIX +
    'screen1">' +
    '<div class="chart" id="' +
    constants.DESIGN_ELEMENT_ID_PREFIX +
    'chart9"></div>' +
    '<img src="" class="chart-friend" id="' +
    constants.DESIGN_ELEMENT_ID_PREFIX +
    'image1">' +
    '</div>' +
    '</div>' +
    '</div>';
  return $(sampleDom);
}

describe('Applab', () => {
  testUtils.sandboxDocumentBody();
  testUtils.setExternalGlobals();

  describe('designMode.addScreenIfNecessary', function() {
    it('adds a screen if we dont have one', function() {
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

    it('changes nothing if we already have a screen', function() {
      var html =
        '<div xmlns="http://www.w3.org/1999/xhtml" id="designModeViz" tabindex="1" style="width: 320px; height: 480px;">' +
        '<div class="screen" id="screen1" style="display: block; height: 480px; width: 320px; left: 0px; top: 0px; position: relative;">' +
        '<button id="button1" style="padding: 0px; margin: 0px; height: 40px; width: 80px; font-size: 14px; color: rgb(0, 0, 0); position: absolute; left: 120px; top: 75px; background-color: rgb(238, 238, 238);">Button</button>' +
        '</div>' +
        '</div>';

      var converted = designMode.addScreenIfNecessary(html);
      assert.equal(converted, html);
    });

    it('succeeds if we have no startHtml', function() {
      var html = '';
      var converted = designMode.addScreenIfNecessary(html);
      assert.equal(converted, html);
    });
  });

  describe('getIdDropdown filtering modes', function() {
    var documentRoot;

    beforeEach(function() {
      documentRoot = setupVizDom();
    });

    it('produces all IDs when no filter is given', function() {
      assert.deepEqual(Applab.getIdDropdownFromDom_(documentRoot), [
        {display: '"chart9"', text: '"chart9"'},
        {display: '"image1"', text: '"image1"'},
        {display: '"screen1"', text: '"screen1"'}
      ]);
    });

    it('can filter on tag type', function() {
      assert.deepEqual(Applab.getIdDropdownFromDom_(documentRoot, 'div'), [
        {display: '"chart9"', text: '"chart9"'},
        {display: '"screen1"', text: '"screen1"'}
      ]);
      assert.deepEqual(Applab.getIdDropdownFromDom_(documentRoot, 'img'), [
        {display: '"image1"', text: '"image1"'}
      ]);
    });

    it('can filter on class', function() {
      assert.deepEqual(Applab.getIdDropdownFromDom_(documentRoot, '.chart'), [
        {display: '"chart9"', text: '"chart9"'}
      ]);
      assert.deepEqual(Applab.getIdDropdownFromDom_(documentRoot, '.screen'), [
        {display: '"screen1"', text: '"screen1"'}
      ]);
    });

    it('does not accidentally pick up superset classes', function() {
      // Make sure searching for elements with class ".chart" does not also pick
      // up elements with class ".chart-friend"
      assert.deepEqual(Applab.getIdDropdownFromDom_(documentRoot, '.chart'), [
        {display: '"chart9"', text: '"chart9"'}
      ]);
      assert.deepEqual(
        Applab.getIdDropdownFromDom_(documentRoot, '.chart-friend'),
        [{display: '"image1"', text: '"image1"'}]
      );
    });
  });

  describe('getIdDropdownForCurrentScreen ordering', function() {
    var documentRoot;

    beforeEach(function() {
      documentRoot = setupVizDom();
    });

    it('returns the correct ordering', function() {
      assert.deepEqual(
        Applab.getIdDropdownForCurrentScreenFromDom_(documentRoot),
        ['screen1', 'chart9', 'image1']
      );
    });
  });

  describe('getText/setText commands', function() {
    describe('simplified innerText emulation', function() {
      var getInnerText = applabCommands.getElementInnerText_;
      var setInnerText = applabCommands.setElementInnerText_;
      var element;

      beforeEach(function() {
        element = document.createElement('div');
        element.setAttribute('contentEditable', true);
      });

      describe('getter', function() {
        it('reads plain text as-is', function() {
          element.innerHTML = 'plain text';
          assert.equal(getInnerText(element), 'plain text');
        });

        it('converts nonbreaking spaces to plain spaces', function() {
          element.innerHTML =
            'text with &nbsp;lots &nbsp; of &nbsp; &nbsp;whitespace';
          assert.equal(
            getInnerText(element),
            'text with  lots   of    whitespace'
          );

          element.innerHTML =
            'consecutive&nbsp;&nbsp;&nbsp;&nbsp;nonbreaking spaces';
          assert.equal(
            getInnerText(element),
            'consecutive    nonbreaking spaces'
          );
        });

        it('converts divs to newlines', function() {
          element.innerHTML = 'text<div>with</div><div>newlines</div>';
          assert.equal(getInnerText(element), 'text\nwith\nnewlines');
        });

        it('converts divs with attributes to newlines', function() {
          element.innerHTML =
            'Line 1<div style="line-height: 10.8px;">Line 2</div>';
          assert.equal(getInnerText(element), 'Line 1\nLine 2');
        });

        it('converts <div><br></div> to blank lines', function() {
          element.innerHTML =
            'text<div><br></div><div>with</div><div><br></div><div><br></div><div>empty newlines</div>';
          assert.equal(
            getInnerText(element),
            'text\n\nwith\n\n\nempty newlines'
          );
        });

        it('does not add leading newline for leading nonempty div', function() {
          element.innerHTML =
            '<div>text</div><div>with</div><div>leading div</div>';
          assert.equal(getInnerText(element), 'text\nwith\nleading div');
        });

        it('does add leading newline for leading empty div', function() {
          element.innerHTML =
            '<div><br></div><div>text</div><div>with</div><div>leading empty div</div>';
          assert.equal(
            getInnerText(element),
            '\ntext\nwith\nleading empty div'
          );
        });

        it('Unescapes < and >', function() {
          element.innerHTML = 'text with &lt;b&gt;markup&lt;/b&gt;';
          assert.equal(getInnerText(element), 'text with <b>markup</b>');
        });

        it('Unescapes &', function() {
          element.innerHTML = 'text with&amp;nbsp;HTML &amp;lt;escapes&amp;gt;';
          assert.equal(
            getInnerText(element),
            'text with&nbsp;HTML &lt;escapes&gt;'
          );
        });
      });

      describe('setter', function() {
        it('sets plain text as-is', function() {
          setInnerText(element, 'plain text');
          assert.equal(element.innerHTML, 'plain text');
        });

        it('adds nonbreaking spaces for extra whitespace', function() {
          setInnerText(element, 'text with  lots   of    whitespace');
          assert.equal(
            element.innerHTML,
            'text with &nbsp;lots &nbsp; of &nbsp; &nbsp;whitespace'
          );
        });

        it('adds divs for lines after the first line', function() {
          setInnerText(element, 'text\nwith\nnewlines');
          assert.equal(
            element.innerHTML,
            'text<div>with</div><div>newlines</div>'
          );
        });

        it('adds divs containing <br> for empty lines', function() {
          setInnerText(element, 'text\n\nwith\n\n\nempty newlines');
          assert.equal(
            element.innerHTML,
            'text<div><br></div><div>with</div><div><br></div><div><br></div><div>empty newlines</div>'
          );
        });

        it('html-escapes < and >', function() {
          setInnerText(element, 'text with <b>markup</b>');
          assert.equal(
            element.innerHTML,
            'text with &lt;b&gt;markup&lt;/b&gt;'
          );
        });

        it('html-escapes &', function() {
          setInnerText(element, 'text with&nbsp;HTML &lt;escapes&gt;');
          assert.equal(
            element.innerHTML,
            'text with&amp;nbsp;HTML &amp;lt;escapes&amp;gt;'
          );
        });

        it('casts non-string arguments safely with toString', function() {
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

      describe('round-trips', function() {
        function roundTripTest(text) {
          setInnerText(element, text);
          // One extra round-trip for good measure
          setInnerText(element, getInnerText(element));
          assert.equal(getInnerText(element), text);
        }

        it('preserves plain text', function() {
          roundTripTest('plain text');
        });

        it('preserves whitespace', function() {
          roundTripTest('text with  lots   of    whitespace');
        });

        it('preserves newlines', function() {
          roundTripTest('text\nwith\nnewlines');
        });

        it('preserves empty newlines', function() {
          roundTripTest('text\n\nwith\n\n\nempty newlines');
        });

        it('preserves single leading newline', function() {
          roundTripTest('\ntext after newline');
        });

        it('preserves leading and trailing newlines', function() {
          roundTripTest('\n\n\ntext between newlines\n\n');
        });

        it('preserves markup', function() {
          roundTripTest('text with <b>markup</b>');
        });

        it('preserves escape characters', function() {
          roundTripTest('text with&nbsp;HTML &lt;escapes&gt;');
        });
      });
    });
  });

  describe('hasDataStoreAPIs', function() {
    it('returns true if we use createRecord', function() {
      var code = [
        '',
        'createRecord("mytable", {name:\'Alice\'}, function(record) {' + '  ',
        '});'
      ].join('\n');
      assert.strictEqual(Applab.hasDataStoreAPIs(code), true);
    });

    it('returns true if we use updateRecord', function() {
      var code = [
        '',
        'updateRecord("mytable", {name:\'Bob\'}, function(record) {' + '  ',
        '});'
      ].join('\n');
      assert.strictEqual(Applab.hasDataStoreAPIs(code), true);
    });

    it('returns true if we use setKeyValue', function() {
      var code = [
        '',
        'setKeyValue("key", "value", function () {',
        '  ',
        '});'
      ].join('\n');
      assert.strictEqual(Applab.hasDataStoreAPIs(code), true);
    });

    it('returns false if we just read records', function() {
      var code = [
        '',
        'readRecords("mytable", {}, function(records) {',
        '  for (var i =0; i < records.length; i++) {',
        "    textLabel('id', records[i].id + ': ' + records[i].name);",
        '  }',
        '});'
      ].join('\n');
      assert.strictEqual(Applab.hasDataStoreAPIs(code), false);
    });
  });

  describe('startSharedAppAfterWarnings', function() {
    var originalState = {};
    var mockedApplabItems = ['user', 'getCode', 'runButtonClick'];

    beforeEach(function() {
      localStorage.clear();
      mockedApplabItems.forEach(function(item) {
        originalState[item] = Applab[item];
      });
      originalState.dashboard = window.dashboard;

      Applab.user = {};
      Applab.channelId = 'current_channel';
      Applab.getCode = function() {
        return 'createRecord'; // use data API
      };
      Applab.runButtonClick = function() {};
    });

    afterEach(function() {
      mockedApplabItems.forEach(function(item) {
        Applab[item] = originalState[item];
      });
      window.dashboard = originalState.dashboard;
    });

    describe('promptForAge', () => {
      it('is false if user is signed in', () => {
        const component = shareWarnings.checkSharedAppWarnings({
          hasDataAPIs: () => true,
          channelId: 'current_channel',
          isSignedIn: true
        });
        // If we're signed in, we depend on the server routing you appropriately,
        // i.e. if you're under 13, we'll only let you see shared apps if your
        // teacher has accepted TOS
        assert.equal(component.props.promptForAge, false);
      });

      it('is false if user is not signed in but has local storage set', () => {
        localStorage.setItem('is13Plus', 'true');
        const component = shareWarnings.checkSharedAppWarnings({
          hasDataAPIs: () => true,
          channelId: 'current_channel'
        });
        assert.equal(component.props.promptForAge, false);
      });

      it('is true if user is not signed in and has no local storage set', () => {
        const component = shareWarnings.checkSharedAppWarnings({
          hasDataAPIs: () => true,
          channelId: 'current_channel'
        });
        assert.equal(component.props.promptForAge, true);
      });

      it('is false if we dont have data APIs', () => {
        const component = shareWarnings.checkSharedAppWarnings({
          hasDataAPIs: () => false,
          channelId: 'current_channel',
          isSignedIn: false
        });
        assert.equal(component.props.promptForAge, false);
      });
    });

    describe('showStoreDataAlert', function() {
      it('is true if user has viewed no channels', function() {
        var component = shareWarnings.checkSharedAppWarnings({
          channelId: 'current_channel',
          hasDataAPIs: function() {
            return Applab.hasDataStoreAPIs(Applab.getCode());
          }
        });
        assert.equal(component.props.showStoreDataAlert, true);
      });

      it('is true if user has viewed only other channels', function() {
        localStorage.setItem('dataAlerts', JSON.stringify(['other_channel']));
        var component = shareWarnings.checkSharedAppWarnings({
          channelId: 'current_channel',
          hasDataAPIs: function() {
            return Applab.hasDataStoreAPIs(Applab.getCode());
          }
        });
        assert.equal(component.props.showStoreDataAlert, true);
      });

      it('is false if user has viewed this channel', function() {
        localStorage.setItem(
          'dataAlerts',
          JSON.stringify(['other_channel', 'current_channel'])
        );
        var component = shareWarnings.checkSharedAppWarnings({
          channelId: 'current_channel',
          hasDataAPIs: function() {
            return Applab.hasDataStoreAPIs(Applab.getCode());
          }
        });
        assert.equal(component.props.showStoreDataAlert, false);
      });

      it('is false if code has no data storage APIs', function() {
        Applab.getCode = function() {
          return 'asdf';
        };
        var component = shareWarnings.checkSharedAppWarnings({
          channelId: 'current_channel',
          hasDataAPIs: function() {
            return Applab.hasDataStoreAPIs(Applab.getCode());
          }
        });
        assert.equal(component.props.showStoreDataAlert, false);
      });
    });

    it('sets is13Plus to true on close', function() {
      var component = shareWarnings.checkSharedAppWarnings({
        channelId: 'current_channel'
      });
      component.props.handleClose();
      assert.strictEqual(localStorage.getItem('is13Plus'), 'true');
    });

    it('sets is13Plus to false on too young', function() {
      var component = shareWarnings.checkSharedAppWarnings({
        channelId: 'current_channel'
      });
      component.props.handleTooYoung();
      assert.strictEqual(localStorage.getItem('is13Plus'), 'false');
    });

    it('adds our channelId on close', function() {
      localStorage.setItem('dataAlerts', JSON.stringify(['other_channel']));
      var component = shareWarnings.checkSharedAppWarnings({
        channelId: 'current_channel',
        hasDataAPIs: function() {
          return Applab.hasDataStoreAPIs(Applab.getCode());
        }
      });
      component.props.handleClose();
      assert.strictEqual(
        localStorage.getItem('dataAlerts'),
        JSON.stringify(['other_channel', 'current_channel'])
      );
    });
  });

  describe("Turtle mode's speed in debugger", () => {
    it('will slow the speed of how fast each block is run in the workspace when speed is set as turtle mode ', () => {
      Applab.setStepSpeed(0);
      assert.equal(Applab.scale.stepSpeed, 1500);
    });

    it('will not affect how fast each block is run in the workspace when speed is set as rabbit mode', () => {
      Applab.setStepSpeed(1);
      assert.equal(Applab.scale.stepSpeed, 0);
    });
  });

  describe('Applab.init()', () => {
    before(() => sinon.stub(Applab, 'render'));
    after(() => Applab.render.restore());

    beforeEach(() => {
      stubRedux();
      registerReducers({...reducers, pageConstants: pageConstantsReducer});
    });

    afterEach(restoreRedux);

    describe('configuration options', () => {
      let config;

      beforeEach(() => {
        config = {
          channel: 'bar',
          baseUrl: 'foo',
          skin: {},
          level: {
            editCode: 'foo'
          }
        };
      });

      describe('expandDebugger', () => {
        it('leaves debugger closed when false', () => {
          expect(config.level.expandDebugger).not.to.be.true;
          Applab.init(config);
          expect(isDebuggerOpen(getStore().getState())).to.be.false;
        });

        it('opens debugger when true', () => {
          expect(config.level.expandDebugger).not.to.be.true;
          Applab.init({
            ...config,
            level: {
              ...config.level,
              expandDebugger: true
            }
          });
          expect(isDebuggerOpen(getStore().getState())).to.be.true;
        });
      });

      describe('hasDesignMode page constant', () => {
        it('is true if design mode is not hidden and not in start or widget mode', () => {
          config.level.hideDesignMode = false;
          config.level.widgetMode = false;
          config.isStartMode = false;
          Applab.init(config);
          expect(getStore().getState().pageConstants.hasDesignMode).to.be.true;
        });

        it('is false if design mode is hidden for level', () => {
          config.level.hideDesignMode = true;
          config.level.widgetMode = false;
          config.isStartMode = false;
          Applab.init(config);
          expect(getStore().getState().pageConstants.hasDesignMode).to.be.false;
        });

        it('is false in widget mode', () => {
          config.level.hideDesignMode = false;
          config.level.widgetMode = true;
          config.isStartMode = false;
          Applab.init(config);
          expect(getStore().getState().pageConstants.hasDesignMode).to.be.false;
        });

        it('is true in levelbuilder widget mode', () => {
          config.level.hideDesignMode = false;
          config.level.widgetMode = true;
          config.isStartMode = true;
          Applab.init(config);
          expect(getStore().getState().pageConstants.hasDesignMode).to.be.true;
        });
      });

      describe('hasDataMode page constant', () => {
        it('is true if data button is not hidden and not in widget mode', () => {
          config.level.hideViewDataButton = false;
          config.level.widgetMode = false;
          Applab.init(config);
          expect(getStore().getState().pageConstants.hasDataMode).to.be.true;
        });

        it('is false if data button is hidden for level', () => {
          config.level.hideViewDataButton = true;
          config.level.widgetMode = false;
          Applab.init(config);
          expect(getStore().getState().pageConstants.hasDataMode).to.be.false;
        });

        it('is false in widget mode', () => {
          config.level.hideViewDataButton = false;
          config.level.widgetMode = true;
          Applab.init(config);
          expect(getStore().getState().pageConstants.hasDataMode).to.be.false;
        });
      });
    });
  });

  describe('makeFooterMenuItems ', () => {
    beforeEach(() => {
      sinon.stub(project, 'getUrl');
    });

    afterEach(() => {
      project.getUrl.restore();
    });

    it('returns How-It-Works item before Report-Abuse item', () => {
      project.getUrl.returns(
        'http://studio.code.org/projects/applab/l1RTgTXtyo9aUeJF2ZUGmQ/embed'
      );
      var footItems = Applab.makeFooterMenuItems(true);
      var howItWorksIndex = footItems.findIndex(
        item => item.text === commonMsg.howItWorks()
      );
      var reportAbuseIndex = footItems.findIndex(
        item => item.text === commonMsg.reportAbuse()
      );
      expect(howItWorksIndex).to.be.below(reportAbuseIndex);
    });

    it('returns How-It-Works item before Make-Own-App item', () => {
      project.getUrl.returns(
        'http://studio.code.org/projects/applab/l1RTgTXtyo9aUeJF2ZUGmQ/embed'
      );
      var footItems = Applab.makeFooterMenuItems(true);
      var howItWorksIndex = footItems.findIndex(
        item => item.text === commonMsg.howItWorks()
      );
      var makeOwnIndex = footItems.findIndex(
        item => item.text === applabMsg.makeMyOwnApp()
      );
      expect(howItWorksIndex).to.be.below(makeOwnIndex);
    });

    it('returns How-It-Works item before Report-Abuse item in AppLab', () => {
      project.getUrl.returns(
        'https://studio.code.org/projects/applab/l1RTgTXtyo9aUeJF2ZUGmQ'
      );
      var footItems = Applab.makeFooterMenuItems(true);
      var howItWorksIndex = footItems.findIndex(
        item => item.text === commonMsg.howItWorks()
      );
      var reportAbuseIndex = footItems.findIndex(
        item => item.text === commonMsg.reportAbuse()
      );
      expect(howItWorksIndex).to.be.below(reportAbuseIndex);
    });
  });

  describe('Applab.getHtmlForWidgetMode', () => {
    it('changes the width of screens', () => {
      // Applab project with two screens, a label, a button, and an image.
      Applab.levelHtml = `<div id="designModeViz" class="appModern clip-content" tabindex="1" data-radium="true" style="width: 320px; height: 450px;"><div class="screen" tabindex="1" data-theme="default" id="screen1" style="display: block; height: 450px; width: 320px; left: 0px; top: 0px; position: absolute; z-index: 0; background-color: rgb(255, 255, 255);"><button id="button1" style="padding: 0px; margin: 0px; border-style: solid; height: 40px; width: 100px; background-color: rgb(255, 164, 0); color: rgb(255, 255, 255); border-color: rgb(77, 87, 95); border-radius: 4px; border-width: 1px; font-family: &quot;Arial Black&quot;, Gadget, sans-serif; font-size: 15px; position: absolute; left: 85px; top: 40px;">Button</button><label style="margin: 0px; line-height: 1; overflow: hidden; overflow-wrap: break-word; max-width: 320px; border-style: solid; text-rendering: optimizespeed; color: rgb(77, 87, 95); background-color: rgba(0, 0, 0, 0); border-color: rgb(77, 87, 95); border-radius: 0px; border-width: 0px; font-family: &quot;Arial Black&quot;, Gadget, sans-serif; font-size: 13px; padding: 2px 15px; width: 60px; height: 18px; position: absolute; left: 110px; top: 110px;" id="label1">text</label></div><div class="screen" tabindex="1" data-theme="default" id="screen2" style="display: none; height: 450px; width: 320px; left: 0px; top: 0px; position: absolute; z-index: 0; background-color: rgb(255, 255, 255);"><img src="/blockly/media/1x1.gif" data-canonical-image-url="" data-image-type="" data-object-fit="contain" id="image1" style="height: 100px; width: 100px; border-style: solid; border-width: 0px; border-color: rgb(0, 0, 0); border-radius: 0px; position: absolute; left: 105px; top: 140px; margin: 0px;"></div></div>`;

      const expectedHtml = `<div id="designModeViz" class="appModern clip-content" tabindex="1" data-radium="true" style="width: 320px; height: 450px;"><div class="screen" tabindex="1" data-theme="default" id="screen1" style="display: block; height: 450px; width: 600px; left: 0px; top: 0px; position: absolute; z-index: 0; background-color: rgb(255, 255, 255);"><button id="button1" style="padding: 0px; margin: 0px; border-style: solid; height: 40px; width: 100px; background-color: rgb(255, 164, 0); color: rgb(255, 255, 255); border-color: rgb(77, 87, 95); border-radius: 4px; border-width: 1px; font-family: &quot;Arial Black&quot;, Gadget, sans-serif; font-size: 15px; position: absolute; left: 85px; top: 40px;">Button</button><label style="margin: 0px; line-height: 1; overflow: hidden; overflow-wrap: break-word; max-width: 320px; border-style: solid; text-rendering: optimizespeed; color: rgb(77, 87, 95); background-color: rgba(0, 0, 0, 0); border-color: rgb(77, 87, 95); border-radius: 0px; border-width: 0px; font-family: &quot;Arial Black&quot;, Gadget, sans-serif; font-size: 13px; padding: 2px 15px; width: 60px; height: 18px; position: absolute; left: 110px; top: 110px;" id="label1">text</label></div><div class="screen" tabindex="1" data-theme="default" id="screen2" style="display: none; height: 450px; width: 600px; left: 0px; top: 0px; position: absolute; z-index: 0; background-color: rgb(255, 255, 255);"><img src="/blockly/media/1x1.gif" data-canonical-image-url="" data-image-type="" data-object-fit="contain" id="image1" style="height: 100px; width: 100px; border-style: solid; border-width: 0px; border-color: rgb(0, 0, 0); border-radius: 0px; position: absolute; left: 105px; top: 140px; margin: 0px;"></div></div>`;

      const actualHtml = Applab.getHtmlForWidgetMode();
      expect(actualHtml).to.equal(expectedHtml);
    });
  });
});
