import loadAppOptions from '@cdo/apps/code-studio/initApp/loadApp';

import loadAilab from './init/loadAilab';

loadAppOptions().then(loadAilab);
