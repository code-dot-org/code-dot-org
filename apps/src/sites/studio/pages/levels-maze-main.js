import loadAppOptions from '@cdo/apps/code-studio/initApp/loadApp';

import loadMaze from './init/loadMaze';

loadAppOptions().then(loadMaze);
