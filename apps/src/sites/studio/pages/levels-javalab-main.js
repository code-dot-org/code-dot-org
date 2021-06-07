import loadAppOptions from '@cdo/apps/code-studio/initApp/loadApp';
import loadJavalab from './init/loadJavalab';

loadAppOptions().then(loadJavalab);
