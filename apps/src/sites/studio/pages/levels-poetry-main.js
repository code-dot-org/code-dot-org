/* eslint-disable import/order */
import loadAppOptions from '@cdo/apps/code-studio/initApp/loadApp';
import loadPoetry from './init/loadPoetry';

loadAppOptions().then(loadPoetry);
