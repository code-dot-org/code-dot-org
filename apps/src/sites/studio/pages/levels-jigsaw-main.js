import loadAppOptions from '@cdo/apps/code-studio/initApp/loadApp';

import loadJigsaw from './init/loadJigsaw';

loadAppOptions().then(loadJigsaw);
