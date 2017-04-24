import {isUnsupportedBrowser} from '@cdo/apps/util/browser-detector';
import {setupHamburgerMenu} from '@cdo/apps/hamburger/hamburger.js';

window.isUnsupportedBrowser = isUnsupportedBrowser;
setupHamburgerMenu();
