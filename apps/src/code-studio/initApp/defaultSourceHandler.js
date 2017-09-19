import { getAppOptions } from './appOptions';

// Define blockly/droplet-specific callbacks for projects to access
// level source, HTML and headers.
// Currently pixelation.js appears to be only place that defines a custom set
// of source handler methods.
const defaultSourceHandler = {
  /**
   * NOTE: when adding a new method here, ensure that all other sourceHandlers
   * (e.g. in pixelation.js) have that same method defined.
   */
  setMakerAPIsEnabled(enableMakerAPIs) {
    getAppOptions().level.makerlabEnabled = enableMakerAPIs;
  },
  getMakerAPIsEnabled() {
    return getAppOptions().level.makerlabEnabled;
  },
  setInitialLevelHtml(levelHtml) {
    getAppOptions().level.levelHtml = levelHtml;
  },
  getLevelHtml() {
    return window.Applab && Applab.getHtml();
  },
  setInitialLevelSource(levelSource) {
    getAppOptions().level.lastAttempt = levelSource;
  },
  // returns a Promise to the level source
  getLevelSource(currentLevelSource) {
    return new Promise((resolve, reject) => {
      let source;
      let appOptions = getAppOptions();
      if (appOptions.level && appOptions.level.scratch) {
        resolve(appOptions.getCode());
      } else if (window.Blockly) {
        // If we're readOnly, source hasn't changed at all
        source = Blockly.mainBlockSpace.isReadOnly() ? currentLevelSource :
                 Blockly.Xml.domToText(Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace));
        resolve(source);
      } else if (appOptions.getCode) {
        source = appOptions.getCode();
        resolve(source);
      } else if (appOptions.getCodeAsync) {
        appOptions.getCodeAsync().then((source) => {
          resolve(source);
        });
      }
    });
  },
  setInitialAnimationList(animationList) {
    getAppOptions().initialAnimationList = animationList;
  },
  getAnimationList(callback) {
    if (getAppOptions().getAnimationList) {
      getAppOptions().getAnimationList(callback);
    } else {
      callback({});
    }
  },
  prepareForRemix() {
    const {prepareForRemix} = getAppOptions();
    if (prepareForRemix) {
      return prepareForRemix();
    }
    return Promise.resolve(); // Return an insta-resolved promise.
  }
};
export default defaultSourceHandler;
