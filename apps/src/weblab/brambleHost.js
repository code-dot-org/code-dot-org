import CdoBramble, {BRAMBLE_CONTAINER} from './CdoBramble';
import {FILE_SYSTEM_ERROR, BRAMBLE_READY_STATE} from './constants';

/**
 * JS to communicate between Bramble and Code Studio
 */
const scriptData = document.querySelector('script[data-bramble]');
const brambleConfig = JSON.parse(scriptData.dataset.bramble);
const BRAMBLE_BASE_URL = brambleConfig.baseUrl;
window.requirejs.config({baseUrl: BRAMBLE_BASE_URL});

// Get the WebLab object from our parent window
let webLab_;
if (parent.getWebLab) {
  webLab_ = parent.getWebLab();
} else {
  brambleConfig.skipFiles ||
    console.error('ERROR: getWebLab() method not found on parent');
}

function load(Bramble) {
  const api = webLab_.brambleApi();
  const cdoBramble = new CdoBramble(
    Bramble,
    api,
    api.redux(),
    `${BRAMBLE_BASE_URL}/index.html`,
    `/codedotorg/weblab/${api.getProjectId()}/`,
    webLab_.disallowedHtmlTags
  );
  cdoBramble
    .on('mountable', () => api.onBrambleMountable(cdoBramble.getInterface()))
    .on('ready', api.onBrambleReady)
    .on('projectChange', api.onProjectChanged)
    .init();
}

// "Minimal" load function does not pass files to Bramble; it's used by
// the support verification page at studio.code.org/weblab/network-check
// to check that we can reach a ready state
function loadMinimal(Bramble) {
  Bramble.load(BRAMBLE_CONTAINER, {
    url: `${BRAMBLE_BASE_URL}/index.html`,
  });

  Bramble.on('readyStateChange', (_, newState) => {
    if (Bramble.MOUNTABLE === newState) {
      window.parent.postMessage(
        JSON.stringify({msg: BRAMBLE_READY_STATE}),
        brambleConfig.studioUrl
      );
    }
  });

  Bramble.on('error', err => {
    if (err.code === FILE_SYSTEM_ERROR) {
      window.parent.postMessage(
        JSON.stringify({msg: FILE_SYSTEM_ERROR}),
        brambleConfig.studioUrl
      );
    }
    console.log(err);
  });
}

// Load bramble.js
const brambleClient = brambleConfig.devMode ? 'bramble/client/main' : 'bramble';
const callback = brambleConfig.skipFiles ? loadMinimal : load;
requirejs([brambleClient], callback);
