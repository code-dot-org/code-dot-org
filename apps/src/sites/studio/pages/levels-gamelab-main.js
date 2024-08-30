import loadAppOptions from '@cdo/apps/code-studio/initApp/loadApp';

import loadGamelab from './init/loadGamelab';

loadAppOptions().then(loadGamelab);
