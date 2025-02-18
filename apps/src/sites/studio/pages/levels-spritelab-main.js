import loadAppOptions from '@cdo/apps/code-studio/initApp/loadApp';

import loadSpritelab from './init/loadSpritelab';

loadAppOptions().then(loadSpritelab);
