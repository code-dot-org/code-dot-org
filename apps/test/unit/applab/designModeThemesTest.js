import sinon from 'sinon';
import {expect} from '../../util/reconfiguredChai';
import {themeOptions, DEFAULT_THEME_INDEX} from '@cdo/apps/applab/constants';
import designMode from '@cdo/apps/applab/designMode';
import {getPrefixedElementById} from '@cdo/apps/applab/designElements/elementUtils';
import elementLibrary from '@cdo/apps/applab/designElements/library';
import {singleton as studioApp} from '@cdo/apps/StudioApp';

describe('themes: ', () => {
  let designModeViz;

  beforeEach(() => {
    designModeViz = document.createElement('div');
    designModeViz.id = 'designModeViz';
    document.body.appendChild(designModeViz);
    sinon.stub(designMode, 'renderDesignWorkspace');
  });

  afterEach(() => {
    designModeViz.parentNode.removeChild(designModeViz);
    designMode.renderDesignWorkspace.restore();
  });

  function setExistingHTML(existingHTML) {
    designModeViz.innerHTML = existingHTML;
  }

  describe('getCurrentTheme: ', () => {
    it('will treat a screen without the data-theme attribute as the default theme', () => {
      setExistingHTML(`
        <div class="screen" id="design_screen1">
        </div>
      `);

      expect(
        elementLibrary.getCurrentTheme(getPrefixedElementById('screen1'))
      ).to.equal('default');
    });
  });

  describe('changeThemeForScreen: ', () => {
    it('will throw when an invalid theme name is supplied', () => {
      setExistingHTML(`
        <div class="screen" id="design_screen1">
        </div>
      `);

      expect(() => {
        designMode.changeThemeForScreen(
          getPrefixedElementById('screen1'),
          'randomInvalidThemeName'
        );
      }).to.throw;
    });

    it('will change a legacy screen without the data-theme attribute', () => {
      setExistingHTML(`
        <div class="screen" id="design_screen1">
        </div>
      `);

      // Change theme to watermelon, verify that the screen now has the data-theme attribute
      // and the background color for that theme:
      designMode.changeThemeForScreen(
        getPrefixedElementById('screen1'),
        'watermelon'
      );
      expect(getPrefixedElementById('screen1')).not.to.be.null;
      expect(
        getPrefixedElementById('screen1').getAttribute('data-theme')
      ).to.equal('watermelon');
      expect(getPrefixedElementById('screen1').style.backgroundColor).to.equal(
        'rgb(197, 226, 85)'
      );
    });

    it('will change a default theme screen', () => {
      setExistingHTML(`
        <div class="screen" id="design_screen1" data-theme="default" style="background-color: rgb(255, 255, 255);">
        </div>
      `);

      // Change theme to watermelon, verify that the screen now has an updated data-theme attribute
      // and the background color for that theme:
      designMode.changeThemeForScreen(
        getPrefixedElementById('screen1'),
        'watermelon'
      );
      expect(getPrefixedElementById('screen1')).not.to.be.null;
      expect(
        getPrefixedElementById('screen1').getAttribute('data-theme')
      ).to.equal('watermelon');
      expect(getPrefixedElementById('screen1').style.backgroundColor).to.equal(
        'rgb(197, 226, 85)'
      );
    });

    it("will call renderDesignWorkspace after changing a screen's theme", () => {
      setExistingHTML(`
        <div class="screen" id="design_screen1" data-theme="default" style="background-color: rgb(255, 255, 255);">
        </div>
      `);

      // Change theme to watermelon:
      designMode.changeThemeForScreen(
        getPrefixedElementById('screen1'),
        'watermelon'
      );
      expect(designMode.renderDesignWorkspace).to.have.been.called;
    });

    it("will not call renderDesignWorkspace after changing a screen's theme if no theme props should be applied", () => {
      // customized background color
      setExistingHTML(`
        <div class="screen" id="design_screen1" data-theme="default" style="background-color: rgb(1, 2, 3);">
        </div>
      `);

      // Change theme to watermelon:
      designMode.changeThemeForScreen(
        getPrefixedElementById('screen1'),
        'default'
      );
      expect(designMode.renderDesignWorkspace).to.not.have.been.called;
    });

    it('will change a child of a legacy screen without the data-theme attribute', () => {
      setExistingHTML(`
        <div class="screen" id="design_screen1">
          <input id="design_text_input1">
        </div>
      `);

      // Change theme to default, verify that the screen now has the data-theme attribute
      // and the textInput now has the padding style and the background color of the new theme:
      designMode.changeThemeForScreen(
        getPrefixedElementById('screen1'),
        themeOptions[DEFAULT_THEME_INDEX]
      );
      expect(getPrefixedElementById('screen1')).not.to.be.null;
      expect(
        getPrefixedElementById('screen1').getAttribute('data-theme')
      ).to.equal(themeOptions[DEFAULT_THEME_INDEX]);
      expect(getPrefixedElementById('text_input1')).not.to.be.null;
      expect(getPrefixedElementById('text_input1').style.padding).to.equal(
        '5px 15px'
      );
      expect(
        getPrefixedElementById('text_input1').style.backgroundColor
      ).to.equal('rgb(242, 242, 242)');
    });

    it('will change from an invalid theme name screen into a valid theme', () => {
      // Construct an existing screen with an invalid unknownThemeName value
      // in the data-theme attribute:
      setExistingHTML(`
        <div class="screen" id="design_screen1" data-theme="unknownThemeName">
          <input id="design_text_input1">
        </div>
      `);

      // Change theme to default, verify that the screen now has an updated data-theme attribute
      // and the textInput now has the padding style and the background color of the new theme:
      designMode.changeThemeForScreen(
        getPrefixedElementById('screen1'),
        'watermelon'
      );
      expect(getPrefixedElementById('screen1')).not.to.be.null;
      expect(
        getPrefixedElementById('screen1').getAttribute('data-theme')
      ).to.equal('watermelon');
      expect(getPrefixedElementById('text_input1')).not.to.be.null;
      expect(getPrefixedElementById('text_input1').style.padding).to.equal(
        '5px 15px'
      );
      expect(
        getPrefixedElementById('text_input1').style.backgroundColor
      ).to.equal('rgb(226, 240, 170)');
    });

    it('will change a child of a default theme screen', () => {
      setExistingHTML(`
        <div class="screen" id="design_screen1" data-theme="default" style="background-color: rgb(255, 255, 255);">
          <input id="design_text_input1" style="margin: 0px; width: 200px; height: 30px; border-style: solid; background-color: rgb(242, 242, 242); border-radius: 4px; border-width: 1px; border-color: rgb(77, 87, 95); color: rgb(77, 87, 95); font-family: Arial, Helvetica, sans-serif; font-size: 13px; padding: 5px 15px; position: static; left: 25px; top: 25px;">
        </div>
      `);

      // Change theme to watermelon, verify that the screen now has an updated data-theme attribute
      // and the textInput now has the padding style and the background color of the new theme:
      designMode.changeThemeForScreen(
        getPrefixedElementById('screen1'),
        'watermelon'
      );
      expect(getPrefixedElementById('screen1')).not.to.be.null;
      expect(
        getPrefixedElementById('screen1').getAttribute('data-theme')
      ).to.equal('watermelon');
      expect(getPrefixedElementById('text_input1')).not.to.be.null;
      expect(getPrefixedElementById('text_input1').style.padding).to.equal(
        '5px 15px'
      );
      expect(
        getPrefixedElementById('text_input1').style.backgroundColor
      ).to.equal('rgb(226, 240, 170)');
    });

    it('will not change a customized, non-default property', () => {
      setExistingHTML(`
        <div class="screen" id="design_screen1">
          <input id="design_text_input1">
        </div>
      `);
      const inputElement = getPrefixedElementById('text_input1');

      designMode.updateProperty(inputElement, 'backgroundColor', 'rgb(1,2,3)');
      expect(inputElement.style.backgroundColor).to.equal('rgb(1, 2, 3)');

      // Change theme to default
      designMode.changeThemeForScreen(
        getPrefixedElementById('screen1'),
        themeOptions[DEFAULT_THEME_INDEX]
      );
      expect(inputElement.style.backgroundColor).to.equal('rgb(1, 2, 3)');
    });

    it('will change an empty string property', () => {
      setExistingHTML(`
        <div class="screen" id="design_screen1">
          <input id="design_text_input1">
        </div>
      `);
      const inputElement = getPrefixedElementById('text_input1');

      // Update the input background color to an empty string:
      designMode.updateProperty(inputElement, 'backgroundColor', '');
      expect(inputElement.style.backgroundColor).to.equal('');

      // Change theme to default
      designMode.changeThemeForScreen(
        getPrefixedElementById('screen1'),
        themeOptions[DEFAULT_THEME_INDEX]
      );
      // Input background color should now be the default value:
      expect(inputElement.style.backgroundColor).to.equal('rgb(242, 242, 242)');
    });

    it('will change an alternate syntax background color property that matches the default', () => {
      setExistingHTML(`
        <div class="screen" id="design_screen1" style="background-color: #F2F2F2;">
        </div>
      `);
      const screen = getPrefixedElementById('screen1');

      // Change theme to watermelon
      designMode.changeThemeForScreen(screen, 'watermelon');
      // Screen background color should now be the default value:
      expect(screen.style.backgroundColor).to.equal('rgb(242, 242, 242)');
    });

    it('will not change an alternate syntax background color property that does not match the default', () => {
      setExistingHTML(`
        <div class="screen" id="design_screen1" style="background-color: #ABCDEF;">
        </div>
      `);
      const screen = getPrefixedElementById('screen1');
      // Screen background color should be the rgb() equivalent of the hex color:
      expect(screen.style.backgroundColor).to.equal('rgb(171, 205, 239)');

      // Change theme to watermelon
      designMode.changeThemeForScreen(screen, 'watermelon');
      // Screen background color should be unchanged:
      expect(screen.style.backgroundColor).to.equal('rgb(171, 205, 239)');
    });

    it("will not change a customization, and will not change it later if the value matches an intermediate theme's default", () => {
      setExistingHTML(`
        <div class="screen" id="design_screen1" data-theme="default" style="background-color: rgb(255, 255, 255);">
        </div>
      `);

      const screen = getPrefixedElementById('screen1');

      // Customize the background color to match the watermelon background color
      designMode.updateProperty(screen, 'backgroundColor', 'rgb(197,226,85)');
      expect(screen.style.backgroundColor).to.equal('rgb(197, 226, 85)');

      // Change theme to watermelon, verify that the screen now has an updated data-theme attribute
      // and the background color is unchanged:
      designMode.changeThemeForScreen(screen, 'watermelon');
      expect(screen.getAttribute('data-theme')).to.equal('watermelon');
      expect(screen.style.backgroundColor).to.equal('rgb(197, 226, 85)');

      // Change theme to area51, verify that the screen now has an updated data-theme attribute
      // and the background color is still unchanged (even though it had matched the watermelon
      // theme's default background color):
      designMode.changeThemeForScreen(screen, 'area51');
      expect(screen.getAttribute('data-theme')).to.equal('area51');
      expect(screen.style.backgroundColor).to.equal('rgb(197, 226, 85)');
    });
  });

  describe('onCopyElementToScreen', () => {
    beforeEach(() => {
      sinon.stub(designMode, 'changeScreen').callsFake(screenId => {
        // Manually change the screen with a fake to avoid pulling in redux, Applab, etc.
        designMode.activeScreen().style.display = 'none';
        getPrefixedElementById(screenId).style.display = 'block';
      });
      sinon.stub(studioApp(), 'displayPlayspaceAlert');
    });

    afterEach(() => {
      designMode.changeScreen.restore();
      studioApp().displayPlayspaceAlert.restore();
    });

    it('copies element from a screen with one theme to a screen with a different theme', () => {
      setExistingHTML(`
        <div class="screen" id="design_screen1" data-theme="default" style="display:block; background-color: rgb(255, 255, 255);">
          <input id="design_text_input1" style="margin: 0px; width: 200px; height: 30px; border-style: solid; background-color: rgb(242, 242, 242); border-radius: 4px; border-width: 1px; border-color: rgb(77, 87, 95); color: rgb(77, 87, 95); font-family: Arial, Helvetica, sans-serif; font-size: 13px; padding: 5px 15px; position: static; left: 25px; top: 25px;">
        </div>
        <div class="screen" id="design_screen2" data-theme="watermelon" style="display:none; background-color: rgb(197, 226, 85);">
        </div>
      `);

      designMode.onCopyElementToScreen(
        getPrefixedElementById('text_input1'),
        'screen2'
      );

      expect(designMode.changeScreen).to.be.called;
      expect(studioApp().displayPlayspaceAlert).to.be.called;

      expect(getPrefixedElementById('text_input2')).not.to.be.null;
      // Should have the background color appropriate for the theme of screen2 (watermelon)
      expect(
        getPrefixedElementById('text_input2').style.backgroundColor
      ).to.equal('rgb(226, 240, 170)');
    });
  });

  describe('onRestoreThemeDefaults', () => {
    let updatePropertySpy;
    beforeEach(() => {
      updatePropertySpy = sinon.spy(designMode, 'updateProperty');
    });

    afterEach(() => {
      updatePropertySpy.restore();
    });

    it('onRestoreThemeDefaults will not call updateProperty if properties already match theme defaults', () => {
      setExistingHTML(`
        <div class="screen" id="design_screen1" data-theme="default" style="background-color: rgb(255, 255, 255);">
        </div>
      `);

      designMode.onRestoreThemeDefaults(getPrefixedElementById('screen1'));

      expect(updatePropertySpy).to.not.have.been.called;
    });

    it('onRestoreThemeDefaults will restore background color to theme default if it does match', () => {
      setExistingHTML(`
        <div class="screen" id="design_screen1" data-theme="default" style="background-color: rgb(0, 0, 0);">
        </div>
      `);

      const screen = getPrefixedElementById('screen1');

      designMode.onRestoreThemeDefaults(screen);

      expect(updatePropertySpy).to.have.been.called;
      expect(screen.style.backgroundColor).to.equal('rgb(255, 255, 255)');
    });

    it('onRestoreThemeDefaults will remove data-mod attribute when properties are restored', () => {
      setExistingHTML(`
        <div class="screen" id="design_screen1" data-theme="default" data-mod-backgroundcolor="1" style="background-color: rgb(0, 0, 0);">
        </div>
      `);

      const screen = getPrefixedElementById('screen1');

      expect(screen.getAttribute('data-mod-backgroundcolor')).to.equal('1');

      designMode.onRestoreThemeDefaults(screen);

      expect(updatePropertySpy).to.have.been.called;
      expect(screen.getAttribute('data-mod-backgroundcolor')).to.be.null;
    });

    it('onRestoreThemeDefaults will remove data-mod attribute even when properties do not need to be changed', () => {
      setExistingHTML(`
        <div class="screen" id="design_screen1" data-theme="default" data-mod-backgroundcolor="1" style="background-color: rgb(255, 255, 255);">
        </div>
      `);

      const screen = getPrefixedElementById('screen1');

      expect(screen.getAttribute('data-mod-backgroundcolor')).to.equal('1');

      designMode.onRestoreThemeDefaults(screen);

      expect(updatePropertySpy).to.not.have.been.called;
      expect(screen.getAttribute('data-mod-backgroundcolor')).to.be.null;
    });
  });
});
