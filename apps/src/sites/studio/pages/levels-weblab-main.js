import loadAppOptions from '@cdo/apps/code-studio/initApp/loadApp';

import loadWeblab from './init/loadWeblab';

loadAppOptions().then(loadWeblab);
