/**
 * A set of reducers that are used across all of our apps
 */

import runState from './runState';
import layout from './layout';
import authoredHints from './authoredHints';
import pageConstants from './pageConstants';
import instructions from './instructions';
import instructionsDialog from './instructionsDialog';
import watchedExpressions from './watchedExpressions';
import feedback from './feedback';

module.exports = {
  runState,
  layout,
  authoredHints,
  pageConstants,
  instructions,
  instructionsDialog,
  watchedExpressions,
  feedback,
};
