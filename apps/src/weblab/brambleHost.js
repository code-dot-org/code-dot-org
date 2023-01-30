/* global requirejs */
import CdoBramble, {BRAMBLE_CONTAINER} from './CdoBramble';

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
} else if (!brambleConfig.skipFiles) {
  console.error('ERROR: getWebLab() method not found on parent');
}

function load(Bramble) {
  if (brambleConfig.skipFiles) {
    // Special case for checking that Bramble will load
    // without actually passing data
    Bramble.load(BRAMBLE_CONTAINER, {
      url: `${BRAMBLE_BASE_URL}/index.html`
    });
    Bramble.on('readyStateChange', (_, newState) => {
      if (Bramble.MOUNTABLE === newState) {
        window.parent.postMessage(
          JSON.stringify({type: 'bramble:readyToMount'}),
          brambleConfig.studioUrl
        );
      }
    });
    Bramble.on('error', console.log);
    return;
  }

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

// Load bramble.js
const brambleClient = brambleConfig.devMode ? 'bramble/client/main' : 'bramble';
requirejs([brambleClient], load);
