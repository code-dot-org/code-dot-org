import KARMA_CLI_FLAGS from './util/KARMA_CLI_FLAGS';
if (KARMA_CLI_FLAGS.testType === 'unit') {
  require('./unit-tests.js');
} else if (KARMA_CLI_FLAGS.testType === 'integration') {
  require('./integration-tests.js');
} else if (KARMA_CLI_FLAGS.testType === 'storybook') {
  require('./storybook-tests.js');
}
