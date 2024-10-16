import loadAppOptions from '@cdo/apps/code-studio/initApp/loadApp';

import loadApplab from './init/loadApplab';

loadAppOptions().then(loadApplab);
