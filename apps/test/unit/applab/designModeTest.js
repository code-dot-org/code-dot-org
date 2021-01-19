import {expect} from '../../util/deprecatedChai';
import designMode from '@cdo/apps/applab/designMode';
import elementLibrary from '@cdo/apps/applab/designElements/library';

describe('appendPx', () => {
  it('returns a valid css positive integer', function() {
    const cssVal = designMode.appendPx(100);
    expect(cssVal).to.equal('100px');
  });
  it('returns 0 as a valid value', function() {
    const cssVal = designMode.appendPx(0);
    expect(cssVal).to.equal('0px');
  });
  it('returns the given stringified integer as a valid value', function() {
    const cssVal = designMode.appendPx('100');
    expect(cssVal).to.equal('100px');
  });
  it('returns a value with px as a valid value', function() {
    const cssVal = designMode.appendPx('100px');
    expect(cssVal).to.equal('100px');
  });
  it('returns an empty string if given a string', function() {
    const cssVal = designMode.appendPx('one hundred');
    expect(cssVal).to.equal('');
  });
  it('returns an empty string if given an object', function() {
    const cssVal = designMode.appendPx({object: 100});
    expect(cssVal).to.equal('');
  });
  it('returns an empty string if given an array with first element as a string', function() {
    const cssVal = designMode.appendPx(['bark', 300, 400]);
    expect(cssVal).to.equal('');
  });
  it('returns an empty string if given an array with first element as a number', function() {
    const cssVal = designMode.appendPx([200, 300, 400]);
    expect(cssVal).to.equal('');
  });
  it('returns an empty string if empty', function() {
    const cssVal = designMode.appendPx();
    expect(cssVal).to.equal('');
  });
  it('returns an empty string if null', function() {
    const cssVal = designMode.appendPx(null);
    expect(cssVal).to.equal('');
  });
  it('returns an empty string if undefined', function() {
    const cssVal = designMode.appendPx(undefined);
    expect(cssVal).to.equal('');
  });
});

describe('makeUrlProtocolRelative', () => {
  const {makeUrlProtocolRelative} = designMode;

  it('does not change a url that is already protocol-relative', () => {
    [
      '//test.code.org',
      '//example.com/http://something-else',
      '//test-studio.code.org/media?u=http%3A%2F%2Fexample.com'
    ].forEach(originalUrl => {
      expect(makeUrlProtocolRelative(originalUrl)).to.equal(originalUrl);
    });
  });

  it('changes http:// to //', () => {
    [
      {
        input: 'http://test.code.org',
        expected: '//test.code.org'
      },
      {
        input: 'http://example.com/http://something-else',
        expected: '//example.com/http://something-else'
      },
      {
        input: 'http://test-studio.code.org/media?u=http%3A%2F%2Fexample.com',
        expected: '//test-studio.code.org/media?u=http%3A%2F%2Fexample.com'
      }
    ].forEach(({input, expected}) => {
      expect(makeUrlProtocolRelative(input)).to.equal(expected);
    });
  });

  it('changes https:// to //', () => {
    [
      {
        input: 'https://test.code.org',
        expected: '//test.code.org'
      },
      {
        input: 'https://example.com/http://something-else',
        expected: '//example.com/http://something-else'
      },
      {
        input: 'https://test-studio.code.org/media?u=http%3A%2F%2Fexample.com',
        expected: '//test-studio.code.org/media?u=http%3A%2F%2Fexample.com'
      }
    ].forEach(({input, expected}) => {
      expect(makeUrlProtocolRelative(input)).to.equal(expected);
    });
  });
});

describe('onDuplicate screen', () => {
  let designModeElement, originalScreen;
  const colorProperty = 'backgroundColor';
  const imageProperty = 'screen-image';
  const color = 'rgb(0, 0, 255)';
  const image = 'image.png';
  beforeEach(() => {
    designModeElement = document.createElement('div');
    designModeElement.setAttribute('id', 'designModeViz');
    document.body.appendChild(designModeElement);

    originalScreen = elementLibrary.createElement('SCREEN', 0, 0);
    designModeElement.appendChild(originalScreen);
  });

  afterEach(() => {
    document.body.removeChild(designModeElement);
  });

  it('duplicates the background color of the screen', () => {
    designMode.updateProperty(originalScreen, colorProperty, color);
    var newScreen = designMode.onDuplicate(originalScreen);
    expect(designMode.readProperty(newScreen, colorProperty)).to.equal(color);
  });

  it('duplicates the background image of the screen', () => {
    designMode.updateProperty(originalScreen, imageProperty, image);
    var newScreen = designMode.onDuplicate(originalScreen);
    expect(designMode.readProperty(newScreen, imageProperty)).to.equal(image);
  });

  it('duplicates background color and image of the screen', () => {
    designMode.updateProperty(originalScreen, imageProperty, image);
    designMode.updateProperty(originalScreen, colorProperty, color);
    var newScreen = designMode.onDuplicate(originalScreen);
    expect(designMode.readProperty(newScreen, colorProperty)).to.equal(color);
    expect(designMode.readProperty(newScreen, imageProperty)).to.equal(image);
  });

  it('does not duplicate the background image when none is set', () => {
    var newScreen = designMode.onDuplicate(originalScreen);
    expect(designMode.readProperty(newScreen, imageProperty)).to.be.null;
  });
});

describe('setProperty and read Property', () => {
  let picture, text_input, text_area, dropdown;
  // Create HTML elements to get/set
  beforeEach(() => {
    picture = document.createElement('img');
    text_input = document.createElement('input');
    text_area = document.createElement('div');
    dropdown = document.createElement('select');
    let option1 = document.createElement('option');
    option1.innerHTML = 'Eta Theta';
    let option2 = document.createElement('option');
    option2.innerHTML = 'Epsilon Zeta';
    dropdown.appendChild(option1);
    dropdown.appendChild(option2);
  });

  describe('setProperty: ', () => {
    it('Sets the expected text for dropdowns, text area, and text input', () => {
      designMode.updateProperty(text_input, 'text', 'Alpha Beta');
      designMode.updateProperty(text_area, 'text', 'Gamma Delta');
      designMode.updateProperty(dropdown, 'text', 'Epsilon Zeta');

      expect(text_input.value).to.equal('Alpha Beta');
      expect(text_area.innerHTML).to.equal('Gamma Delta');
      expect(dropdown.value).to.equal('Epsilon Zeta');
    });
    it('Sets the expected value for dropdowns, text area, and text input', () => {
      designMode.updateProperty(text_input, 'value', 'Iota Kappa');
      designMode.updateProperty(text_area, 'value', 'Lambda Mu');
      designMode.updateProperty(dropdown, 'value', 'Eta Theta');

      expect(text_input.value).to.equal('Iota Kappa');
      expect(text_area.innerHTML).to.equal('Lambda Mu');
      expect(dropdown.value).to.equal('Eta Theta');
    });
    it('Uses the asset timestamp in the source path for pictures', () => {
      designMode.updateProperty(picture, 'picture', 'picture.jpg', 123456);
      expect(picture.src).to.contain('picture.jpg?t=123456');
    });
  });

  describe('readProperty: ', () => {
    beforeEach(() => {
      text_input.value = 'Nu Xi';
      text_area.innerHTML = 'Omicron Pi';
      dropdown.value = 'Epsilon Zeta';
    });

    it('Gets the expected text for dropdowns, text area, and text input', () => {
      expect(designMode.readProperty(text_input, 'text')).to.equal('Nu Xi');
      expect(designMode.readProperty(text_area, 'text')).to.equal('Omicron Pi');
      expect(designMode.readProperty(dropdown, 'text')).to.equal(
        'Epsilon Zeta'
      );
    });
    it('Gets the expected value for dropdowns, text area, and text input', () => {
      expect(designMode.readProperty(text_input, 'value')).to.equal('Nu Xi');
      expect(designMode.readProperty(text_area, 'value')).to.equal(
        'Omicron Pi'
      );
      expect(designMode.readProperty(dropdown, 'value')).to.equal(
        'Epsilon Zeta'
      );
    });
  });

  describe('assignImageType', () => {
    const {assignImageType} = designMode;
    let picture;

    beforeEach(() => {
      picture = document.createElement('img');
    });

    it('Returns icon for icon input', () => {
      expect(assignImageType(picture, 'icon://someIcon')).to.equal('icon');
    });

    it('Return url for url input', () => {
      expect(
        assignImageType(picture, 'https://code.org/images/logo.png')
      ).to.equal('url');
    });

    it('Return default for empty input', () => {
      expect(assignImageType(picture, '')).to.equal('default');
    });

    it('Return file for non empty, non url, non icon input', () => {
      expect(assignImageType(picture, 'some_random_string')).to.equal('file');
    });
  });
});
