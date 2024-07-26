import loadAppOptions from '@cdo/apps/code-studio/initApp/loadApp';

import loadArtist from './init/loadArtist';

loadAppOptions().then(loadArtist);
