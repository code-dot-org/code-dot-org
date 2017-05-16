import sinon from 'sinon';
import {expect} from '../util/configuredChai';
import {singleton as studioApp, stubStudioApp, restoreStudioApp, makeFooterMenuItems} from '@cdo/apps/StudioApp';
import {throwOnConsoleErrors, throwOnConsoleWarnings} from '../util/testUtils';
import {assets as assetsApi} from '@cdo/apps/clientApi';
import {listStore} from '@cdo/apps/code-studio/assets';
import * as commonReducers from '@cdo/apps/redux/commonReducers';
import {registerReducers, stubRedux, restoreRedux} from '@cdo/apps/redux';
import project from '@cdo/apps/code-studio/initApp/project';

describe("StudioApp", () => {
  describe('StudioApp.singleton', () => {
    throwOnConsoleErrors();
    throwOnConsoleWarnings();

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

    describe("the init() method", () => {
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

      it("will emit an afterInit event", () => {
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
  });

  describe('StudioApp.makeFooterMenuItems', () => {
    beforeEach(() => {
      sinon.stub(project, 'getUrl');
    });

    afterEach(() => {
      project.getUrl.restore();
    });

    const i18n = {
      t: key => key
    };

    it("How It Works URL for game lab embed page", () => {
      project.getUrl.returns('https://studio.code.org/projects/gamelab/C_2x38fH_jElONWxTLrCHw/embed');
      const footItems = makeFooterMenuItems(i18n, project);
      const howItWorksItem = footItems.find(item =>
          item.text === 'footer.how_it_works');
      expect(howItWorksItem.link).to.equal('https://studio.code.org/projects/gamelab/C_2x38fH_jElONWxTLrCHw/edit');
    });

    it("How It Works URL for game lab share page", () => {
      project.getUrl.returns('https://studio.code.org/projects/gamelab/C_2x38fH_jElONWxTLrCHw/');
      const footItems = makeFooterMenuItems(i18n, project);
      const howItWorksItem = footItems.find(item =>
          item.text === 'footer.how_it_works');
      expect(howItWorksItem.link).to.equal('https://studio.code.org/projects/gamelab/C_2x38fH_jElONWxTLrCHw/edit');
    });
  });
});
