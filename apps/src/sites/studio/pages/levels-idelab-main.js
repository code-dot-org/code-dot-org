import loadAppOptions from '@cdo/apps/code-studio/initApp/loadApp';
import loadIdelab from './init/loadIdelab';

loadAppOptions().then(loadIdelab);
