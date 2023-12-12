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

// `npx karma start --testType=unit`
if (testType('unit')) {
  describe('unit tests', function () {
    const testsContext = require.context('./unit', true, /\.[j|t]sx?$/);
    let tests = testsContext.keys();

    // Invoked by `karma start --entry=./test/unit/gridUtilsTest.js`
    // Specifies a specific test file or test directory to run.
    if (KARMA_CLI_FLAGS.entry) {
      tests = tests.filter(path => path.startsWith(KARMA_CLI_FLAGS.entry));
    }

    throwOnConsoleErrorsEverywhere();

    // TODO: re-enable throwOnConsoleWarningsEverywhere() once redux/react-redux
    // and react-inspector have been upgraded and the react warnings are fixed.
    //
    // redux: https://codedotorg.atlassian.net/browse/XTEAM-376
    // react-inspector: https://codedotorg.atlassian.net/browse/XTEAM-375
    //
    // throwOnConsoleWarningsEverywhere();

    clearTimeoutsBetweenTests();
    tests.forEach(testsContext);
  });
}

// `npx karma start --testType=integration`
if (testType('integration')) {
  describe('integration tests', function () {
    var testsContext = require.context('./integration', false, /Tests?\.js$/);

    throwOnConsoleErrorsEverywhere();

    // TODO: re-enable after fixing react warnings, see TODO above in unit tests
    // throwOnConsoleWarningsEverywhere();

    clearTimeoutsBetweenTests();
    stubFirehose();

    testsContext.keys().forEach(testsContext);
  });
}

// `npx karma start --testType=storybook`
if (testType('storybook')) {
  describe('storybook tests', function () {
    require('./storybook/renderStoriesTest');
  });
}

// Use to run a karma webpack of tests-entry.js, without running any tests.
if (KARMA_CLI_FLAGS.testType === 'dontTestJustWebpack') {
  describe('dontTestJustWebpack', () =>
    it('webpacks tests-entry.js without running any tests', () => true));
}
