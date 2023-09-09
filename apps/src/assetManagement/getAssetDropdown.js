import commonMsg from '@cdo/locale';
import {quote} from '../utils';
import {getStore} from '../redux';
import Sounds from '../Sounds';

/**
 * Returns a list of options (optionally filtered by type) for code-mode
 * asset dropdowns.
 */
export default function (typeFilter) {
  var options = dashboard.assets.listStore
    .list(typeFilter)
    .map(function (asset) {
      return {
        text: quote(asset.filename),
        display: quote(asset.filename),
      };
    });
  var handleChooseClick = function (callback) {
    dashboard.assets.showAssetManager(
      function (filename) {
        callback(quote(filename));
      },
      typeFilter,
      () => {
        Sounds.getSingleton().stopAllAudio();
      },
      {
        showUnderageWarning: !getStore().getState().pageConstants.is13Plus,
      }
    );
  };
  options.push({
    text: commonMsg.choosePrefix(),
    display:
      '<span class="chooseAssetDropdownOption">' +
      commonMsg.choosePrefix() +
      '</a>',
    click: handleChooseClick,
  });
  return options;
}
