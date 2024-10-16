// This is the webpack entry point for all our karma tests, see: karma.conf.js
//
// Invocations of `karma start` run this file, which uses KARMA_CLI_FLAGS
// to dynamically require and execute the tests specified on the `karma start` CLI.

import '@babel/polyfill/noConflict';
import 'whatwg-fetch';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import enzyme from 'enzyme'; // eslint-disable-line no-restricted-imports

import {clearTimeoutsBetweenTests} from './util/clearTimeoutsBetweenTests';
import KARMA_CLI_FLAGS from './util/KARMA_CLI_FLAGS';
import stubFirehose from './util/stubFirehose';
import {throwOnConsoleErrorsEverywhere} from './util/throwOnConsole';

enzyme.configure({adapter: new Adapter()});

const testType = testType =>
  !KARMA_CLI_FLAGS.testType || KARMA_CLI_FLAGS.testType === testType;

// Use `karma start --testType=unit --entry=./test/unit/gridUtilsTest.js` to run the tests
// in one file, or all the tests in a directory
const selectTestsToRun = context =>
  KARMA_CLI_FLAGS.entry
    ? context.keys().filter(path => path.startsWith(KARMA_CLI_FLAGS.entry))
    : context.keys();

const runTests = context => selectTestsToRun(context).forEach(context);

// `npx karma start --testType=unit`
if (testType('unit')) {
  describe('unit tests', function () {
    throwOnConsoleErrorsEverywhere();
    clearTimeoutsBetweenTests();

    // TODO: re-enable throwOnConsoleWarningsEverywhere() once redux/react-redux
    // and react-inspector have been upgraded and the react warnings are fixed.
    //
    // redux: https://codedotorg.atlassian.net/browse/XTEAM-376
    // react-inspector: https://codedotorg.atlassian.net/browse/XTEAM-375
    //
    // throwOnConsoleWarningsEverywhere();

    beforeEach(() => {
      // Some tests anchor to the body tag and is not reset per test execution, leading to a case where the DOM
      // is full of elements from prior test runs. This leads to scenarios where a test runs if executed alone but
      // fails if run as part of the whole test suite.
      // Ensure that the <body> tag is empty before each test execution.
      const bodyTags = Array.from(document.getElementsByTagName('body'));

      bodyTags.forEach(bodyTag => {
        // Add a <script> tag to avoid recaptcha error
        // The <script> portion can be removed if the RecaptchaDialog test is updated to remove the downloading of
        // the recaptcha.js file in Karma. The recaptcha script looks for the <script> tag which is inserted in the
        // RecaptchaDialog file. That test finishes early but the recaptcha javascript never finished loading.
        // This causes an error to surface in later tests and cause those to fail. Instead, adding a stub <script>
        // allows subsequent tests to pass.
        bodyTag.innerHTML = '<script></script>';
      });
    });
    runTests(require.context('./unit', true, /\.karma\.test\.[j|t]sx?$/));
  });
}

// `npx karma start --testType=integration`
if (testType('integration')) {
  describe('integration tests', function () {
    throwOnConsoleErrorsEverywhere();
    clearTimeoutsBetweenTests();
    stubFirehose();

    // TODO: re-enable after fixing react warnings, see TODO above in unit tests
    // throwOnConsoleWarningsEverywhere();

    runTests(require.context('./integration', false, /Tests?\.js$/));
  });
}

// `npx karma start --testType=storybook`
if (testType('storybook')) {
  describe('storybook tests', function () {
    require('./storybook/renderStoriesTest');
  });
}

// `npx karma start --testType=dontTestJustWebpack`
// karma-webpacks tests-entry.js without running any tests.
// Use to run a karma webpack of tests-entry.js, without running any tests.
if (KARMA_CLI_FLAGS.testType === 'dontTestJustWebpack') {
  describe('dontTestJustWebpack', () =>
    it('webpacks tests-entry.js without running any tests', () => true));
}
