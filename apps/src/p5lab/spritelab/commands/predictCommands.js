import {commands as mlCommands} from '@cdo/apps/lib/util/mlApi';

// Sprite Lab's predict block is value-returning and built via Blockly's
// mutator API — see apps/src/blockly/addons/plusMinusBlocks/predict.js. The
// generated code is `getPrediction({"name1": value1, "name2": value2})`,
// so testValues arrives here as a real object, not a JSON string.
//
// The model is read from the project's imported model — see
// SettingsCog → Manage AI Models. The lab's preload phase warms mlApi's
// cache so this call is synchronous.
export const commands = {
  getPrediction(testValues) {
    return mlCommands.getPrediction({testValues});
  },
};
