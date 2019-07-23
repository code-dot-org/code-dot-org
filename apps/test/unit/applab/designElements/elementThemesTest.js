import RGBColor from 'rgbcolor';
import {expect} from '../../../util/reconfiguredChai';

import library from '@cdo/apps/applab/designElements/library';
import {themeOptions, fontFamilyOptions} from '@cdo/apps/applab/constants';

describe('Applab designElements/elementThemes', () => {
  function expectValidFontFamilyThemeValue(element) {
    const elementThemeValues = library.getThemeValues(element);
    const themeValue = elementThemeValues.fontFamily;
    it(`${library.getElementType(
      element
    )} has proper fontFamily theme values`, () => {
      expect(themeValue).to.exist;
      themeOptions.forEach(themeName => {
        expect(themeValue[themeName]).to.exist;
        expect(fontFamilyOptions.includes(themeValue[themeName])).to.be.true;
      });
    });
  }

  function expectValidPaddingThemeValue(element) {
    const elementThemeValues = library.getThemeValues(element);
    const themeValue = elementThemeValues.padding;
    it(`${library.getElementType(
      element
    )} has proper padding theme values`, () => {
      expect(themeValue).to.exist;
      themeOptions.forEach(themeName => {
        expect(themeValue[themeName]).to.exist;
        expect(typeof themeValue[themeName]).to.equal('string');
      });
    });
  }

  function expectValidColorThemeValue(element, propName) {
    const elementThemeValues = library.getThemeValues(element);
    const themeValue = elementThemeValues[propName];
    it(`${library.getElementType(
      element
    )} has proper ${propName} theme values`, () => {
      expect(themeValue).to.exist;
      expect(themeValue.type).to.equal('color');
      themeOptions.forEach(themeName => {
        expect(themeValue[themeName]).to.exist;
        const color = new RGBColor(themeValue[themeName]);
        expect(color.ok).to.be.true;
      });
    });
  }

  function expectAllValidColorThemeValues(element) {
    const colorPropNames = ['backgroundColor', 'borderColor', 'textColor'];
    colorPropNames.forEach(propName =>
      expectValidColorThemeValue(element, propName)
    );
  }

  function expectValidSizeThemeValue(element, propName) {
    const elementThemeValues = library.getThemeValues(element);
    const themeValue = elementThemeValues[propName];
    it(`${library.getElementType(
      element
    )} has proper ${propName} theme values`, () => {
      expect(themeValue).to.exist;
      themeOptions.forEach(themeName => {
        expect(themeValue[themeName]).to.exist;
        expect(typeof themeValue[themeName]).to.equal('number');
      });
    });
  }

  function expectAllValidSizeThemeValues(element) {
    const sizePropNames = ['borderRadius', 'borderWidth', 'fontSize'];
    sizePropNames.forEach(propName =>
      expectValidSizeThemeValue(element, propName)
    );
  }

  function expectElementHasAllValidThemeValues(
    elementType,
    includePadding = true
  ) {
    const element = library.createElement(elementType, 0, 0, true);
    expectAllValidColorThemeValues(element);
    expectAllValidSizeThemeValues(element);
    expectValidFontFamilyThemeValue(element);
    if (includePadding) {
      expectValidPaddingThemeValue(element);
    }
  }

  describe('screen elements', () => {
    it('screen has proper background color theme values', () => {
      const screen = library.createElement(
        library.ElementType.SCREEN,
        0,
        0,
        true
      );
      expectValidColorThemeValue(screen, 'backgroundColor');
    });
  });

  describe('elements within a screen', () => {
    describe('button has proper theme values', () => {
      expectElementHasAllValidThemeValues(
        library.ElementType.BUTTON,
        false /* includePadding */
      );
    });

    describe('dropdown has proper theme values', () => {
      expectElementHasAllValidThemeValues(library.ElementType.DROPDOWN);
    });

    describe('label has proper theme values', () => {
      expectElementHasAllValidThemeValues(library.ElementType.LABEL);
    });

    describe('textInput has proper theme values', () => {
      expectElementHasAllValidThemeValues(library.ElementType.TEXT_INPUT);
    });

    describe('textArea has proper theme values', () => {
      expectElementHasAllValidThemeValues(library.ElementType.TEXT_AREA);
    });
  });
});
