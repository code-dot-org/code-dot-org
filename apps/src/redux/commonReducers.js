/**
 * A set of reducers that are used across all of our apps
 */

import authoredHints from './authoredHints';
import blockly from './blockly';
import feedback from './feedback';
import instructions from './instructions';
import instructionsDialog from './instructionsDialog';
import layout from './layout';
import pageConstants from './pageConstants';
import runState from './runState';
import studioAppActivity from './studioAppActivity';
import watchedExpressions from './watchedExpressions';

module.exports = {
  runState,
  layout,
  authoredHints,
  pageConstants,
  instructions,
  instructionsDialog,
  watchedExpressions,
  feedback,
  studioAppActivity,
  blockly,
};
