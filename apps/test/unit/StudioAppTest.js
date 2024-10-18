import $ from 'jquery';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import {assets as assetsApi} from '@cdo/apps/clientApi';
import {listStore} from '@cdo/apps/code-studio/assets';
import {createLibraryClosure} from '@cdo/apps/code-studio/components/libraries/libraryParser';
import project from '@cdo/apps/code-studio/initApp/project';
import * as redux from '@cdo/apps/redux';
import * as commonReducers from '@cdo/apps/redux/commonReducers';
import {resetIdleTime} from '@cdo/apps/redux/studioAppActivity';
import Sounds from '@cdo/apps/Sounds';
import {
  singleton as studioApp,
  stubStudioApp,
  restoreStudioApp,
  makeFooterMenuItems,
} from '@cdo/apps/StudioApp';
import * as utils from '@cdo/apps/utils';

import {expect} from '../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports
import setBlocklyGlobal from '../util/setupBlocklyGlobal';
import {
  sandboxDocumentBody,
  replaceOnWindow,
  restoreOnWindow,
} from '../util/testUtils';

import sampleLibrary from './code-studio/components/libraries/sampleLibrary.json';

describe('StudioApp', () => {
  sandboxDocumentBody();
  setBlocklyGlobal();

  describe('StudioApp.singleton', () => {
    let containerDiv, codeWorkspaceDiv;

    beforeEach(() => {
      stubStudioApp();
      redux.stubRedux();
      redux.registerReducers(commonReducers);
      replaceOnWindow('setTimeout', () => {});

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
    });

    afterEach(() => {
      restoreStudioApp();
      redux.restoreRedux();
      restoreOnWindow('setTimeout');

      document.body.removeChild(codeWorkspaceDiv);
      document.body.removeChild(containerDiv);
    });

    describe('the init() method', () => {
      let files;
      beforeEach(() => {
        files = [];
        sinon.stub(studioApp(), 'configureDom');
        sinon.stub(assetsApi, 'getFiles').callsFake(cb => cb({files}));
        sinon.spy(listStore, 'reset');
      });

      afterEach(() => {
        assetsApi.getFiles.restore();
        listStore.reset.restore();
      });

      it('will pre-populate assets for levels that use assets', () => {
        studioApp().init({
          usesAssets: true,
          channel: 'anldkWKklensa',
          enableShowCode: true,
          containerId: 'foo',
          level: {
            editCode: true,
            codeFunctions: {},
          },
          dropletConfig: {
            blocks: [],
          },
          skin: {},
        });

        expect(assetsApi.getFiles).to.have.been.calledOnce;
        expect(listStore.reset).to.have.been.calledWith(files);
      });

      it('will emit an afterInit event', () => {
        const listener = sinon.spy();
        studioApp().on('afterInit', listener);
        studioApp().init({
          usesAssets: true,
          enableShowCode: true,
          containerId: 'foo',
          level: {
            editCode: true,
            codeFunctions: {},
          },
          dropletConfig: {
            blocks: [],
          },
          skin: {},
        });

        expect(listener).to.have.been.calledOnce;
      });
    });

    describe('StudioApp.editDuringRunAlertHandler()', () => {
      const mockCode = '<xml></xml>';
      let studio;

      beforeEach(() => {
        studio = studioApp();
        studio.executingCode = mockCode;
        studio.clearHighlighting = sinon.spy();
      });

      afterEach(() => {
        sinon.restore();
      });

      it('no-ops if app is not running', () => {
        sinon.stub(studio, 'isRunning').returns(false);
        sinon.stub(studio, 'getCode').returns(mockCode + '<xml>more xml</xml'); // code has changed

        studio.editDuringRunAlertHandler();

        // Make sure clearHighlighting() was never called to confirm no-op.
        expect(studio.clearHighlighting).to.have.not.been.called;
      });

      it('no-ops if code has not changed', () => {
        sinon.stub(studio, 'isRunning').returns(true);
        sinon.stub(studio, 'getCode').returns(mockCode);

        studio.editDuringRunAlertHandler();

        // Make sure clearHighlighting() was never called to confirm no-op.
        expect(studio.clearHighlighting).to.have.not.been.called;
      });

      it('no-ops if editDuringRunAlert is not undefined', () => {
        sinon.stub(studio, 'isRunning').returns(true);
        sinon.stub(studio, 'getCode').returns(mockCode + '<xml>more xml</xml'); // code has changed
        studio.editDuringRunAlert = '<div/>';

        studio.editDuringRunAlertHandler();

        // Make sure clearHighlighting() was never called to confirm no-op.
        expect(studio.clearHighlighting).to.have.not.been.called;
      });

      it('clears block highlighting', () => {
        sinon.stub(studio, 'isRunning').returns(true);
        sinon.stub(studio, 'getCode').returns(mockCode + '<xml>more xml</xml'); // code has changed

        studio.editDuringRunAlertHandler();

        expect(studio.clearHighlighting).to.have.been.calledOnce;
      });

      it('checks localStorage if showEditDuringRunAlert is true', () => {
        studio.showEditDuringRunAlert = true;
        sinon.stub(studio, 'isRunning').returns(true);
        sinon.stub(studio, 'getCode').returns(mockCode + '<xml>more xml</xml'); // code has changed
        sinon.stub(utils, 'tryGetLocalStorage');

        studio.editDuringRunAlertHandler();

        expect(utils.tryGetLocalStorage).to.have.been.calledWith(
          'hideEditDuringRunAlert',
          null
        );
      });

      it('renders editDuringRunAlert if showEditDuringRunAlert is true and editDuringRunAlert is undefined', () => {
        sinon.stub(studio, 'isRunning').returns(true);
        sinon.stub(studio, 'getCode').returns(mockCode + '<xml>more xml</xml'); // code has changed
        studio.showEditDuringRunAlert = true;
        studio.editDuringRunAlert = undefined;
        sinon.stub(utils, 'tryGetLocalStorage').returns(null); // user has not dismissed this alert before
        studio.displayWorkspaceAlert = sinon.spy();

        studio.editDuringRunAlertHandler();

        expect(studio.displayWorkspaceAlert).to.have.been.calledOnce;
      });
    });

    describe('The StudioApp.resetButtonClick function', () => {
      let studio, reportSpy;
      beforeEach(() => {
        studio = studioApp();
        studio.onResetPressed = () => {};
        studio.toggleRunReset = () => {};
        studio.clearHighlighting = () => {};
        studio.isUsingBlockly = () => {
          return false;
        };
        studio.reset = () => {};

        reportSpy = sinon.spy();
        studio.debouncedSilentlyReport = reportSpy;
      });

      it('Sets hasReported to false', () => {
        studio.hasReported = true;
        studio.resetButtonClick();
        expect(studio.hasReported).to.be.false;
        expect(reportSpy).to.have.not.been.called;
      });

      it('Calls `report` if it has not yet been called', () => {
        studio.hasReported = false;
        studio.config = {level: {}};
        studio.resetButtonClick();
        expect(studio.hasReported).to.be.false;
        expect(reportSpy).to.have.been.calledOnce;
        delete studio.config;
      });
    });

    describe('The StudioApp.report function', () => {
      let clock, studio, onAttemptSpy;
      beforeEach(() => {
        clock = sinon.useFakeTimers();
        studio = studioApp();
        studio.feedback_ = {
          canContinueToNextLevel: () => {},
          getNumBlocksUsed: () => {},
        };

        onAttemptSpy = sinon.spy();
        studio.onAttempt = onAttemptSpy;
      });

      afterEach(() => {
        clock.restore();
      });

      it('sets the milestoneStartTime to the current time', () => {
        studio.milestoneStartTime = 0;
        clock.tick(2000);

        studio.report({});

        expect(studio.milestoneStartTime).to.equal(2000);
      });

      it('dispatches resetIdleTime', () => {
        const stubbedDispatch = sinon.stub();
        sinon.stub(redux, 'getStore').returns({
          getState: () => ({
            studioAppActivity: {
              idleTimeSinceLastReport: 3000,
            },
            pageConstants: {
              isReadOnlyWorkspace: false,
            },
          }),
          dispatch: stubbedDispatch,
        });

        studio.report({});

        expect(stubbedDispatch).to.have.been.calledWith(resetIdleTime());

        redux.getStore.restore();
      });

      it('sets hasReported to true', () => {
        studio.hasReported = false;
        studio.report({});
        expect(studio.hasReported).to.be.true;
      });

      it('calculates the timeSinceLastMilestone', () => {
        sinon.stub(redux, 'getStore').returns({
          getState: () => ({
            studioAppActivity: {
              idleTimeSinceLastReport: 1000,
            },
            pageConstants: {
              isReadOnlyWorkspace: false,
            },
          }),
          dispatch: sinon.stub(),
        });

        studio.milestoneStartTime = 1000;
        studio.initTime = 1000;
        clock.tick(3000);

        studio.report({});

        // time spent = 2000 - 1000 = 1000
        expect(onAttemptSpy).to.have.been.calledWith({
          pass: undefined,
          time: 2000,
          timeSinceLastMilestone: 1000,
          attempt: 0,
          lines: undefined,
        });

        redux.getStore.restore();
      });
    });
  });

  describe('The StudioApp.makeFooterMenuItems function', () => {
    beforeEach(() => {
      sinon.stub(project, 'getUrl');
      sinon.stub(project, 'getStandaloneApp');
    });

    afterEach(() => {
      project.getUrl.restore();
      project.getStandaloneApp.restore();
    });

    it('returns a How It Works link to the project edit page from an embed page in GameLab', () => {
      project.getUrl.returns(
        'https://studio.code.org/projects/gamelab/C_2x38fH_jElONWxTLrCHw/embed'
      );
      project.getStandaloneApp.returns('gamelab');
      const footItems = makeFooterMenuItems();
      const howItWorksItem = footItems.find(
        item => item.key === 'how-it-works'
      );
      expect(howItWorksItem.link).to.equal(
        'https://studio.code.org/projects/gamelab/C_2x38fH_jElONWxTLrCHw/edit'
      );
    });

    it('returns a How It Works link to the project edit page from a share page in GameLab', () => {
      project.getUrl.returns(
        'https://studio.code.org/projects/gamelab/C_2x38fH_jElONWxTLrCHw/'
      );
      project.getStandaloneApp.returns('gamelab');
      const footItems = makeFooterMenuItems();
      const howItWorksItem = footItems.find(
        item => item.key === 'how-it-works'
      );
      expect(howItWorksItem.link).to.equal(
        'https://studio.code.org/projects/gamelab/C_2x38fH_jElONWxTLrCHw/edit'
      );
    });

    it('returns How-It-Works item before Report-Abuse item in GameLab', () => {
      project.getUrl.returns(
        'https://studio.code.org/projects/gamelab/C_2x38fH_jElONWxTLrCHw'
      );
      project.getStandaloneApp.returns('gamelab');
      var footItems = makeFooterMenuItems();
      var howItWorksIndex = footItems.findIndex(
        item => item.key === 'how-it-works'
      );
      var reportAbuseIndex = footItems.findIndex(
        item => item.key === 'report-abuse'
      );
      expect(howItWorksIndex).to.be.below(reportAbuseIndex);
    });

    it('does not return Try-HOC menu item in GameLab', () => {
      project.getUrl.returns(
        'https://studio.code.org/projects/gamelab/C_2x38fH_jElONWxTLrCHw/'
      );
      project.getStandaloneApp.returns('gamelab');
      var footItems = makeFooterMenuItems();
      var itemKeys = footItems.map(item => item.key);
      expect(itemKeys).not.to.include('try-hoc');
    });

    it('does return Try-HOC menu item in PlayLab', () => {
      project.getUrl.returns(
        'http://studio.code.org.localhost:3000/projects/playlab/NTMBaBSuxs0t714y4WITMg/'
      );
      project.getStandaloneApp.returns('playlab');
      var footItems = makeFooterMenuItems();
      var itemKeys = footItems.map(item => item.key);
      expect(itemKeys).to.include('try-hoc');
    });
  });

  describe('getCode', () => {
    beforeEach(() => stubStudioApp);
    afterEach(() => restoreStudioApp);

    it('should get the starting blocks if the source is hidden', () => {
      studioApp().editCode = true;
      studioApp().hideSource = true;
      studioApp().startBlocks_ = 'start blocks';
      expect(studioApp().getCode()).to.equal('start blocks');
    });

    it('should get the blockly workspace code if it is read only', () => {
      studioApp().editCode = false;
      let stub = sinon
        .stub(Blockly, 'getWorkspaceCode')
        .returns('blockly workspace');
      expect(studioApp().getCode()).to.equal('blockly workspace');
      stub.restore();
    });

    it('should get the code from the editor itself if editable and the source is not hidden', () => {
      studioApp().editCode = true;
      studioApp().hideSource = false;
      let oldEditor = studioApp().editor;
      studioApp().editor = sinon.stub();
      studioApp().editor.getValue = sinon.stub().returns('editor code');
      expect(studioApp().getCode()).to.equal('editor code');
      studioApp().editor = oldEditor;
    });
  });

  describe('playAudio', () => {
    let playStub, isPlayingStub;
    beforeEach(() => {
      playStub = sinon.stub(Sounds.getSingleton(), 'play');
      isPlayingStub = sinon.stub(Sounds.getSingleton(), 'isPlaying');
    });

    afterEach(() => {
      playStub.restore();
      isPlayingStub.restore();
    });

    it('does not play audio over itself when noOverlap is true', () => {
      isPlayingStub.onCall(0).returns(true);
      studioApp().playAudio('testAudio', {noOverlap: true});
      expect(playStub).not.to.have.been.called;

      isPlayingStub.onCall(1).returns(false);
      studioApp().playAudio('testAudio', {noOverlap: true});
      expect(playStub).to.have.been.calledOnce;
    });

    it('does play audio over itself when noOverlap is false or unspecified', () => {
      isPlayingStub.returns(true);
      studioApp().playAudio('testAudio', {noOverlap: false});
      studioApp().playAudio('testAudio');
      expect(playStub).to.have.been.calledTwice;
    });
  });

  describe('loadLibraryBlocks', () => {
    const initialConfig = {
      level: {
        codeFunctions: {preExistingFunction: null},
      },
      dropletConfig: {
        additionalPredefValues: ['preExistingValue'],
        blocks: ['preExistingBlock'],
      },
    };

    it('given no libraries, leaves the config unchanged', () => {
      let config = initialConfig;
      studioApp().loadLibraryBlocks(config);
      expect(config).to.deep.equal(initialConfig);
    });

    it('given empty libraries array, leaves the config unchanged', () => {
      let config = initialConfig;
      config.level.libraries = [];
      studioApp().loadLibraryBlocks(config);
      expect(config).to.deep.equal(initialConfig);
    });

    it('given a library, creates a libraryCode string', () => {
      let config, targetConfig;
      config = targetConfig = initialConfig;
      studioApp().loadLibraryBlocks(config);
      targetConfig.level.libraryCode = '';
      expect(config).to.deep.equal(targetConfig);
    });

    it('given some libraries, adds all blocks to the droplet config', () => {
      let config = initialConfig;
      let targetBlocks = [
        'preExistingBlock',
        ...sampleLibrary.libraries[0].dropletConfig,
        ...sampleLibrary.libraries[1].dropletConfig,
      ];

      config.level.libraries = sampleLibrary.libraries;
      studioApp().loadLibraryBlocks(config);
      expect(config.dropletConfig.blocks).to.deep.equal(targetBlocks);
    });

    it('given a library, adds all library closures to projectLibraries', () => {
      let config = initialConfig;
      let librarycode = [
        {
          name: sampleLibrary.libraries[0].name,
          code: createLibraryClosure(sampleLibrary.libraries[0]),
        },
        {
          name: sampleLibrary.libraries[1].name,
          code: createLibraryClosure(sampleLibrary.libraries[1]),
        },
      ];

      config.level.libraries = sampleLibrary.libraries;
      studioApp().loadLibraryBlocks(config);
      expect(config.level.projectLibraries).to.deep.equal(librarycode);
    });

    it('given a library, adds all functions to codeFunctions', () => {
      let config = initialConfig;
      let targetCodeFunctions = {
        preExistingFunction: null,
        'twoFunctionLibrary.functionWithParams': null,
        'twoFunctionLibrary.functionWithGlobalVariable': null,
        'oneFunctionLibrary.functionWithPrivateFunctionCall': null,
      };

      config.level.libraries = sampleLibrary.libraries;
      studioApp().loadLibraryBlocks(config);
      expect(config.level.codeFunctions).to.deep.equal(targetCodeFunctions);
    });
  });

  describe('addChangeHandler', () => {
    beforeEach(() => {
      stubStudioApp();
      redux.stubRedux();
      redux.registerReducers(commonReducers);
    });
    afterEach(() => {
      redux.restoreRedux();
      restoreStudioApp();
    });

    it('calls a handler in response to a blockly change', () => {
      let changed = false;
      studioApp().usingBlockly_ = true;
      studioApp().setupChangeHandlers();

      studioApp().addChangeHandler(() => (changed = true));
      Blockly.mainBlockSpace
        .getCanvas()
        .dispatchEvent(new Event('blocklyBlockSpaceChange'));

      expect(changed).to.be.true;
    });

    it('calls a handler in response to a droplet change', () => {
      let changed = false;
      studioApp().usingBlockly_ = false;
      studioApp().editor = $(document.createElement('div'));
      studioApp().editor.aceEditor = $(document.createElement('div'));
      studioApp().setupChangeHandlers();

      studioApp().addChangeHandler(() => (changed = true));
      studioApp().editor.trigger('change');

      expect(changed).to.be.true;

      studioApp().usingBlockly_ = true;
    });

    it('calls a handler in response to an aceEditor change', () => {
      let changed = false;
      studioApp().usingBlockly_ = false;
      studioApp().editor = $(document.createElement('div'));
      studioApp().editor.aceEditor = $(document.createElement('div'));
      studioApp().setupChangeHandlers();

      studioApp().addChangeHandler(() => (changed = true));
      studioApp().editor.aceEditor.trigger('change');

      expect(changed).to.be.true;

      studioApp().usingBlockly_ = true;
    });

    it('calls multiple handlers in response to a blockly change', () => {
      let changed1 = false,
        changed2 = false;
      studioApp().setupChangeHandlers();

      studioApp().addChangeHandler(() => (changed1 = true));
      studioApp().addChangeHandler(() => (changed2 = true));
      Blockly.mainBlockSpace
        .getCanvas()
        .dispatchEvent(new Event('blocklyBlockSpaceChange'));

      expect(changed1).to.be.true;
      expect(changed2).to.be.true;
    });
  });

  describe('The StudioApp.validateCodeChanged function', () => {
    let studio, codeDifferentStub;
    beforeEach(() => {
      codeDifferentStub = sinon.stub(project, 'isCurrentCodeDifferent');
      studio = studioApp();
    });

    afterEach(() => {
      codeDifferentStub.restore();
    });

    it('returns true if validationEnabled is not set', () => {
      studio.config = {level: {}};
      expect(studio.validateCodeChanged()).to.be.true;
      expect(codeDifferentStub).to.have.not.been.called;
    });

    it('returns true if validationEnabled is false', () => {
      studio.config = {level: {validationEnabled: false}};
      expect(studio.validateCodeChanged()).to.be.true;
      expect(codeDifferentStub).to.have.not.been.called;
    });

    it('returns the result of project.isCurrentCodeDifferent', () => {
      studio.config = {level: {validationEnabled: true}};
      codeDifferentStub.returns(false);
      expect(studio.validateCodeChanged()).to.be.false;
      expect(codeDifferentStub).to.have.been.called;
    });
  });
});
