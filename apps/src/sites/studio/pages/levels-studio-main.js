/* eslint-disable import/order */
import loadStudio from './init/loadStudio';
import loadAppOptions from '@cdo/apps/code-studio/initApp/loadApp';

loadAppOptions().then(loadStudio);
