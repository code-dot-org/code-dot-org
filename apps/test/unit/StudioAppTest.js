import $ from 'jquery';
import {expect} from '../util/reconfiguredChai';
import {
  singleton as studioApp,
  stubStudioApp,
  restoreStudioApp,
  makeFooterMenuItems,
} from '@cdo/apps/StudioApp';
import Sounds from '@cdo/apps/Sounds';
import {assets as assetsApi} from '@cdo/apps/clientApi';
import {listStore} from '@cdo/apps/code-studio/assets';
import * as commonReducers from '@cdo/apps/redux/commonReducers';
import * as redux from '@cdo/apps/redux';
import project from '@cdo/apps/code-studio/initApp/project';
import {
  sandboxDocumentBody,
  replaceOnWindow,
  restoreOnWindow,
} from '../util/testUtils';
import sampleLibrary from './code-studio/components/libraries/sampleLibrary.json';
import {createLibraryClosure} from '@cdo/apps/code-studio/components/libraries/libraryParser';
import * as utils from '@cdo/apps/utils';
import {resetIdleTime} from '@cdo/apps/redux/studioAppActivity';

describe('StudioApp', () => {
  sandboxDocumentBody();

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
        jest
          .spyOn(studioApp(), 'configureDom')
          .mockClear()
          .mockImplementation();
        jest
          .spyOn(assetsApi, 'getFiles')
          .mockClear()
          .mockImplementation(cb => cb({files}));
        jest.spyOn(listStore, 'reset').mockClear();
      });

      afterEach(() => {
        assetsApi.getFiles.mockRestore();
        listStore.reset.mockRestore();
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
        const listener = jest.fn();
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
        studio.clearHighlighting = jest.fn();
      });

      afterEach(() => {
        jest.restoreAllMocks();
      });

      it('no-ops if app is not running', () => {
        jest.spyOn(studio, 'isRunning').mockClear().mockReturnValue(false);
        jest
          .spyOn(studio, 'getCode')
          .mockClear()
          .mockReturnValue(mockCode + '<xml>more xml</xml'); // code has changed

        studio.editDuringRunAlertHandler();

        // Make sure clearHighlighting() was never called to confirm no-op.
        expect(studio.clearHighlighting).to.have.not.been.called;
      });

      it('no-ops if code has not changed', () => {
        jest.spyOn(studio, 'isRunning').mockClear().mockReturnValue(true);
        jest.spyOn(studio, 'getCode').mockClear().mockReturnValue(mockCode);

        studio.editDuringRunAlertHandler();

        // Make sure clearHighlighting() was never called to confirm no-op.
        expect(studio.clearHighlighting).to.have.not.been.called;
      });

      it('no-ops if editDuringRunAlert is not undefined', () => {
        jest.spyOn(studio, 'isRunning').mockClear().mockReturnValue(true);
        jest
          .spyOn(studio, 'getCode')
          .mockClear()
          .mockReturnValue(mockCode + '<xml>more xml</xml'); // code has changed
        studio.editDuringRunAlert = '<div/>';

        studio.editDuringRunAlertHandler();

        // Make sure clearHighlighting() was never called to confirm no-op.
        expect(studio.clearHighlighting).to.have.not.been.called;
      });

      it('clears block highlighting', () => {
        jest.spyOn(studio, 'isRunning').mockClear().mockReturnValue(true);
        jest
          .spyOn(studio, 'getCode')
          .mockClear()
          .mockReturnValue(mockCode + '<xml>more xml</xml'); // code has changed

        studio.editDuringRunAlertHandler();

        expect(studio.clearHighlighting).to.have.been.calledOnce;
      });

      it('checks localStorage if showEditDuringRunAlert is true', () => {
        studio.showEditDuringRunAlert = true;
        jest.spyOn(studio, 'isRunning').mockClear().mockReturnValue(true);
        jest
          .spyOn(studio, 'getCode')
          .mockClear()
          .mockReturnValue(mockCode + '<xml>more xml</xml'); // code has changed
        jest
          .spyOn(utils, 'tryGetLocalStorage')
          .mockClear()
          .mockImplementation();

        studio.editDuringRunAlertHandler();

        expect(utils.tryGetLocalStorage).to.have.been.calledWith(
          'hideEditDuringRunAlert',
          null
        );
      });

      it('renders editDuringRunAlert if showEditDuringRunAlert is true and editDuringRunAlert is undefined', () => {
        jest.spyOn(studio, 'isRunning').mockClear().mockReturnValue(true);
        jest
          .spyOn(studio, 'getCode')
          .mockClear()
          .mockReturnValue(mockCode + '<xml>more xml</xml'); // code has changed
        studio.showEditDuringRunAlert = true;
        studio.editDuringRunAlert = undefined;
        jest
          .spyOn(utils, 'tryGetLocalStorage')
          .mockClear()
          .mockReturnValue(null); // user has not dismissed this alert before
        studio.displayWorkspaceAlert = jest.fn();

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

        reportSpy = jest.fn();
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
      let studio, onAttemptSpy;

      beforeEach(() => {
        jest.useFakeTimers();
        studio = studioApp();
        studio.feedback_ = {
          canContinueToNextLevel: () => {},
          getNumBlocksUsed: () => {},
        };

        onAttemptSpy = jest.fn();
        studio.onAttempt = onAttemptSpy;
      });

      afterEach(() => {
        jest.useRealTimers();
      });

      it('sets the milestoneStartTime to the current time', () => {
        studio.milestoneStartTime = 0;
        jest.advanceTimersByTime(2000);

        studio.report({});

        expect(studio.milestoneStartTime).to.equal(2000);
      });

      it('dispatches resetIdleTime', () => {
        const stubbedDispatch = jest.fn();
        jest
          .spyOn(redux, 'getStore')
          .mockClear()
          .mockReturnValue({
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

        redux.getStore.mockRestore();
      });

      it('sets hasReported to true', () => {
        studio.hasReported = false;
        studio.report({});
        expect(studio.hasReported).to.be.true;
      });

      it('calculates the timeSinceLastMilestone', () => {
        jest
          .spyOn(redux, 'getStore')
          .mockClear()
          .mockReturnValue({
            getState: () => ({
              studioAppActivity: {
                idleTimeSinceLastReport: 1000,
              },
              pageConstants: {
                isReadOnlyWorkspace: false,
              },
            }),
            dispatch: jest.fn(),
          });

        studio.milestoneStartTime = 1000;
        studio.initTime = 1000;
        jest.advanceTimersByTime(3000);

        studio.report({});

        // time spent = 2000 - 1000 = 1000
        expect(onAttemptSpy).to.have.been.calledWith({
          pass: undefined,
          time: 2000,
          timeSinceLastMilestone: 1000,
          attempt: 0,
          lines: undefined,
        });

        redux.getStore.mockRestore();
      });
    });
  });

  describe('The StudioApp.makeFooterMenuItems function', () => {
    beforeEach(() => {
      jest.spyOn(project, 'getUrl').mockClear().mockImplementation();
      jest.spyOn(project, 'getStandaloneApp').mockClear().mockImplementation();
    });

    afterEach(() => {
      project.getUrl.mockRestore();
      project.getStandaloneApp.mockRestore();
    });

    it('returns a How It Works link to the project edit page from an embed page in GameLab', () => {
      project.getUrl.mockReturnValue(
        'https://studio.code.org/projects/gamelab/C_2x38fH_jElONWxTLrCHw/embed'
      );
      project.getStandaloneApp.mockReturnValue('gamelab');
      const footItems = makeFooterMenuItems();
      const howItWorksItem = footItems.find(
        item => item.key === 'how-it-works'
      );
      expect(howItWorksItem.link).to.equal(
        'https://studio.code.org/projects/gamelab/C_2x38fH_jElONWxTLrCHw/edit'
      );
    });

    it('returns a How It Works link to the project edit page from a share page in GameLab', () => {
      project.getUrl.mockReturnValue(
        'https://studio.code.org/projects/gamelab/C_2x38fH_jElONWxTLrCHw/'
      );
      project.getStandaloneApp.mockReturnValue('gamelab');
      const footItems = makeFooterMenuItems();
      const howItWorksItem = footItems.find(
        item => item.key === 'how-it-works'
      );
      expect(howItWorksItem.link).to.equal(
        'https://studio.code.org/projects/gamelab/C_2x38fH_jElONWxTLrCHw/edit'
      );
    });

    it('returns How-It-Works item before Report-Abuse item in GameLab', () => {
      project.getUrl.mockReturnValue(
        'https://studio.code.org/projects/gamelab/C_2x38fH_jElONWxTLrCHw'
      );
      project.getStandaloneApp.mockReturnValue('gamelab');
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
      project.getUrl.mockReturnValue(
        'https://studio.code.org/projects/gamelab/C_2x38fH_jElONWxTLrCHw/'
      );
      project.getStandaloneApp.mockReturnValue('gamelab');
      var footItems = makeFooterMenuItems();
      var itemKeys = footItems.map(item => item.key);
      expect(itemKeys).not.to.include('try-hoc');
    });

    it('does return Try-HOC menu item in PlayLab', () => {
      project.getUrl.mockReturnValue(
        'http://localhost-studio.code.org:3000/projects/playlab/NTMBaBSuxs0t714y4WITMg/'
      );
      project.getStandaloneApp.mockReturnValue('playlab');
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
      let stub = jest
        .spyOn(Blockly, 'getWorkspaceCode')
        .mockClear()
        .mockReturnValue('blockly workspace');
      expect(studioApp().getCode()).to.equal('blockly workspace');
      stub.mockRestore();
    });

    it('should get the code from the editor itself if editable and the source is not hidden', () => {
      studioApp().editCode = true;
      studioApp().hideSource = false;
      let oldEditor = studioApp().editor;
      studioApp().editor = jest.fn();
      studioApp().editor.getValue = jest.fn().mockReturnValue('editor code');
      expect(studioApp().getCode()).to.equal('editor code');
      studioApp().editor = oldEditor;
    });
  });

  describe('playAudio', () => {
    let playStub, isPlayingStub;
    beforeEach(() => {
      playStub = jest
        .spyOn(Sounds.getSingleton(), 'play')
        .mockClear()
        .mockImplementation();
      isPlayingStub = jest
        .spyOn(Sounds.getSingleton(), 'isPlaying')
        .mockClear()
        .mockImplementation();
    });

    afterEach(() => {
      playStub.mockRestore();
      isPlayingStub.mockRestore();
    });

    it('does not play audio over itself when noOverlap is true', () => {
      isPlayingStub.mockImplementation(() => {
        if (isPlayingStub.mock.calls.length === 0) {
          return true;
        }
      });
      studioApp().playAudio('testAudio', {noOverlap: true});
      expect(playStub).not.to.have.been.called;

      isPlayingStub.mockImplementation(() => {
        if (isPlayingStub.mock.calls.length === 1) {
          return false;
        }
      });
      studioApp().playAudio('testAudio', {noOverlap: true});
      expect(playStub).to.have.been.calledOnce;
    });

    it('does play audio over itself when noOverlap is false or unspecified', () => {
      isPlayingStub.mockReturnValue(true);
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
      codeDifferentStub = jest
        .spyOn(project, 'isCurrentCodeDifferent')
        .mockClear()
        .mockImplementation();
      studio = studioApp();
    });

    afterEach(() => {
      codeDifferentStub.mockRestore();
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
      codeDifferentStub.mockReturnValue(false);
      expect(studio.validateCodeChanged()).to.be.false;
      expect(codeDifferentStub).to.have.been.called;
    });
  });
});
