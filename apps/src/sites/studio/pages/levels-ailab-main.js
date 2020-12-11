import loadAilab from './init/loadAilab';
import loadAppOptions from '@cdo/apps/code-studio/initApp/loadApp';

loadAppOptions().then(loadAilab);
