import appMain from "@cdo/apps/appMain";
import {singleton as studioApp} from '@cdo/apps/StudioApp';
import Artist from "@cdo/apps/turtle/artist";
import blocks from "@cdo/apps/turtle/blocks";
import skins from "@cdo/apps/turtle/skins";
import levels from "@cdo/apps/turtle/levels";

export default function loadArtist(options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;
  var artist = new Artist();

  window.__TestInterface.setSpeedSliderValue = function (value) {
    artist.speedSlider.setValue(value);
  };
  artist.injectStudioApp(studioApp());
  appMain(artist, levels, options);
}
