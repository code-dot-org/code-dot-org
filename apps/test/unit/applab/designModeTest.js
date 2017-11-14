import {expect} from '../../util/configuredChai';
import designMode from '@cdo/apps/applab/designMode';

describe("appendPx", () => {
  it('returns a valid css positive integer', function () {
    const cssVal = designMode.appendPx(100);
    expect(cssVal).to.equal("100px");
  });
  it('returns 0 as a valid value', function () {
    const cssVal = designMode.appendPx(0);
    expect(cssVal).to.equal("0px");
  });
  it('returns the given stringified integer as a valid value', function () {
    const cssVal = designMode.appendPx("100");
    expect(cssVal).to.equal("100px");
  });
  it('returns a value with px as a valid value', function () {
    const cssVal = designMode.appendPx("100px");
    expect(cssVal).to.equal("100px");
  });
  it('returns an empty string if given a string', function () {
    const cssVal = designMode.appendPx("one hundred");
    expect(cssVal).to.equal("");
  });
  it('returns an empty string if given an object', function () {
    const cssVal = designMode.appendPx({object : 100});
    expect(cssVal).to.equal("");
  });
  it('returns an empty string if given an array with first element as a string', function () {
    const cssVal = designMode.appendPx(["bark", 300, 400]);
    expect(cssVal).to.equal("");
  });
  it('returns an empty string if given an array with first element as a number', function () {
    const cssVal = designMode.appendPx([200, 300, 400]);
    expect(cssVal).to.equal("");
  });
  it('returns an empty string if empty', function () {
    const cssVal = designMode.appendPx();
    expect(cssVal).to.equal("");
  });
  it('returns an empty string if null', function () {
    const cssVal = designMode.appendPx(null);
    expect(cssVal).to.equal("");
  });
  it('returns an empty string if undefined', function () {
    const cssVal = designMode.appendPx(undefined);
    expect(cssVal).to.equal("");
  });
});

describe('makeUrlProtocolRelative', () => {
  const {makeUrlProtocolRelative} = designMode;

  it('does not change a url that is already protocol-relative', () => {
    [
      '//test.code.org',
      '//example.com/http://something-else',
      '//test-studio.code.org/media?u=http%3A%2F%2Fexample.com'
    ].forEach((originalUrl) => {
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
