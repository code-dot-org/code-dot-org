// This is the webpack entry point for all our karma tests, see: karma.conf.js
//
// Invocations of `karma start` run this file, which uses KARMA_CLI_FLAGS
// to dynamically require and execute the tests specified on the `karma start` CLI.

import '@babel/polyfill/noConflict';
import 'whatwg-fetch';
import {throwOnConsoleErrorsEverywhere} from './util/throwOnConsole';
import {clearTimeoutsBetweenTests} from './util/clearTimeoutsBetweenTests';
import Adapter from 'enzyme-adapter-react-16';
import enzyme from 'enzyme';
import stubFirehose from './util/stubFirehose';
import KARMA_CLI_FLAGS from './util/KARMA_CLI_FLAGS';

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

    runTests(require.context('./unit', true, /\.[j|t]sx?$/));
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
if (KARMA_CLI_FLAGS.testType === 'dontTestJustWebpack') {
  describe('dontTestJustWebpack', () =>
    it('webpacks tests-entry.js without running any tests', () => true));
}
