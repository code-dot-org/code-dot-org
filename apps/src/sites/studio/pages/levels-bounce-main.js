import loadAppOptions from '@cdo/apps/code-studio/initApp/loadApp';

import loadBounce from './init/loadBounce';

loadAppOptions().then(loadBounce);
