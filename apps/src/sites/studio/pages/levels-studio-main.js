import loadAppOptions from '@cdo/apps/code-studio/initApp/loadApp';

import loadStudio from './init/loadStudio';

loadAppOptions().then(loadStudio);
