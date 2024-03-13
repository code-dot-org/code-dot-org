/* eslint-disable import/order */
import loadArtist from './init/loadArtist';
import loadAppOptions from '@cdo/apps/code-studio/initApp/loadApp';

loadAppOptions().then(loadArtist);
