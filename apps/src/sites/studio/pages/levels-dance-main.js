import loadAppOptions from '@cdo/apps/code-studio/initApp/loadApp';

import loadDance from './init/loadDance';

loadAppOptions().then(loadDance);
