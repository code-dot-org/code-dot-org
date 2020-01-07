import $ from 'jquery';
import sinon from 'sinon';
import {expect} from '../util/deprecatedChai';
import {
  singleton as studioApp,
  stubStudioApp,
  restoreStudioApp,
  makeFooterMenuItems
} from '@cdo/apps/StudioApp';
import {assets as assetsApi} from '@cdo/apps/clientApi';
import {listStore} from '@cdo/apps/code-studio/assets';
import * as commonReducers from '@cdo/apps/redux/commonReducers';
import {registerReducers, stubRedux, restoreRedux} from '@cdo/apps/redux';
import project from '@cdo/apps/code-studio/initApp/project';
import {sandboxDocumentBody} from '../util/testUtils';
import sampleLibrary from './code-studio/components/libraries/sampleLibrary.json';
import {createLibraryClosure} from '@cdo/apps/code-studio/components/libraries/libraryParser';

describe('StudioApp', () => {
  sandboxDocumentBody();

  describe('StudioApp.singleton', () => {
    beforeEach(stubStudioApp);
    afterEach(restoreStudioApp);

    let containerDiv, codeWorkspaceDiv;
    beforeEach(() => {
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
      document.body.removeChild(codeWorkspaceDiv);
      document.body.removeChild(containerDiv);
    });

    beforeEach(() => {
      stubRedux();
      registerReducers(commonReducers);
    });
    afterEach(restoreRedux);

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
            codeFunctions: {}
          },
          dropletConfig: {
            blocks: []
          },
          skin: {}
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
            codeFunctions: {}
          },
          dropletConfig: {
            blocks: []
          },
          skin: {}
        });

        expect(listener).to.have.been.calledOnce;
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
        item => item.text === 'footer.how_it_works'
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
        item => item.text === 'footer.how_it_works'
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
        item => item.text === 'footer.how_it_works'
      );
      var reportAbuseIndex = footItems.findIndex(
        item => item.text === 'footer.report_abuse'
      );
      expect(howItWorksIndex).to.be.below(reportAbuseIndex);
    });

    it('does not return Try-HOC menu item in GameLab', () => {
      project.getUrl.returns(
        'https://studio.code.org/projects/gamelab/C_2x38fH_jElONWxTLrCHw/'
      );
      project.getStandaloneApp.returns('gamelab');
      var footItems = makeFooterMenuItems();
      var itemTexts = footItems.map(item => item.text);
      expect(itemTexts).not.to.include('footer.try_hour_of_code');
    });

    it('does return Try-HOC menu item in PlayLab', () => {
      project.getUrl.returns(
        'http://localhost-studio.code.org:3000/projects/playlab/NTMBaBSuxs0t714y4WITMg/'
      );
      project.getStandaloneApp.returns('playlab');
      var footItems = makeFooterMenuItems();
      var itemTexts = footItems.map(item => item.text);
      expect(itemTexts).to.include('footer.try_hour_of_code');
    });
  });

  describe('loadLibraryBlocks', () => {
    const initialConfig = {
      level: {
        codeFunctions: {preExistingFunction: null}
      },
      dropletConfig: {
        additionalPredefValues: ['preExistingValue'],
        blocks: ['preExistingBlock']
      }
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
        ...sampleLibrary.libraries[1].dropletConfig
      ];

      config.level.libraries = sampleLibrary.libraries;
      studioApp().loadLibraryBlocks(config);
      expect(config.dropletConfig.blocks).to.deep.equal(targetBlocks);
    });

    it('given a library, adds all library closures to libraryCode', () => {
      let config = initialConfig;
      let librarycode =
        createLibraryClosure(sampleLibrary.libraries[0]) +
        createLibraryClosure(sampleLibrary.libraries[1]);

      config.level.libraries = sampleLibrary.libraries;
      studioApp().loadLibraryBlocks(config);
      expect(config.level.libraryCode).to.deep.equal(librarycode);
    });

    it('given a library, adds all functions to codeFunctions', () => {
      let config = initialConfig;
      let targetCodeFunctions = {
        preExistingFunction: null,
        'twoFunctionLibrary.functionWithParams': null,
        'twoFunctionLibrary.functionWithGlobalVariable': null,
        'oneFunctionLibrary.functionWithPrivateFunctionCall': null
      };

      config.level.libraries = sampleLibrary.libraries;
      studioApp().loadLibraryBlocks(config);
      expect(config.level.codeFunctions).to.deep.equal(targetCodeFunctions);
    });
  });

  describe('addChangeHandler', () => {
    beforeEach(stubStudioApp);
    afterEach(restoreStudioApp);

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
});
