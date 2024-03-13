/* eslint-disable import/order */
import loadCraft from './init/loadCraft';
import loadAppOptions from '@cdo/apps/code-studio/initApp/loadApp';

loadAppOptions().then(loadCraft);
