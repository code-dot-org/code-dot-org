import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import {
  setStudioOrigin,
  pegasus,
  studio,
  metaTagDescription,
} from '@cdo/apps/lib/util/urlHelpers';
import {config, configure} from '@cdo/generated-scripts/studioRoutes';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports
import {stubWindowDashboard} from '../../../util/testUtils';

describe('pegasus()', () => {
  describe('from dashboard', () => {
    stubWindowDashboard({
      CODE_ORG_URL: '//test.code.org',
    });

    it('gives an absolute pegasus url', () => {
      expect(pegasus('/relative-path')).to.equal(
        '//test.code.org/relative-path'
      );
    });
  });

  describe('from pegasus', () => {
    stubWindowDashboard(undefined);

    it('returns a relative URL', () => {
      expect(window.dashboard).to.be.undefined;
      expect(pegasus('/relative-path')).to.equal('/relative-path');
    });
  });
});

describe('studio()', () => {
  const originalStudioRoutesConfig = config();
  const origin = 'http://localhost-studio.code.org';
  const path = '/relative-path?param=test#anchor';

  afterEach(() => {
    configure(originalStudioRoutesConfig);
  });

  it('returns an absolute studio URL', () => {
    expect(studio(path)).to.equal(`${origin}${path}`);
  });

  describe('with new origin', () => {
    const newOrigin = 'https://localhost.example.com:3000/scrip_name';

    beforeEach(() => {
      setStudioOrigin(newOrigin);
    });

    it('includes the script_name prefix in generated URLs', () => {
      expect(studio(path)).to.equal(`${newOrigin}${path}`);
    });
  });

  describe('with default_url_options.script_name route config', () => {
    const script_name = '/test_prefix';

    beforeEach(() => {
      configure({
        ...originalStudioRoutesConfig,
        default_url_options: {script_name},
      });
    });

    it('includes the script_name prefix in generated URLs', () => {
      expect(studio(path)).to.equal(`${origin}${script_name}${path}`);
    });
  });
});

describe('metaTagDescription() for valid urls', () => {
  let sandbox;
  const bodyText = `<html lang="en">
    <head>
      <meta name="keywords" content="">
      <meta name="description" content="Valid Description Here">
      <title>CodeAI Documentation</title>
      <link rel="shortcut icon" href="https://curriculum.code.org/static/img/favicon.ico">
    </head>

    <body id="body">
    </body>
  </html>`;

  const bodyTextWithoutTag = `<html lang="en">
    <head>
      <meta name="keywords" content="">
      <title>CodeAI Documentation</title>
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
    return expect(promise).to.eventually.equal('Valid Description Here');
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
    return expect(promise).to.eventually.equal('/valid/url/wo/tag');
  });
});

describe('metaTagDescription() for invalid url', () => {
  it('returns the url when the fetch fails', () => {
    const promise = metaTagDescription('/this/is/invalid/');
    return expect(promise).to.eventually.equal('/this/is/invalid/');
  });
});
