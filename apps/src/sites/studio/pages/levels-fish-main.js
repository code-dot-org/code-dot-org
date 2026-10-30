import loadAppOptions from '@cdo/apps/code-studio/initApp/loadApp';

import loadFish from './init/loadFish';

loadAppOptions().then(loadFish);
