import loadAppOptions from '@cdo/apps/code-studio/initApp/loadApp';

import loadCraft from './init/loadCraft';

loadAppOptions().then(loadCraft);
