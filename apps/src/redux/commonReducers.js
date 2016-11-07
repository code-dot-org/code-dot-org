/**
 * A set of reducers that are used across all of our apps
 */

import runState from './runState';
import authoredHints from './authoredHints';
import pageConstants from './pageConstants';
import instructions from './instructions';
import instructionsDialog from './instructionsDialog';
import watchedExpressions from './watchedExpressions';

module.exports = {
  runState,
  authoredHints,
  pageConstants,
  instructions,
  instructionsDialog,
  watchedExpressions
};
