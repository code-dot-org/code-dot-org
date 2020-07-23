import loadFish from './init/loadFish';
import loadAppOptions from '@cdo/apps/code-studio/initApp/loadApp';

loadAppOptions().then(loadFish);
