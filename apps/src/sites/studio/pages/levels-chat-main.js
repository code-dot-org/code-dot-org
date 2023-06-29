import loadAppOptions from '@cdo/apps/code-studio/initApp/loadApp';
import loadChat from './init/loadChat';

loadAppOptions().then(loadChat);
