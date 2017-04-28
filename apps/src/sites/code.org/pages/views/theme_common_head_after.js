import {isUnsupportedBrowser} from '@cdo/apps/util/browser-detector';
import {initHamburger} from '@cdo/apps/hamburger/hamburger.js';

window.isUnsupportedBrowser = isUnsupportedBrowser;
initHamburger();
