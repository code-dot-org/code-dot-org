/* eslint no-unused-vars: "error" */
import sinon from 'sinon';
import {expect} from '../../util/configuredChai';
import designMode from '@cdo/apps/applab/designMode';
import {assets as assetsApi} from '@cdo/apps/clientApi';

import {getImportableProject} from '@cdo/apps/applab/import';

describe("The applab/import module", () => {
  var designModeViz;

  beforeEach(() => {
    designModeViz = document.createElement('div');
    designModeViz.id = "designModeViz";
    document.body.appendChild(designModeViz);
    sinon.stub(designMode, 'changeScreen');
    sinon.stub(assetsApi, 'copyAssets');
  });

  afterEach(() => {
    designModeViz.parentNode.removeChild(designModeViz);
    designMode.changeScreen.restore();
    assetsApi.copyAssets.restore();
  });

  function getProjectWithHTML(toImport) {
    return {
      channel: {
        name: 'Some Other Project!',
        id: 'some-other-project',
      },
      sources: {
        html: `<div>${toImport}</div>`,
      },
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

      it('should list all of the screens as having no conflicting element ids', () => {
        importable.screens.forEach(
          screen => expect(screen.assetsToReplace).to.deep.equal([])
        );
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
        importable = getImportableProject(
          getProjectWithHTML(`
            <div class="screen" id="screen1">
              <img src="/v3/assets/some-other-project/asset1.png"
                   data-canonical-image-url="asset1.png"
                   id="img2">
            </div>
            <div class="screen" id="screen2"></div>
          `)
        );
      });

      it('should list the assets to replace', () => {
        expect(importable.screens[0].assetsToReplace).to.deep.equal(['asset1.png']);
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
        // screen1 resolves that conflict since it replaces the destinate screen causing
        // the conflict. We explicitly choose not to handle that logic automatically.
        expect(importable.screens[0].conflictingIds).to.deep.equal([]);
        expect(importable.screens[1].conflictingIds).to.deep.equal(['input2']);
        expect(importable.screens[2].conflictingIds).to.deep.equal([]);
      });
    });

  });

});
