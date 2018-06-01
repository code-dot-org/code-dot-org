/* eslint no-unused-vars: "error" */
import sinon from 'sinon';
import {expect} from '../../util/configuredChai';
import {allowConsoleErrors} from '../../util/testUtils';
import designMode from '@cdo/apps/applab/designMode';
import * as elementUtils from '@cdo/apps/applab/designElements/elementUtils';
import {
  assets as assetsApi,
} from '@cdo/apps/clientApi';

import {getImportableProject, importScreensAndAssets} from '@cdo/apps/applab/import';

describe("The applab/import module", () => {
  allowConsoleErrors();
  var designModeViz;

  beforeEach(() => {
    designModeViz = document.createElement('div');
    designModeViz.id = "designModeViz";
    document.body.appendChild(designModeViz);
    sinon.stub(designMode, 'changeScreen');
    sinon.stub(designMode, 'resetPropertyTab');
    sinon.stub(assetsApi, 'copyAssets');
  });

  afterEach(() => {
    designModeViz.parentNode.removeChild(designModeViz);
    designMode.changeScreen.restore();
    designMode.resetPropertyTab.restore();
    assetsApi.copyAssets.restore();
  });

  function getProjectWithHTML(html) {
    return {
      channel: {
        name: 'Some Other Project!',
        id: 'some-other-project',
      },
      sources: {
        html: `<div>${html}</div>`,
      },
      assets: [],
      existingAssets: [],
    };
  }

  function setExistingHTML(existingHTML) {
    designModeViz.innerHTML = existingHTML;
  }

  describe('The getImportableProject function', () => {

    describe('When doing an import into an empty project, the importable project', () => {
      var importable;
      beforeEach(() => {
        setExistingHTML(``);
        importable = getImportableProject(
          getProjectWithHTML(`
            <div class="screen" id="screen1"></div>
            <div class="screen" id="screen2"></div>
          `)
        );
      });

      it("should have an id and name property pulled from the channel", () => {
        expect(importable.id).to.equal('some-other-project');
        expect(importable.name).to.equal('Some Other Project!');
      });

      it('should contain both of the screens in the given html', () => {
        expect(importable.screens).to.have.length(2);
        expect(importable.screens[0].id).to.equal('screen1');
        expect(importable.screens[1].id).to.equal('screen2');
      });

      it('should list all of the screens as importable', () => {
        importable.screens.forEach(
          screen => expect(screen.canBeImported).to.be.true
        );
      });

      it('should list all of the screens as not replacing existing screens', () => {
        importable.screens.forEach(
          screen => expect(screen.willReplace).to.be.false
        );
      });

      it('should list all of the screens as having no assets to replace', () => {
        importable.screens.forEach(
          screen => expect(screen.assetsToReplace).to.deep.equal([])
        );
      });

      it('should list all of the screens as having no assets to import', () => {
        importable.screens.forEach(
          screen => expect(screen.assetsToImport).to.deep.equal([])
        );
      });

      it('should list all of the screens as having no conflicting element ids', () => {
        importable.screens.forEach(
          screen => expect(screen.assetsToReplace).to.deep.equal([])
        );
      });

      it('should have an empty otherAssets', () => {
        expect(importable.otherAssets).to.be.empty;
      });

    });

    describe('When doing an import into a project with conflicting screens, the importable project', () => {
      var importable;
      beforeEach(() => {
        setExistingHTML(`
          <div class="screen" id="design_screen1"></div>
        `);
        importable = getImportableProject(
          getProjectWithHTML(`
            <div class="screen" id="screen1"></div>
            <div class="screen" id="screen2"></div>
          `)
        );
      });

      it('should mark the conflicting screen id with willReplace=True', () => {
        expect(importable.screens[0].willReplace).to.be.true;
        expect(importable.screens[1].willReplace).to.be.false;
      });
    });

    describe('When doing an import into a project with conflicting assets, the importable project', () => {
      var importable;
      beforeEach(() => {
        setExistingHTML(`
          <div class="screen" id="design_screen1">
            <img src="/v3/assets/some-project/asset1.png"
                 data-canonical-image-url="asset1.png"
                 id="design_img1">
          </div>
        `);
        importable = getImportableProject({
          channel: {
            name: 'Some Other Project!',
            id: 'some-other-project',
          },
          sources: {
            html: `
              <div>
                <div
                  class="screen"
                  id="screen1"
                  data-canonical-image-url="background-asset.png"
                  style="background-image: url("/v2/assets/some-other-project/background-asset.png")">
                  <img src="/v3/assets/some-other-project/asset1.png"
                       data-canonical-image-url="asset1.png"
                       id="img2">
                  <img src="/v3/assets/some-other-project/asset2.png"
                       data-canonical-image-url="asset2.png"
                       id="img3">
                </div>
                <div class="screen" id="screen2"></div>
              </div>`,
          },
          assets: [
            {filename: 'asset1.png', category: 'image'},
            {filename: 'asset2.png', category: 'image'},
            {filename: 'asset3.png', category: 'image'},
            {filename: 'asset4.png', category: 'image'},
            {filename: 'background-asset.png', category: 'image'},
          ],
          existingAssets: [
            {filename: 'asset1.png', category: 'image'},
            {filename: 'asset3.png', category: 'image'},
          ]
        });
      });

      it('should list the assets to replace', () => {
        expect(importable.screens[0].assetsToReplace).to.deep.equal(['asset1.png']);
      });

      it('should list the assets to import without replacing', () => {
        expect(importable.screens[0].assetsToImport).to.deep.equal([
          'asset2.png',
          'background-asset.png',
        ]);
      });

      it('should list the other assets not used in the screens', () => {
        expect(importable.otherAssets).to.have.length(2);
        expect(importable.otherAssets[0].filename).to.equal('asset3.png');
        expect(importable.otherAssets[0].category).to.equal('image');
        expect(importable.otherAssets[0].willReplace).to.be.true;
        expect(importable.otherAssets[1].filename).to.equal('asset4.png');
        expect(importable.otherAssets[1].category).to.equal('image');
        expect(importable.otherAssets[1].willReplace).to.be.false;
      });
    });

    describe('When doing an import into a project that uses the same element IDs, the importable project', () => {
      var importable;
      beforeEach(() => {
        setExistingHTML(`
          <div class="screen" id="design_screen1">
            <input id="design_input1">
            <input id="design_input2">
          </div>
        `);
        importable = getImportableProject(
          getProjectWithHTML(`
            <div class="screen" id="screen1">
              <input id="input1">
            </div>
            <div class="screen" id="screen2">
              <input id="input2">
            </div>
            <div class="screen" id="screen3">
              <input id="input3">
            </div>
          `)
        );
      });

      it('should mark the screens with the conflicting element IDs as not importable', () => {
        expect(importable.screens[0].canBeImported).to.be.true;
        expect(importable.screens[1].canBeImported).to.be.false;
        expect(importable.screens[2].canBeImported).to.be.true;
      });

      it('should include the list of conflicting element ids.', () => {
        // note that screen2 has conflicting ids, even though in theory
        // screen1 resolves that conflict since it replaces the destination screen causing
        // the conflict. We explicitly choose not to handle that logic automatically.
        expect(importable.screens[0].conflictingIds).to.deep.equal([]);
        expect(importable.screens[1].conflictingIds).to.deep.equal(['input2']);
        expect(importable.screens[2].conflictingIds).to.deep.equal([]);
      });
    });

  });

  describe('The importScreensAndAssets function', () => {
    it("will add the specified screens", () => {
      setExistingHTML(``);
      var project = getImportableProject(
        getProjectWithHTML(`
          <div class="screen" id="screen1"></div>
          <div class="screen" id="screen2"></div>
        `)
      );
      expect(designMode.getAllScreenIds()).to.deep.equal([]);
      importScreensAndAssets(project.id, [project.screens[0]], []);
      expect(designMode.getAllScreenIds()).to.deep.equal(['screen1']);
      importScreensAndAssets(project.id, [project.screens[1]], []);
      expect(designMode.getAllScreenIds()).to.deep.equal(['screen1', 'screen2']);
    });

    it("will replace screens with the same screen id", () => {
      setExistingHTML(`
        <div class="screen" id="design_screen1">
          <input id="design_input1">
        </div>
      `);
      var project = getImportableProject(
        getProjectWithHTML(`
          <div class="screen" id="screen1">
            <input id="importedInput">
          </div>
          <div class="screen" id="screen2"></div>
        `)
      );
      expect(designMode.getAllScreenIds()).to.deep.equal(['screen1']);
      expect(elementUtils.getPrefixedElementById('input1')).not.to.be.null;
      expect(elementUtils.getPrefixedElementById('importedInput')).to.be.null;
      importScreensAndAssets(project.id, [project.screens[0]], []);
      expect(designMode.getAllScreenIds()).to.deep.equal(['screen1']);
      expect(elementUtils.getPrefixedElementById('input1')).to.be.null;
      expect(elementUtils.getPrefixedElementById('importedInput')).not.to.be.null;
    });

    it("can run through the same import twice without getting conflicts", () => {
      setExistingHTML(`
        <div class="screen" id="design_screen1">
          <input id="design_input1">
        </div>
      `);
      var project = getImportableProject(
        getProjectWithHTML(`
          <div class="screen" id="screen1">
            <input id="importedInput">
          </div>
          <div class="screen" id="screen2">
            <input id="importedInput2">
            <input id="importedInput3">
          </div>
        `)
      );
      expect(designMode.getAllScreenIds()).to.deep.equal(['screen1']);
      expect(elementUtils.getPrefixedElementById('input1')).not.to.be.null;
      expect(elementUtils.getPrefixedElementById('importedInput')).to.be.null;
      expect(elementUtils.getPrefixedElementById('importedInput2')).to.be.null;
      expect(elementUtils.getPrefixedElementById('importedInput3')).to.be.null;
      importScreensAndAssets(project.id, [project.screens[0], project.screens[1]], []);
      expect(designMode.getAllScreenIds()).to.deep.equal(['screen1', 'screen2']);
      expect(elementUtils.getPrefixedElementById('input1')).to.be.null;
      expect(elementUtils.getPrefixedElementById('importedInput')).not.to.be.null;
      expect(elementUtils.getPrefixedElementById('importedInput2')).not.to.be.null;
      expect(elementUtils.getPrefixedElementById('importedInput3')).not.to.be.null;

      project = getImportableProject(
        getProjectWithHTML(`
          <div class="screen" id="screen1">
            <input id="importedInput">
          </div>
          <div class="screen" id="screen2">
            <input id="importedInput2">
            <input id="importedInput3">
          </div>
        `)
      );
      expect(project.screens[0].conflictingIds).to.deep.equal([]);
      expect(project.screens[1].conflictingIds).to.deep.equal([]);
    });

    describe('when replacing assets in imported screens', () => {
      var project, onResolve, onReject, promise;
      beforeEach(() => {
        setExistingHTML(`
        <div class="screen" id="design_screen1">
          <input id="design_input1">
          <img src="/v3/assets/some-project/asset1.png"
               data-canonical-image-url="asset1.png"
               id="design_img1">
        </div>
        `);
        project = getImportableProject(
          getProjectWithHTML(`
          <div class="screen" id="screen1">
            <input id="importedInput">
            <img src="/v3/assets/some-other-project/asset1.png"
                 data-canonical-image-url="asset1.png"
                 id="img1">
            <img src="/v3/assets/some-other-project/asset2.png"
                 data-canonical-image-url="asset2.png"
                 id="img2">
          </div>
          <div class="screen" id="screen2"></div>
        `)
        );
        onResolve = sinon.spy();
        onReject = sinon.spy();
        promise = importScreensAndAssets(
          project.id,
          [project.screens[0], project.screens[1]],
          [{filename: 'asset3.png'}, {filename: 'asset4.png'}]
        ).then(onResolve, onReject);
      });

      it('will import the specified screens', () => {
        var [,, success] = assetsApi.copyAssets.lastCall.args;
        success();
        expect(designMode.getAllScreenIds()).to.deep.equal(['screen1', 'screen2']);
        expect(elementUtils.getPrefixedElementById('input1')).to.be.null;
        expect(elementUtils.getPrefixedElementById('importedInput')).not.to.be.null;
        expect(elementUtils.getPrefixedElementById('img1')).not.to.be.null;
      });

      it("will copy the assets that are going to be replaced", () => {
        expect(assetsApi.copyAssets).to.have.been.called;
        var [projectId, allAssetsToReplace] = assetsApi.copyAssets.firstCall.args;
        expect(projectId).to.equal(project.id);
        expect(allAssetsToReplace).to.have.members(
          ['asset1.png', 'asset2.png', 'asset3.png', 'asset4.png']
        );
      });

      it('will call resolve if the operation was successful', () => {
        var [,, success] = assetsApi.copyAssets.lastCall.args;
        expect(onResolve).not.to.have.been.called;
        success();
        return promise.then(() => {
          expect(onResolve.called).to.be.true;
          expect(onReject).not.to.have.been.called;
        });
      });

      it('will call reject if the operation was not successful', () => {
        var [,,, failure] = assetsApi.copyAssets.lastCall.args;
        expect(onReject).not.to.have.been.called;
        failure();
        return promise.then(() => {
          expect(onResolve).not.to.have.been.called;
          expect(onReject).to.have.been.called;
        });
      });

    });

  });

});
