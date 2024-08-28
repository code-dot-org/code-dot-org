/* eslint no-unused-vars: "error" */
import * as elementUtils from '@cdo/apps/applab/designElements/elementUtils';
import designMode from '@cdo/apps/applab/designMode';
import {
  getImportableProject,
  importScreensAndAssets,
} from '@cdo/apps/applab/import';
import {assets as assetsApi} from '@cdo/apps/clientApi';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';
import pageConstantsReducer, {
  setPageConstants,
} from '@cdo/apps/redux/pageConstants';

import {allowConsoleErrors} from '../../util/testUtils';

$.fn.disableSelection = jest.fn();

describe('The applab/import module', () => {
  allowConsoleErrors();
  var designModeViz;

  beforeEach(() => {
    designModeViz = document.createElement('div');
    designModeViz.id = 'designModeViz';
    document.body.appendChild(designModeViz);
    jest.spyOn(designMode, 'changeScreen').mockClear().mockImplementation();
    jest.spyOn(designMode, 'resetPropertyTab').mockClear().mockImplementation();
    jest.spyOn(assetsApi, 'copyAssets').mockClear().mockImplementation();
  });

  afterEach(() => {
    designModeViz.parentNode.removeChild(designModeViz);
    designMode.changeScreen.mockRestore();
    designMode.resetPropertyTab.mockRestore();
    assetsApi.copyAssets.mockRestore();
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

      it('should have an id and name property pulled from the channel', () => {
        expect(importable.id).toBe('some-other-project');
        expect(importable.name).toBe('Some Other Project!');
      });

      it('should contain both of the screens in the given html', () => {
        expect(importable.screens).toHaveLength(2);
        expect(importable.screens[0].id).toBe('screen1');
        expect(importable.screens[1].id).toBe('screen2');
      });

      it('should list all of the screens as importable', () => {
        importable.screens.forEach(screen =>
          expect(screen.canBeImported).toBe(true)
        );
      });

      it('should list all of the screens as not replacing existing screens', () => {
        importable.screens.forEach(screen =>
          expect(screen.willReplace).toBe(false)
        );
      });

      it('should list all of the screens as having no assets to replace', () => {
        importable.screens.forEach(screen =>
          expect(screen.assetsToReplace).toEqual([])
        );
      });

      it('should list all of the screens as having no assets to import', () => {
        importable.screens.forEach(screen =>
          expect(screen.assetsToImport).toEqual([])
        );
      });

      it('should list all of the screens as having no conflicting element ids', () => {
        importable.screens.forEach(screen =>
          expect(screen.assetsToReplace).toEqual([])
        );
      });

      it('should have an empty otherAssets', () => {
        expect(importable.otherAssets).toHaveLength(0);
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
        expect(importable.screens[0].willReplace).toBe(true);
        expect(importable.screens[1].willReplace).toBe(false);
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
          ],
        });
      });

      it('should list the assets to replace', () => {
        expect(importable.screens[0].assetsToReplace).toEqual(['asset1.png']);
      });

      it('should list the assets to import without replacing', () => {
        expect(importable.screens[0].assetsToImport).toEqual([
          'asset2.png',
          'background-asset.png',
        ]);
      });

      it('should list the other assets not used in the screens', () => {
        expect(importable.otherAssets).toHaveLength(2);
        expect(importable.otherAssets[0].filename).toBe('asset3.png');
        expect(importable.otherAssets[0].category).toBe('image');
        expect(importable.otherAssets[0].willReplace).toBe(true);
        expect(importable.otherAssets[1].filename).toBe('asset4.png');
        expect(importable.otherAssets[1].category).toBe('image');
        expect(importable.otherAssets[1].willReplace).toBe(false);
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
        expect(importable.screens[0].canBeImported).toBe(true);
        expect(importable.screens[1].canBeImported).toBe(false);
        expect(importable.screens[2].canBeImported).toBe(true);
      });

      it('should include the list of conflicting element ids.', () => {
        // note that screen2 has conflicting ids, even though in theory
        // screen1 resolves that conflict since it replaces the destination screen causing
        // the conflict. We explicitly choose not to handle that logic automatically.
        expect(importable.screens[0].conflictingIds).toEqual([]);
        expect(importable.screens[1].conflictingIds).toEqual(['input2']);
        expect(importable.screens[2].conflictingIds).toEqual([]);
      });
    });
  });

  describe('The importScreensAndAssets function', () => {
    it('will add the specified screens', () => {
      setExistingHTML(``);
      var project = getImportableProject(
        getProjectWithHTML(`
          <div class="screen" id="screen1"></div>
          <div class="screen" id="screen2"></div>
        `)
      );
      expect(designMode.getAllScreenIds()).toEqual([]);
      importScreensAndAssets(project.id, [project.screens[0]], []);
      expect(designMode.getAllScreenIds()).toEqual(['screen1']);
      importScreensAndAssets(project.id, [project.screens[1]], []);
      expect(designMode.getAllScreenIds()).toEqual(['screen1', 'screen2']);
    });

    it('will replace screens with the same screen id', async () => {
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
      expect(designMode.getAllScreenIds()).toEqual(['screen1']);
      expect(elementUtils.getPrefixedElementById('input1')).not.toBeNull();
      expect(elementUtils.getPrefixedElementById('importedInput')).toBeNull();
      await importScreensAndAssets(project.id, [project.screens[0]], []);
      expect(designMode.getAllScreenIds()).toEqual(['screen1']);
      expect(elementUtils.getPrefixedElementById('input1')).toBeNull();
      expect(
        elementUtils.getPrefixedElementById('importedInput')
      ).not.toBeNull();
    });

    it('can run through the same import twice without getting conflicts', () => {
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
      expect(designMode.getAllScreenIds()).toEqual(['screen1']);
      expect(elementUtils.getPrefixedElementById('input1')).not.toBeNull();
      expect(elementUtils.getPrefixedElementById('importedInput')).toBeNull();
      expect(elementUtils.getPrefixedElementById('importedInput2')).toBeNull();
      expect(elementUtils.getPrefixedElementById('importedInput3')).toBeNull();
      importScreensAndAssets(
        project.id,
        [project.screens[0], project.screens[1]],
        []
      );
      expect(designMode.getAllScreenIds()).toEqual(['screen1', 'screen2']);
      expect(elementUtils.getPrefixedElementById('input1')).toBeNull();
      expect(
        elementUtils.getPrefixedElementById('importedInput')
      ).not.toBeNull();
      expect(
        elementUtils.getPrefixedElementById('importedInput2')
      ).not.toBeNull();
      expect(
        elementUtils.getPrefixedElementById('importedInput3')
      ).not.toBeNull();

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
      expect(project.screens[0].conflictingIds).toEqual([]);
      expect(project.screens[1].conflictingIds).toEqual([]);
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
        onResolve = jest.fn();
        onReject = jest.fn();
        promise = importScreensAndAssets(
          project.id,
          [project.screens[0], project.screens[1]],
          [{filename: 'asset3.png'}, {filename: 'asset4.png'}]
        ).then(onResolve, onReject);
        stubRedux();
        registerReducers({pageConstants: pageConstantsReducer});
        getStore().dispatch(
          setPageConstants({
            isCurriculumLevel: true,
          })
        );
      });

      afterEach(() => {
        restoreRedux();
      });

      it('will import the specified screens', () => {
        var [, , success] = assetsApi.copyAssets.mock.lastCall;
        success();
        expect(designMode.getAllScreenIds()).toEqual(['screen1', 'screen2']);
        expect(elementUtils.getPrefixedElementById('input1')).toBeNull();
        expect(
          elementUtils.getPrefixedElementById('importedInput')
        ).not.toBeNull();
        expect(elementUtils.getPrefixedElementById('img1')).not.toBeNull();
      });

      it('will copy the assets that are going to be replaced', () => {
        expect(assetsApi.copyAssets).toHaveBeenCalled();
        var [projectId, allAssetsToReplace] =
          assetsApi.copyAssets.mock.calls[0];
        expect(projectId).toBe(project.id);
        expect(allAssetsToReplace).toEqual(
          expect.arrayContaining([
            'asset1.png',
            'asset2.png',
            'asset3.png',
            'asset4.png',
          ])
        );
      });

      it('will call resolve if the operation was successful', () => {
        var [, , success] = assetsApi.copyAssets.mock.lastCall;
        expect(onResolve).not.toHaveBeenCalled();
        success();
        return promise.then(() => {
          expect(onResolve).toHaveBeenCalled();
          expect(onReject).not.toHaveBeenCalled();
        });
      });

      it('will call reject if the operation was not successful', () => {
        var [, , , failure] = assetsApi.copyAssets.mock.lastCall;
        expect(onReject).not.toHaveBeenCalled();
        failure();
        return promise.then(() => {
          expect(onResolve).not.toHaveBeenCalled();
          expect(onReject).toHaveBeenCalled();
        });
      });
    });
  });
});
