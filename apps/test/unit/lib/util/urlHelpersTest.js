import sinon from 'sinon';

import {
  pegasus,
  studio,
  metaTagDescription,
} from '@cdo/apps/lib/util/urlHelpers';


import {stubWindowDashboard, stubWindowPegasus} from '../../../util/testUtils';

describe('pegasus()', () => {
  describe('from dashboard', () => {
    stubWindowDashboard({
      CODE_ORG_URL: '//test.code.org',
    });

    it('gives an absolute pegasus url', () => {
      expect(pegasus('/relative-path')).toBe('//test.code.org/relative-path');
    });
  });

  describe('from pegasus', () => {
    stubWindowDashboard(undefined);

    it('returns a relative URL', () => {
      expect(window.dashboard).toBeUndefined();
      expect(pegasus('/relative-path')).toBe('/relative-path');
    });
  });
});

describe('studio()', () => {
  describe('from pegasus', () => {
    stubWindowPegasus({
      STUDIO_URL: '//test-studio.code.org',
    });

    it('gives an absolute studio url', () => {
      expect(studio('/relative-path')).toBe('//test-studio.code.org/relative-path');
    });
  });

  describe('from studio', () => {
    stubWindowPegasus(undefined);

    it('returns a relative URL', () => {
      expect(window.pegasus).toBeUndefined();
      expect(studio('/relative-path')).toBe('/relative-path');
    });
  });
});

describe('metaTagDescription() for valid urls', () => {
  let sandbox;
  const bodyText = `<html lang="en">
    <head>
      <meta name="keywords" content="">
      <meta name="description" content="Valid Description Here">
      <title>Code.org Documentation</title>
      <link rel="shortcut icon" href="https://curriculum.code.org/static/img/favicon.ico">
    </head>

    <body id="body">
    </body>
  </html>`;

  const bodyTextWithoutTag = `<html lang="en">
    <head>
      <meta name="keywords" content="">
      <title>Code.org Documentation</title>
      <link rel="shortcut icon" href="https://curriculum.code.org/static/img/favicon.ico">
    </head>

    <body id="body">
    </body>
  </html>`;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('retrieves the content from the description meta tag', () => {
    const res = new window.Response(bodyText, {
      status: 200,
      headers: {
        'Content-type': 'text/html',
      },
    });
    sandbox.stub(window, 'fetch').returns(Promise.resolve(res));

    const promise = metaTagDescription('/valid/url/');
    return expect(promise).toBe('Valid Description Here');
  });

  it('returns the relative url for valid urls when the description meta tag is missing', () => {
    const res = new window.Response(bodyTextWithoutTag, {
      status: 200,
      headers: {
        'Content-type': 'text/html',
      },
    });
    sandbox.stub(window, 'fetch').returns(Promise.resolve(res));

    const promise = metaTagDescription('/valid/url/wo/tag');
    return expect(promise).toBe('/valid/url/wo/tag');
  });
});

describe('metaTagDescription() for invalid url', () => {
  it('returns the url when the fetch fails', () => {
    const promise = metaTagDescription('/this/is/invalid/');
    return expect(promise).toBe('/this/is/invalid/');
  });
});
