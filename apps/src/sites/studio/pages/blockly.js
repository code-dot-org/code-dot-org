/**
 * "Pointer Events Polyfill" to support pointer events on Safari.
 * This polyfill is used only for the Location Picker in Sprite Lab.
 * Google Blockly breaks on some browsers if this polyfill is present
 * as it uses the presence of window.PointerEvent to decide what types
 * of touch events to listen for.
 * Loading the polyfill here guarantees it will be present for Sprite Lab
 * (which uses Cdo Blockly) and it will not be present for any lab loaded
 * with Google Blockly.
 */
import 'pepjs';

import CDOBlockly from '@code-dot-org/blockly';
import initializeCdoBlocklyWrapper from './cdoBlocklyWrapper';

window.Blockly = initializeCdoBlocklyWrapper(CDOBlockly);
