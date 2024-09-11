import $ from 'jquery';

import applabMsg from '@cdo/applab/locale';
import Applab from '@cdo/apps/applab/applab';
import applabCommands from '@cdo/apps/applab/commands';
import * as constants from '@cdo/apps/applab/constants';
import designMode from '@cdo/apps/applab/designMode';
import {reducers} from '@cdo/apps/applab/redux/applab';
import project from '@cdo/apps/code-studio/initApp/project';
import {isOpen as isDebuggerOpen} from '@cdo/apps/code-studio/jsdebugger/redux';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';
import commonReducers from '@cdo/apps/redux/commonReducers';
import pageConstantsReducer from '@cdo/apps/redux/pageConstants';
import shareWarnings from '@cdo/apps/shareWarnings';
import {singleton as studioApp} from '@cdo/apps/StudioApp';
import * as utils from '@cdo/apps/utils';
import commonMsg from '@cdo/locale';

import setupBlocklyGlobal from '../../util/setupBlocklyGlobal';
import * as testUtils from '../../util/testUtils';

window.Applab = Applab;

jest.mock('@cdo/apps/code-studio/initApp/project', () => ({
  ...jest.requireActual('@cdo/apps/code-studio/initApp/project'),
  getCurrentId: jest.fn().mockReturnValue('some-project-id'),
  exceedsAbuseThreshold: jest.fn(),
  hasPrivacyProfanityViolation: jest.fn(),
}));

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
  setupBlocklyGlobal();

  testUtils.sandboxDocumentBody();
  testUtils.setExternalGlobals();

  beforeEach(() => {
    jest.spyOn(utils, 'fireResizeEvent').mockClear().mockImplementation();
  });

  afterEach(() => {
    utils.fireResizeEvent.mockRestore();
  });

  describe('designMode.addScreenIfNecessary', function () {
    it('adds a screen if we dont have one', function () {
      var html =
        '<div xmlns="http://www.w3.org/1999/xhtml" id="designModeViz" tabindex="1" style="width: 320px; height: 480px;">' +
        '<button id="button1" style="padding: 0px; margin: 0px; height: 40px; width: 80px; font-size: 14px; color: rgb(0, 0, 0); position: absolute; left: 95px; top: 55px; background-color: rgb(238, 238, 238);" class="">Button</button>' +
        '<button id="button2" style="padding: 0px; margin: 0px; height: 40px; width: 80px; font-size: 14px; color: rgb(0, 0, 0); position: absolute; left: 100px; top: 160px; background-color: rgb(238, 238, 238);" class="">Button</button>' +
        '</div>';

      var converted = designMode.addScreenIfNecessary(html);
      var children = $(converted).children();
      expect(children.length).toEqual(1);

      var screenObj = children.eq(0);
      expect(screenObj.hasClass('screen')).toEqual(true);
      expect(screenObj.children().length).toEqual(2);
    });

    it('changes nothing if we already have a screen', function () {
      var html =
        '<div xmlns="http://www.w3.org/1999/xhtml" id="designModeViz" tabindex="1" style="width: 320px; height: 480px;">' +
        '<div class="screen" id="screen1" style="display: block; height: 480px; width: 320px; left: 0px; top: 0px; position: relative;">' +
        '<button id="button1" style="padding: 0px; margin: 0px; height: 40px; width: 80px; font-size: 14px; color: rgb(0, 0, 0); position: absolute; left: 120px; top: 75px; background-color: rgb(238, 238, 238);">Button</button>' +
        '</div>' +
        '</div>';

      var converted = designMode.addScreenIfNecessary(html);
      expect(converted).toEqual(html);
    });

    it('succeeds if we have no startHtml', function () {
      var html = '';
      var converted = designMode.addScreenIfNecessary(html);
      expect(converted).toEqual(html);
    });
  });

  describe('getIdDropdown filtering modes', function () {
    var documentRoot;

    beforeEach(function () {
      documentRoot = setupVizDom();
    });

    it('produces all IDs when no filter is given', function () {
      expect(Applab.getIdDropdownFromDom_(documentRoot)).toEqual([
        {display: '"chart9"', text: '"chart9"'},
        {display: '"image1"', text: '"image1"'},
        {display: '"screen1"', text: '"screen1"'},
      ]);
    });

    it('can filter on tag type', function () {
      expect(Applab.getIdDropdownFromDom_(documentRoot, 'div')).toEqual([
        {display: '"chart9"', text: '"chart9"'},
        {display: '"screen1"', text: '"screen1"'},
      ]);
      expect(Applab.getIdDropdownFromDom_(documentRoot, 'img')).toEqual([
        {display: '"image1"', text: '"image1"'},
      ]);
    });

    it('can filter on class', function () {
      expect(Applab.getIdDropdownFromDom_(documentRoot, '.chart')).toEqual([
        {display: '"chart9"', text: '"chart9"'},
      ]);
      expect(Applab.getIdDropdownFromDom_(documentRoot, '.screen')).toEqual([
        {display: '"screen1"', text: '"screen1"'},
      ]);
    });

    it('does not accidentally pick up superset classes', function () {
      // Make sure searching for elements with class ".chart" does not also pick
      // up elements with class ".chart-friend"
      expect(Applab.getIdDropdownFromDom_(documentRoot, '.chart')).toEqual([
        {display: '"chart9"', text: '"chart9"'},
      ]);
      expect(
        Applab.getIdDropdownFromDom_(documentRoot, '.chart-friend')
      ).toEqual([{display: '"image1"', text: '"image1"'}]);
    });
  });

  describe('getIdDropdownForCurrentScreen ordering', function () {
    var documentRoot;

    beforeEach(function () {
      documentRoot = setupVizDom();
    });

    it('returns the correct ordering', function () {
      expect(
        Applab.getIdDropdownForCurrentScreenFromDom_(documentRoot)
      ).toEqual(['screen1', 'chart9', 'image1']);
    });
  });

  describe('getText/setText commands', function () {
    describe('simplified innerText emulation', function () {
      var getInnerText = applabCommands.getElementInnerText_;
      var setInnerText = applabCommands.setElementInnerText_;
      var element;

      beforeEach(function () {
        element = document.createElement('div');
        element.setAttribute('contentEditable', true);
      });

      describe('getter', function () {
        it('reads plain text as-is', function () {
          element.innerHTML = 'plain text';
          expect(getInnerText(element)).toEqual('plain text');
        });

        it('converts nonbreaking spaces to plain spaces', function () {
          element.innerHTML =
            'text with &nbsp;lots &nbsp; of &nbsp; &nbsp;whitespace';
          expect(getInnerText(element)).toEqual(
            'text with  lots   of    whitespace'
          );

          element.innerHTML =
            'consecutive&nbsp;&nbsp;&nbsp;&nbsp;nonbreaking spaces';
          expect(getInnerText(element)).toEqual(
            'consecutive    nonbreaking spaces'
          );
        });

        it('converts divs to newlines', function () {
          element.innerHTML = 'text<div>with</div><div>newlines</div>';
          expect(getInnerText(element)).toEqual('text\nwith\nnewlines');
        });

        it('converts divs with attributes to newlines', function () {
          element.innerHTML =
            'Line 1<div style="line-height: 10.8px;">Line 2</div>';
          expect(getInnerText(element)).toEqual('Line 1\nLine 2');
        });

        it('converts <div><br></div> to blank lines', function () {
          element.innerHTML =
            'text<div><br></div><div>with</div><div><br></div><div><br></div><div>empty newlines</div>';
          expect(getInnerText(element)).toEqual(
            'text\n\nwith\n\n\nempty newlines'
          );
        });

        it('does not add leading newline for leading nonempty div', function () {
          element.innerHTML =
            '<div>text</div><div>with</div><div>leading div</div>';
          expect(getInnerText(element)).toEqual('text\nwith\nleading div');
        });

        it('does add leading newline for leading empty div', function () {
          element.innerHTML =
            '<div><br></div><div>text</div><div>with</div><div>leading empty div</div>';
          expect(getInnerText(element)).toEqual(
            '\ntext\nwith\nleading empty div'
          );
        });

        it('Unescapes < and >', function () {
          element.innerHTML = 'text with &lt;b&gt;markup&lt;/b&gt;';
          expect(getInnerText(element)).toEqual('text with <b>markup</b>');
        });

        it('Unescapes &', function () {
          element.innerHTML = 'text with&amp;nbsp;HTML &amp;lt;escapes&amp;gt;';
          expect(getInnerText(element)).toEqual(
            'text with&nbsp;HTML &lt;escapes&gt;'
          );
        });
      });

      describe('setter', function () {
        it('sets plain text as-is', function () {
          setInnerText(element, 'plain text');
          expect(element.innerHTML).toEqual('plain text');
        });

        it('adds nonbreaking spaces for extra whitespace', function () {
          setInnerText(element, 'text with  lots   of    whitespace');
          expect(element.innerHTML).toEqual(
            'text with &nbsp;lots &nbsp; of &nbsp; &nbsp;whitespace'
          );
        });

        it('adds divs for lines after the first line', function () {
          setInnerText(element, 'text\nwith\nnewlines');
          expect(element.innerHTML).toEqual(
            'text<div>with</div><div>newlines</div>'
          );
        });

        it('adds divs containing <br> for empty lines', function () {
          setInnerText(element, 'text\n\nwith\n\n\nempty newlines');
          expect(element.innerHTML).toEqual(
            'text<div><br></div><div>with</div><div><br></div><div><br></div><div>empty newlines</div>'
          );
        });

        it('html-escapes < and >', function () {
          setInnerText(element, 'text with <b>markup</b>');
          expect(element.innerHTML).toEqual(
            'text with &lt;b&gt;markup&lt;/b&gt;'
          );
        });

        it('html-escapes &', function () {
          setInnerText(element, 'text with&nbsp;HTML &lt;escapes&gt;');
          expect(element.innerHTML).toEqual(
            'text with&amp;nbsp;HTML &amp;lt;escapes&amp;gt;'
          );
        });

        it('casts non-string arguments safely with toString', function () {
          var numberArgument = 3.14;
          setInnerText(element, numberArgument);
          expect(numberArgument.toString()).toEqual('3.14');
          expect(element.innerHTML).toEqual('3.14');

          var objectArgument = {x: 1, y: 2};
          setInnerText(element, objectArgument);
          expect(objectArgument.toString()).toEqual('[object Object]');
          expect(element.innerHTML).toEqual('[object Object]');

          var arrayArgument = ['list', 'of', 'strings'];
          setInnerText(element, arrayArgument);
          expect(arrayArgument.toString()).toEqual('list,of,strings');
          expect(element.innerHTML).toEqual('list,of,strings');
        });
      });

      describe('round-trips', function () {
        function roundTripTest(text) {
          setInnerText(element, text);
          // One extra round-trip for good measure
          setInnerText(element, getInnerText(element));
          expect(getInnerText(element)).toEqual(text);
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
      var code = [
        '',
        'createRecord("mytable", {name:\'Alice\'}, function(record) {' + '  ',
        '});',
      ].join('\n');
      expect(Applab.hasDataStoreAPIs(code)).toBe(true);
    });

    it('returns true if we use updateRecord', function () {
      var code = [
        '',
        'updateRecord("mytable", {name:\'Bob\'}, function(record) {' + '  ',
        '});',
      ].join('\n');
      expect(Applab.hasDataStoreAPIs(code)).toBe(true);
    });

    it('returns true if we use setKeyValue', function () {
      var code = [
        '',
        'setKeyValue("key", "value", function () {',
        '  ',
        '});',
      ].join('\n');
      expect(Applab.hasDataStoreAPIs(code)).toBe(true);
    });

    it('returns false if we just read records', function () {
      var code = [
        '',
        'readRecords("mytable", {}, function(records) {',
        '  for (var i =0; i < records.length; i++) {',
        "    textLabel('id', records[i].id + ': ' + records[i].name);",
        '  }',
        '});',
      ].join('\n');
      expect(Applab.hasDataStoreAPIs(code)).toBe(false);
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

    describe('promptForAge', () => {
      it('is false if user is signed in', () => {
        const component = shareWarnings.checkSharedAppWarnings({
          hasDataAPIs: () => true,
          channelId: 'current_channel',
          isSignedIn: true,
        });
        // If we're signed in, we depend on the server routing you appropriately,
        // i.e. if you're under 13, we'll only let you see shared apps if your
        // teacher has accepted TOS
        expect(component.props.promptForAge).toEqual(false);
      });

      it('is false if user is not signed in but has local storage set', () => {
        localStorage.setItem('is13Plus', 'true');
        const component = shareWarnings.checkSharedAppWarnings({
          hasDataAPIs: () => true,
          channelId: 'current_channel',
        });
        expect(component.props.promptForAge).toEqual(false);
      });

      it('is true if user is not signed in and has no local storage set', () => {
        const component = shareWarnings.checkSharedAppWarnings({
          hasDataAPIs: () => true,
          channelId: 'current_channel',
        });
        expect(component.props.promptForAge).toEqual(true);
      });

      it('is false if we dont have data APIs', () => {
        const component = shareWarnings.checkSharedAppWarnings({
          hasDataAPIs: () => false,
          channelId: 'current_channel',
          isSignedIn: false,
        });
        expect(component.props.promptForAge).toEqual(false);
      });
    });

    describe('showStoreDataAlert', function () {
      it('is true if user has viewed no channels', function () {
        var component = shareWarnings.checkSharedAppWarnings({
          channelId: 'current_channel',
          hasDataAPIs: function () {
            return Applab.hasDataStoreAPIs(Applab.getCode());
          },
        });
        expect(component.props.showStoreDataAlert).toEqual(true);
      });

      it('is true if user has viewed only other channels', function () {
        localStorage.setItem('dataAlerts', JSON.stringify(['other_channel']));
        var component = shareWarnings.checkSharedAppWarnings({
          channelId: 'current_channel',
          hasDataAPIs: function () {
            return Applab.hasDataStoreAPIs(Applab.getCode());
          },
        });
        expect(component.props.showStoreDataAlert).toEqual(true);
      });

      it('is false if user has viewed this channel', function () {
        localStorage.setItem(
          'dataAlerts',
          JSON.stringify(['other_channel', 'current_channel'])
        );
        var component = shareWarnings.checkSharedAppWarnings({
          channelId: 'current_channel',
          hasDataAPIs: function () {
            return Applab.hasDataStoreAPIs(Applab.getCode());
          },
        });
        expect(component.props.showStoreDataAlert).toEqual(false);
      });

      it('is false if code has no data storage APIs', function () {
        Applab.getCode = function () {
          return 'asdf';
        };
        var component = shareWarnings.checkSharedAppWarnings({
          channelId: 'current_channel',
          hasDataAPIs: function () {
            return Applab.hasDataStoreAPIs(Applab.getCode());
          },
        });
        expect(component.props.showStoreDataAlert).toEqual(false);
      });
    });

    it('sets is13Plus to true on close', function () {
      var component = shareWarnings.checkSharedAppWarnings({
        channelId: 'current_channel',
      });
      component.props.handleClose();
      expect(localStorage.getItem('is13Plus')).toBe('true');
    });

    it('sets is13Plus to false on too young', function () {
      var component = shareWarnings.checkSharedAppWarnings({
        channelId: 'current_channel',
      });
      component.props.handleTooYoung();
      expect(localStorage.getItem('is13Plus')).toBe('false');
    });

    it('adds our channelId on close', function () {
      localStorage.setItem('dataAlerts', JSON.stringify(['other_channel']));
      var component = shareWarnings.checkSharedAppWarnings({
        channelId: 'current_channel',
        hasDataAPIs: function () {
          return Applab.hasDataStoreAPIs(Applab.getCode());
        },
      });
      component.props.handleClose();
      expect(localStorage.getItem('dataAlerts')).toBe(
        JSON.stringify(['other_channel', 'current_channel'])
      );
    });
  });

  describe("Turtle mode's speed in debugger", () => {
    it('will slow the speed of how fast each block is run in the workspace when speed is set as turtle mode ', () => {
      Applab.setStepSpeed(0);
      expect(Applab.scale.stepSpeed).toEqual(1500);
    });

    it('will not affect how fast each block is run in the workspace when speed is set as rabbit mode', () => {
      Applab.setStepSpeed(1);
      expect(Applab.scale.stepSpeed).toEqual(0);
    });
  });

  describe('Applab.init()', () => {
    beforeAll(() =>
      jest.spyOn(Applab, 'render').mockClear().mockImplementation()
    );
    afterAll(() => Applab.render.mockRestore());
    let containerDiv, codeWorkspaceDiv;

    beforeEach(() => {
      stubRedux();
      registerReducers(commonReducers);
      registerReducers({...reducers, pageConstants: pageConstantsReducer});

      codeWorkspaceDiv = document.createElement('div');
      codeWorkspaceDiv.id = 'codeWorkspace';
      document.body.appendChild(codeWorkspaceDiv);
      containerDiv = document.createElement('div');
      containerDiv.id = 'foo';
      containerDiv.innerHTML = `
      <button id="runButton" />
      <button id="resetButton" />
      <div id="visualizationColumn" />
      <div id="toolbox-header" />
      `;
      document.body.appendChild(containerDiv);

      let testDivApplab = document.createElement('div');
      testDivApplab.setAttribute('id', 'divApplab');
      document.body.appendChild(testDivApplab);

      studioApp().init({
        enableShowCode: true,
        containerId: 'foo',
        level: {
          id: 'some-level-id',
          editCode: true,
          codeFunctions: {},
        },
        dropletConfig: {
          blocks: [],
        },
        skin: {},
      });
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
            editCode: 'foo',
          },
        };
      });

      describe('expandDebugger', () => {
        it('leaves debugger closed when false', () => {
          expect(config.level.expandDebugger).not.toBe(true);
          Applab.init(config);
          expect(isDebuggerOpen(getStore().getState())).toBe(false);
        });

        it('opens debugger when true', () => {
          expect(config.level.expandDebugger).not.toBe(true);
          Applab.init({
            ...config,
            level: {
              ...config.level,
              expandDebugger: true,
            },
          });
          expect(isDebuggerOpen(getStore().getState())).toBe(true);
        });
      });

      describe('hasDesignMode page constant', () => {
        it('is true if design mode is not hidden and not in start or widget mode', () => {
          config.level.hideDesignMode = false;
          config.level.widgetMode = false;
          config.isStartMode = false;
          Applab.init(config);
          expect(getStore().getState().pageConstants.hasDesignMode).toBe(true);
        });

        it('is false if design mode is hidden for level', () => {
          config.level.hideDesignMode = true;
          config.level.widgetMode = false;
          config.isStartMode = false;
          Applab.init(config);
          expect(getStore().getState().pageConstants.hasDesignMode).toBe(false);
        });

        it('is false in widget mode', () => {
          config.level.hideDesignMode = false;
          config.level.widgetMode = true;
          config.isStartMode = false;
          Applab.init(config);
          expect(getStore().getState().pageConstants.hasDesignMode).toBe(false);
        });

        it('is true in levelbuilder widget mode', () => {
          config.level.hideDesignMode = false;
          config.level.widgetMode = true;
          config.isStartMode = true;
          Applab.init(config);
          expect(getStore().getState().pageConstants.hasDesignMode).toBe(true);
        });
      });

      describe('hasDataMode page constant', () => {
        it('is true if data button is not hidden and not in widget mode', () => {
          config.level.hideViewDataButton = false;
          config.level.widgetMode = false;
          Applab.init(config);
          expect(getStore().getState().pageConstants.hasDataMode).toBe(true);
        });

        it('is false if data button is hidden for level', () => {
          config.level.hideViewDataButton = true;
          config.level.widgetMode = false;
          Applab.init(config);
          expect(getStore().getState().pageConstants.hasDataMode).toBe(false);
        });

        it('is false in widget mode', () => {
          config.level.hideViewDataButton = false;
          config.level.widgetMode = true;
          Applab.init(config);
          expect(getStore().getState().pageConstants.hasDataMode).toBe(false);
        });
      });
    });
  });

  describe('makeFooterMenuItems ', () => {
    beforeEach(() => {
      jest.spyOn(project, 'getUrl').mockClear().mockImplementation();
    });

    afterEach(() => {
      project.getUrl.mockRestore();
    });

    it('returns How-It-Works item before Report-Abuse item', () => {
      project.getUrl.mockReturnValue(
        'http://studio.code.org/projects/applab/l1RTgTXtyo9aUeJF2ZUGmQ/embed'
      );
      var footItems = Applab.makeFooterMenuItems(true);
      var howItWorksIndex = footItems.findIndex(
        item => item.text === commonMsg.howItWorks()
      );
      var reportAbuseIndex = footItems.findIndex(
        item => item.text === commonMsg.reportAbuse()
      );
      expect(howItWorksIndex).toBeLessThan(reportAbuseIndex);
    });

    it('returns How-It-Works item before Make-Own-App item', () => {
      project.getUrl.mockReturnValue(
        'http://studio.code.org/projects/applab/l1RTgTXtyo9aUeJF2ZUGmQ/embed'
      );
      var footItems = Applab.makeFooterMenuItems(true);
      var howItWorksIndex = footItems.findIndex(
        item => item.text === commonMsg.howItWorks()
      );
      var makeOwnIndex = footItems.findIndex(
        item => item.text === applabMsg.makeMyOwnApp()
      );
      expect(howItWorksIndex).toBeLessThan(makeOwnIndex);
    });

    it('returns How-It-Works item before Report-Abuse item in AppLab', () => {
      project.getUrl.mockReturnValue(
        'https://studio.code.org/projects/applab/l1RTgTXtyo9aUeJF2ZUGmQ'
      );
      var footItems = Applab.makeFooterMenuItems(true);
      var howItWorksIndex = footItems.findIndex(
        item => item.text === commonMsg.howItWorks()
      );
      var reportAbuseIndex = footItems.findIndex(
        item => item.text === commonMsg.reportAbuse()
      );
      expect(howItWorksIndex).toBeLessThan(reportAbuseIndex);
    });
  });
});
