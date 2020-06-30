/* globals dashboard, appOptions */
import {getStore} from '../../redux';
import getAssetDropdown from '@cdo/apps/assetManagement/getAssetDropdown';
import {executors} from './audioApi';

/**
 * Droplet palette configuration entries, ready to drop in to their respective
 * toolkits.
 */
const dropletConfig = {
  playSound: {
    func: 'playSound',
    parent: executors,
    paramButtons: {minArgs: 1, maxArgs: 2},
    paletteParams: ['url', 'loop'],
    params: ['"sound://default.mp3"', 'false'],
    dropdown: {
      0: () => getAssetDropdown('audio'),
      1: ['true', 'false']
    },
    nativeCallsBackInterpreter: true,
    assetTooltip: {0: chooseAsset.bind(null, 'audio')}
  },
  stopSound: {
    func: 'stopSound',
    parent: executors,
    paramButtons: {minArgs: 0, maxArgs: 1},
    paletteParams: ['url'],
    params: ['"sound://default.mp3"'],
    dropdown: {
      0: () => getAssetDropdown('audio')
    },
    assetTooltip: {0: chooseAsset.bind(null, 'audio')}
  },
  playSpeech: {
    func: 'playSpeech',
    parent: executors,
    paramButtons: {minArgs: 2, maxArgs: 3},
    paletteParams: ['text', 'gender', 'language'],
    params: ['"Hello World!"', '"female"', '"en-US"'],
    dropdown: {
      1: ['"female"', '"male"'],
      2: getLanguages.bind(null)
    },
    nativeCallsBackInterpreter: true,
    assetTooltip: {0: chooseAsset.bind(null, 'audio')}
  }
};

// Flip the argument order so we can bind `typeFilter`.
function chooseAsset(typeFilter, callback) {
  dashboard.assets.showAssetManager(callback, typeFilter, null, {
    showUnderageWarning: !getStore().getState().pageConstants.is13Plus
  });
}

function getLanguages() {
  return Object.keys(appOptions.azureSpeechServiceLanguages).map(
    language => `"${language}"`
  );
}

export default dropletConfig;
