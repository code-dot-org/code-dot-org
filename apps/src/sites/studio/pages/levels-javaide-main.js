import loadAppOptions from '@cdo/apps/code-studio/initApp/loadApp';
import loadJavaIde from './init/loadJavaIde';

loadAppOptions().then(loadJavaIde);
