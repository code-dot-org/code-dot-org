/* eslint-disable import/order */
import loadCalc from './init/loadCalc';
import loadAppOptions from '@cdo/apps/code-studio/initApp/loadApp';

loadAppOptions().then(loadCalc);
