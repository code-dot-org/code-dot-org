import loadAppOptions from '@cdo/apps/code-studio/initApp/loadApp';
import loadAichat from './init/loadAichat';

loadAppOptions().then(loadAichat);
