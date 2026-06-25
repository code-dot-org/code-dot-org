import {init as initModel} from './models';
import {setModelInitCallback, toMode} from './modeTransition';

// Wire up the model-init dispatcher so that modeTransition.toMode can invoke
// models/index.init without models/loading.js needing to import this module.
setModelInitCallback(initModel);

export default {toMode};
