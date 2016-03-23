/** @file Non-p5 GameLab commands */
'use strict';

var assetPrefix = require('../assetManagement/assetPrefix');
var studioApp = require('../StudioApp').singleton;

var gamelabCommands = module.exports;

gamelabCommands.playSound = function (opts) {
  // TODO: Extract validation helper from applab and use here
  //apiValidateType(opts, 'playSound', 'url', opts.url, 'string');

  if (studioApp.cdoSounds) {
    var url = assetPrefix.fixPath(opts.url);
    if (studioApp.cdoSounds.isPlayingURL(url)) {
      return;
    }

    studioApp.cdoSounds.playURL(url, {
      volume: 1.0,
      // TODO: Re-enable forceHTML5 after Varnish 4.1 upgrade.
      //       See Pivotal #108279582
      //
      //       HTML5 audio is not working for user-uploaded MP3s due to a bug in
      //       Varnish 4.0 with certain forms of the Range request header.
      //
      //       By commenting this line out, we re-enable Web Audio API in App
      //       Lab, which has the following effects:
      //       GOOD: Web Audio should not use the Range header so it won't hit
      //             the bug.
      //       BAD: This disables cross-domain audio loading (hotlinking from an
      //            App Lab app to an audio asset on another site) so it might
      //            break some existing apps.  This should be less problematic
      //            since we now allow students to upload and serve audio assets
      //            from our domain via the Assets API now.
      //
      // forceHTML5: true,
      allowHTML5Mobile: true
    });
  }
};
