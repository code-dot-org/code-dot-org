// entry point for api that gets exposed.

window.$ = require('jquery');
import '@cdo/apps/sites/studio/pages/code-studio';
// third party dependencies that are provided as globals in code-studio but
// which need to be explicitly required here.
window.React = require('react');
window.Applab = require('./applab');
import {injectErrorHandler} from '../javascriptMode';
import JavaScriptModeErrorHandler from '../JavaScriptModeErrorHandler';
//import applabCommands from './commands';
import * as api from './api';
import appStorage from './appStorage';
import Sounds from '../Sounds';
import {singleton as studioApp} from '../StudioApp';
import loadApplab from '@cdo/apps/sites/studio/pages/init/loadApplab';
import {getAppOptions, setAppOptions, setupApp} from '@cdo/apps/code-studio/initApp/loadApp';
import {getStore} from '@cdo/apps/redux';
import {setIsRunning} from '@cdo/apps/redux/runState';
window.CDOSounds = new Sounds();

// TODO: remove the below two monkey patches.
window.Applab.JSInterpreter = {getNearestUserCodeLine: function () {return 0;}};

const APP_OPTIONS = {
  "levelGameName":"Applab",
  "skinId":"applab",
  "baseUrl":"/blockly/",
  "app":"applab",
  "droplet":true,
  "pretty":"",
  "level":{
    "skin":"applab",
    "editCode":true,
    "embed":false,
    "isK1":false,
    "isProjectLevel":true,
    "skipInstructionsPopup":false,
    "disableParamEditing":true,
    "disableVariableEditing":false,
    "useModalFunctionEditor":false,
    "useContractEditor":false,
    "contractHighlight":false,
    "contractCollapse":false,
    "examplesHighlight":false,
    "examplesCollapse":false,
    "definitionHighlight":false,
    "definitionCollapse":false,
    "freePlay":true,
    "appWidth":320,
    "appHeight":480,
    "sliderSpeed":1.0,
    "calloutJson":"[]",
    "disableExamples":false,
    "showTurtleBeforeRun":false,
    "autocompletePaletteApisOnly":false,
    "textModeAtStart":false,
    "designModeAtStart":false,
    "hideDesignMode":false,
    "beginnerMode":false,
    "levelId":"custom",
    "puzzle_number":1,
    "stage_total":1,
    "iframeEmbed":false,
    "lastAttempt":null,
    "submittable":false
  },
  "showUnusedBlocks":true,
  "fullWidth":true,
  "noHeader":true,
  "noFooter":true,
  "smallFooter":false,
  "codeStudioLogo":false,
  "hasI18n":false,
  "callouts":[],
  "channel":"Wc1JaBxTP04gGolQ9xuhNw",
  "readonlyWorkspace":true,
  "isLegacyShare":false,
  "postMilestone":true,
  "postFinalMilestone":true,
  "puzzleRatingsUrl":"/puzzle_ratings",
  "authoredHintViewRequestsUrl":"/authored_hint_view_requests.json",
  "serverLevelId":2176,
  "gameDisplayName":"App Lab",
  "publicCaching":false,
  "is13Plus":true,
  "hasContainedLevels":false,
  "hideSource":true,
  "share":true,
  "labUserId":"x+OhD4/hmGgtPrHVlrC32TFHAdo",
  "firebaseName":"cdo-v3-dev",
  "firebaseAuthToken":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ2IjowLCJpYXQiOjE0ODM5OTg4MjksImQiOnsidWlkIjoiOTIiLCJpc19kYXNoYm9hcmRfdXNlciI6dHJ1ZX19.DX8PP0Q8EDGg7UtMbhT2sT-h39LvDsuuPbA6YesXLG8",
  "firebaseChannelIdSuffix":"-DEVELOPMENT-pcardune",
  "isSignedIn":true,
  "pinWorkspaceToBottom":true,
  "hasVerticalScrollbars":true,
  "showExampleTestButtons":true,
  "rackEnv":"development",
  "report":{
    "fallback_response":null,
            "callback":null,
            "sublevelCallback":null},
  "sendToPhone":true,
  "send_to_phone_url":"http://localhost-studio.code.org:3000/sms/send",
  "copyrightStrings":{
    "thank_you":"We%20thank%20our%20%3Ca%20href=%22https://code.org/about/donors%22%3Edonors%3C/a%3E,%20%3Ca%20href=%22https://code.org/about/partners%22%3Epartners%3C/a%3E,%20our%20%3Ca%20href=%22https://code.org/about/team%22%3Eextended%20team%3C/a%3E,%20our%20video%20cast,%20and%20our%20%3Ca%20href=%22https://code.org/about/advisors%22%3Eeducation%20advisors%3C/a%3E%20for%20their%20support%20in%20creating%20Code%20Studio.",
    "help_from_html":"We especially want to recognize the engineers from Google, Microsoft, Facebook, Twitter, and many others who helped create these materials.",
    "art_from_html":"Minecraft\u0026%238482;%20\u0026copy;%202017%20Microsoft.%20All%20Rights%20Reserved.%3Cbr%20/%3EStar%20Wars\u0026%238482;%20\u0026copy;%202017%20Disney%20and%20Lucasfilm.%20All%20Rights%20Reserved.%3Cbr%20/%3EFrozen\u0026%238482;%20\u0026copy;%202017%20Disney.%20All%20Rights%20Reserved.%3Cbr%20/%3EIce%20Age\u0026%238482;%20\u0026copy;%202017%2020th%20Century%20Fox.%20All%20Rights%20Reserved.%3Cbr%20/%3EAngry%20Birds\u0026%238482;%20\u0026copy;%202009-2017%20Rovio%20Entertainment%20Ltd.%20All%20Rights%20Reserved.%3Cbr%20/%3EPlants%20vs.%20Zombies\u0026%238482;%20\u0026copy;%202017%20Electronic%20Arts%20Inc.%20All%20Rights%20Reserved.%3Cbr%20/%3EThe%20Amazing%20World%20of%20Gumball%20is%20trademark%20and%20\u0026copy;%202017%20Cartoon%20Network.",
    "code_from_html":"Code.org%20uses%20p5.play,%20which%20is%20licensed%20under%20%3Ca%20href=%22http://www.gnu.org/licenses/old-licenses/lgpl-2.1-standalone.html%22%3Ethe%20GNU%20LGPL%202.1%3C/a%3E.",
    "powered_by_aws":"Powered by Amazon Web Services",
    "trademark":"\u0026copy;%20Code.org,%202017.%20Code.org\u0026reg;,%20the%20CODE%20logo%20and%20Hour%20of%20Code\u0026reg;%20are%20trademarks%20of%20Code.org."
  },
  "teacherMarkdown":null,
  "dialog":{
    "skipSound":false,
    "preTitle":null,
    "fallbackResponse":"null",
    "callback":null,
    "sublevelCallback":null,
    "app":"applab",
    "level":"custom",
    "shouldShowDialog":true
  },
  "locale":"en_us"
};

Applab.render = function (){};

setAppOptions(APP_OPTIONS);
setupApp(APP_OPTIONS);
loadApplab(getAppOptions());
getStore().dispatch(setIsRunning(true));

studioApp.highlight = function () {};

// Expose api functions globally, unless they already exist
// in which case they are probably browser apis that we should
// not overwrite.
for (let key in api) {
  if (!window[key]) {
    window[key] = api[key];
  }
}

// disable appStorage
for (let key in appStorage) {
  appStorage[key] = function () {
    console.error("Data APIs are not available outside of code studio.");
  };
}

// Set up an error handler for student errors and warnings.
injectErrorHandler(new JavaScriptModeErrorHandler(
  () => Applab.JSInterpreter,
  Applab
));
