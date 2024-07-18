import loadAppOptions from '@cdo/apps/code-studio/initApp/loadApp';

import loadNetSim from './init/loadNetSim';

loadAppOptions().then(loadNetSim);
