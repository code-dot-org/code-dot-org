import loadAppOptions from '@cdo/apps/code-studio/initApp/loadApp';

import loadFlappy from './init/loadFlappy';

loadAppOptions().then(loadFlappy);
