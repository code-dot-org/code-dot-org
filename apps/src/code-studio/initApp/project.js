/* global appOptions */
import $ from 'jquery';
import MD5 from 'crypto-js/md5';
import msg from '@cdo/locale';
import * as utils from '../../utils';
import {CIPHER, ALPHABET} from '../../constants';
import {files as filesApi} from '../../clientApi';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import {AbuseConstants} from '@cdo/apps/util/sharedConstants';
import experiments from '@cdo/apps/util/experiments';
import NameFailureError from '../NameFailureError';
import {CP_API} from '../../lib/kits/maker/boards/circuitPlayground/PlaygroundConstants';

// Attempt to save projects every 30 seconds
var AUTOSAVE_INTERVAL = 30 * 1000;

const NUM_ERRORS_BEFORE_WARNING = 3;

var ABUSE_THRESHOLD = AbuseConstants.ABUSE_THRESHOLD;

var hasProjectChanged = false;

var assets = require('./clientApi').create('/v3/assets');
var files = require('./clientApi').create('/v3/files');
var sources = require('./clientApi').create('/v3/sources');
var sourcesPublic = require('./clientApi').create('/v3/sources-public');
var channels = require('./clientApi').create('/v3/channels');

var showProjectAdmin = require('../showProjectAdmin');
import header from '../header';
import {queryParams, hasQueryParam, updateQueryParam} from '../utils';

// Name of the packed source file
var SOURCE_FILE = 'main.json';

var events = {
  // Fired when run state changes or we enter/exit design mode
  appModeChanged: 'appModeChanged',
  appInitialized: 'appInitialized',
  workspaceChange: 'workspaceChange'
};

// Number of consecutive failed attempts to update the channel.
let saveChannelErrorCount = 0;

// Number of consecutive failed attempts to update the sources.
let saveSourcesErrorCount = 0;

/**
 * Helper for when we split our pathname by /. channel_id and action may end up
 * being undefined.
 * Example paths:
 * /projects/applab
 * /projects/playlab/1U53pYpR8szDgtrGIG5lIg
 * /projects/artist/VyVO-bQaGQ-Cyb7DbpabNQ/edit
 */
var PathPart = {
  START: 0,
  PROJECTS: 1,
  APP: 2,
  CHANNEL_ID: 3,
  ACTION: 4
};

/**
 * Current state of our Channel API object
 * @typedef {Object} ProjectInstance
 * @property {string} id
 * @property {string} name
 * @property {string} levelHtml
 * @property {string} levelSource
 * @property {boolean} hidden Doesn't show up in project list
 * @property {boolean} isOwner Populated by our update/create callback.
 * @property {string} updatedAt String representation of a Date. Populated by
 *   out update/create callback
 * @property {string} level Path where this particular app type is hosted
 */
var current;
var currentSourceVersionId;
let replaceCurrentSourceVersion = false;
// String representing server timestamp at which the first project version was
// saved from this browser tab, to uniquely identify the browser tab for
// logging purposes.
var firstSaveTimestamp;
// The last client time in milliseconds when we forced a new source version.
let lastNewSourceVersionTime = 0;
// Force a new source version if it has been this many milliseconds since we
// last did so.
let newSourceVersionInterval = 15 * 60 * 1000; // 15 minutes
var currentAbuseScore = 0;
var sharingDisabled = false;
var currentHasPrivacyProfanityViolation = false;
var currentShareFailureEnglish = '';
var currentShareFailureIntl = '';
var intlLanguage = false;
var isEditing = false;
let initialSaveComplete = false;
let initialCaptureComplete = false;
let thumbnailChanged = false;
let thumbnailPngBlob = null;

/**
 * Current state of our sources API data
 */
var currentSources = {
  source: null,
  html: null,
  makerAPIsEnabled: null,
  animations: null,
  selectedSong: null
};

/**
 * Get string representation of our sources API object for upload
 */
function packSources() {
  return JSON.stringify(currentSources);
}

/**
 * Populate our current sources API object based off of given data
 * @param {string} data.source
 * @param {string} data.html
 * @param {SerializedAnimationList} data.animations
 * @param {boolean} data.makerAPIsEnabled
 */
function unpackSources(data) {
  currentSources = {
    source: data.source,
    html: data.html,
    animations: data.animations,
    makerAPIsEnabled: data.makerAPIsEnabled,
    generatedProperties: data.generatedProperties,
    selectedSong: data.selectedSong,
    libraries: data.libraries
  };
}

/**
 * Used by getProjectUrl() to extract the project URL.
 */
const PROJECT_URL_PATTERN = /^(.*\/projects\/\w+\/[\w\d-]+)\/.*/;

/**
 * Used by setThumbnailUrl() to set the project thumbnail URL path.
 */
const THUMBNAIL_PATH = '.metadata/thumbnail.png';

var projects = (module.exports = {
  /**
   * @returns {string} id of the current project, or undefined if we don't have
   *   a current project.
   */
  getCurrentId() {
    if (!current) {
      return;
    }
    return current.id;
  },

  /**
   * @returns {string} name of the current project, or undefined if we don't have
   *   a current project
   */
  getCurrentName() {
    if (!current) {
      return;
    }
    return current.name;
  },

  /**
   * @returns {string} name of the most recently published library from the
   * project, or undefined if we don't have a current project
   */
  getCurrentLibraryName() {
    if (!current) {
      return;
    }
    return current.libraryName;
  },

  /**
   * @returns {array} list of all class ids that this library has been shared
   * with. Or undefined if we don't have a current project.
   */
  getCurrentLibrarySharedClasses() {
    if (!current) {
      return;
    }
    return current.sharedWith;
  },

  /**
   * @returns {string} description of the most recently published library from the
   * project, or undefined if we don't have a current project
   */
  getCurrentLibraryDescription() {
    if (!current) {
      return;
    }
    return current.libraryDescription;
  },

  /**
   * This method is used so that it can be mocked for unit tests.
   */
  getUrl() {
    return this.getLocation().href;
  },

  /**
   * This method exists to be mocked for unit tests.
   */
  getLocation() {
    return document.location;
  },

  /**
   * @param [fragment] optional url fragment to append to the end of the project URL.
   * @returns the absolute url to the root of this project without a trailing slash.
   *     For example: http://studio.code.org/projects/applab/GobB13Dy-g0oK. Hash strings
   *     are removed, but query strings are retained. If provided, fragment will be
   *     added to the end of the URL, before the query string.
   */
  getProjectUrl(fragment = '') {
    const match = this.getUrl().match(PROJECT_URL_PATTERN);
    let url;
    if (match) {
      url = match[1];
    } else {
      url = this.getUrl(); // i give up. Let's try this?
    }
    var hashIndex = url.indexOf('#');
    if (hashIndex !== -1) {
      url = url.substring(0, hashIndex);
    }
    var queryString = '';
    var queryIndex = url.indexOf('?');
    if (queryIndex !== -1) {
      queryString = url.substring(queryIndex);
      url = url.substring(0, queryIndex);
    }
    if (fragment.startsWith('/')) {
      while (url.endsWith('/')) {
        url = url.substring(0, url.length - 1);
      }
    }
    return url + fragment + queryString;
  },

  /**
   * Returns a share URL for the current project.
   *
   * Share URLs can vary by application environment and project type.  For most
   * project types the share URL is the same as the project edit and view URLs,
   * but has no action appended to the project's channel ID. Weblab is a special
   * case right now, because it shares projects to codeprojects.org.
   *
   * This function depends on the document location to determine the current
   * application environment.
   *
   * @returns {string} Fully-qualified share URL for the current project.
   */
  getShareUrl() {
    const location = this.getLocation();
    if (this.isWebLab()) {
      const re = /([-.]?studio)?\.?code.org/i;
      const environmentKey = location.hostname.replace(re, '');
      const subdomain = environmentKey.length > 0 ? `${environmentKey}.` : '';
      const port = 'localhost' === environmentKey ? `:${location.port}` : '';
      return `${
        location.protocol
      }//${subdomain}codeprojects.org${port}/${this.getCurrentId()}`;
    } else {
      return location.origin + this.getPathName();
    }
  },

  getCurrentTimestamp() {
    if (!current) {
      return;
    }
    return current.updatedAt;
  },

  /**
   * @returns {number}
   */
  getAbuseScore() {
    return currentAbuseScore;
  },

  getSharingDisabled() {
    return sharingDisabled;
  },

  /**
   * Whether this project's source has the micro:bit or Circuit Playground Maker APIs enabled.
   * Deprecated values: false/true.
   * Updated values: 'circuitPlayground', 'microbit', or null.
   * Deprecated value {false} maps to updated value {null}.
   * Deprecated value {true} maps to updated value {circuitPlayground}.
   * @returns {string}
   */
  getMakerAPIs() {
    return currentSources.makerAPIsEnabled;
  },

  /**
   * Calculates a md5 hash for everything within sources except the
   * generatedProperties.
   * @return {string} md5 hash string.
   */
  md5CurrentSources() {
    const {
      generatedProperties, // eslint-disable-line no-unused-vars
      ...sourcesWithoutProperties
    } = currentSources;
    return MD5(JSON.stringify(sourcesWithoutProperties)).toString();
  },

  getCurrentSourceVersionId() {
    return currentSourceVersionId;
  },

  disableAutoContentModeration() {
    return new Promise((resolve, reject) => {
      channels.update(
        `${this.getCurrentId()}/disable-content-moderation`,
        null,
        err => {
          err ? reject(err) : resolve();
        }
      );
    });
  },

  enableAutoContentModeration() {
    return new Promise((resolve, reject) => {
      channels.update(
        `${this.getCurrentId()}/enable-content-moderation`,
        null,
        err => {
          err ? reject(err) : resolve();
        }
      );
    });
  },

  /**
   * Sets abuse score to zero, saves the project, and reloads the page
   */
  adminResetAbuseScore() {
    var id = this.getCurrentId();
    if (!id) {
      return;
    }
    channels.delete(id + '/abuse', function(err, result) {
      if (err) {
        throw err;
      }
      assets.patchAll(id, 'abuse_score=0', null, function(err, result) {
        if (err) {
          throw err;
        }
      });
      files.patchAll(id, 'abuse_score=0', null, function(err, result) {
        if (err) {
          throw err;
        }
        $('.admin-abuse-score').text(0);
      });
    });
  },

  /**
   * Is the current project (if any) editable by the logged in user (if any)?
   */
  isEditable: isEditable,

  /**
   * @returns {boolean} true if we're frozen
   */
  isFrozen() {
    if (!current) {
      return;
    }
    return current.frozen;
  },

  /**
   * @returns {boolean}
   */
  isOwner() {
    return !!(current && current.isOwner);
  },

  isPublished() {
    return !!(current && current.publishedAt);
  },

  /**
   * @returns {boolean} true if project has a profanity or privacy violation
   */
  hasPrivacyProfanityViolation() {
    return currentHasPrivacyProfanityViolation;
  },

  /**
   * @returns {string} the text that was flagged by our content moderation service for being potentially private or profane in English.
   */
  privacyProfanityDetailsEnglish() {
    return currentShareFailureEnglish;
  },

  /**
   * @returns {string} the text that was flagged by our content moderation service for being potentially private or profane in an language other than English.
   */
  privacyProfanityDetailsIntl() {
    return currentShareFailureIntl;
  },

  /**
   * @returns {string} a 2-character language code if the content moderation service ran in a language other than English.
   */
  privacyProfanitySecondLanguage() {
    return intlLanguage;
  },

  /**
   * @returns {boolean} true if project has been reported enough times to
   *   exceed our threshold
   */
  exceedsAbuseThreshold() {
    return currentAbuseScore >= ABUSE_THRESHOLD;
  },

  /**
   * @return {boolean} true if we should show our policy violation box instead
   *   of showing the project.
   */
  hideBecausePrivacyViolationOrProfane() {
    if (this.showEvenIfPolicyViolatingOrAbusiveProject()) {
      return false;
    }
    return this.hasPrivacyProfanityViolation();
  },

  /**
   * @return {boolean} true if we should show our abuse box instead of showing
   *   the project.
   */
  hideBecauseAbusive() {
    if (this.showEvenIfPolicyViolatingOrAbusiveProject()) {
      return false;
    }
    return this.exceedsAbuseThreshold();
  },

  /**
   * @returns {boolean} true if we should show a project regardless of its
   * profanity, policy violations or abuse rating level.
   */
  showEvenIfPolicyViolatingOrAbusiveProject() {
    if (appOptions.scriptId) {
      // Never want to hide when in the context of a script, as this will always
      // either be me or my teacher viewing my last submission
      return true;
    }

    // When owners edit a project, we don't want to hide it entirely. Instead,
    // we'll load the project and show them a small alert
    const pageAction = parsePath().action;

    // NOTE: appOptions.canResetAbuse is not a security setting as it can be
    // manipulated by the user. In this case that's okay, since all that does
    // is allow them to view a project that was marked as abusive.
    const hasEditPermissions = this.isOwner() || appOptions.canResetAbuse;
    const isEditOrViewPage = pageAction === 'edit' || pageAction === 'view';

    return hasEditPermissions && isEditOrViewPage;
  },

  __TestInterface: {
    // Used by UI tests
    getCurrent() {
      return current;
    },
    isInitialSaveComplete() {
      return initialSaveComplete;
    },
    isInitialCaptureComplete() {
      return initialCaptureComplete;
    },
    setCurrentData(data) {
      current = data;
    },
    setSourceVersionInterval(seconds) {
      newSourceVersionInterval = seconds * 1000;
    },
    setCurrentSourceVersionId(id) {
      currentSourceVersionId = id;
    }
  },

  //////////////////////////////////////////////////////////////////////
  // Properties and callbacks. These are all candidates for being extracted
  // as configuration parameters which are passed in by the caller.
  //////////////////////////////////////////////////////////////////////

  // TODO(dave): extract isAutosaveEnabled and any boolean helper
  // functions below to become properties on appOptions.project.
  // Projects behavior should ultimately be fully configurable by
  // properties on appOptions.project, rather than reaching out
  // into global state to make decisions.

  /**
   * @returns {boolean} true if we're editing
   */
  isEditing() {
    return isEditing;
  },

  // Whether the current level is a project level (i.e. at the /projects url).
  isProjectLevel() {
    return appOptions.level && appOptions.level.isProjectLevel;
  },

  shouldUpdateHeaders() {
    return !appOptions.isExternalProjectLevel;
  },

  showProjectHeader() {
    if (this.shouldUpdateHeaders()) {
      header.showProjectHeader({
        showExport: this.shouldShowExport()
      });
    }
  },

  showMinimalProjectHeader() {
    if (this.shouldUpdateHeaders()) {
      header.showMinimalProjectHeader();
    }
  },

  // Students should not be able to easily see source for embedded applab or
  // gamelab levels.
  shouldHideShareAndRemix() {
    return (
      (appOptions.level && appOptions.level.hideShareAndRemix) ||
      (appOptions.embed &&
        (appOptions.app === 'applab' ||
          appOptions.app === 'gamelab' ||
          appOptions.app === 'spritelab'))
    );
  },

  // Currently, only applab when the experiment is enabled. Hide if
  // hideShareAndRemix is set on the level.
  shouldShowExport() {
    const {level = {}, app} = appOptions;
    const {hideShareAndRemix} = level;
    return (
      !hideShareAndRemix &&
      (app === 'applab' || app === 'gamelab') &&
      experiments.isEnabled('exportExpo')
    );
  },

  showHeaderForProjectBacked() {
    if (this.shouldUpdateHeaders()) {
      header.showHeaderForProjectBacked({
        showShareAndRemix: !this.shouldHideShareAndRemix(),
        showExport: this.shouldShowExport()
      });
    }
  },
  setName(newName) {
    current = current || {};
    if (newName) {
      current.name = newName;
      this.setTitle(newName);
    }
  },
  setLibrarySharedClasses(newSharedClasses, callback) {
    current = current || {};
    if (Array.isArray(newSharedClasses)) {
      current.sharedWith = newSharedClasses;
      this.updateChannels_(callback);
    }
  },
  /**
   * Updates the current channel's library details.
   *
   * @param {Object} config - Object containing library details.
   * @param {string} config.libraryName
   * @param {string} config.libraryDescription
   * @param {string} config.latestLibraryVersion - S3 version ID for the current library version. Passing this value as -1 will nullify libraryLatestVersion.
   * @param {boolean} config.publishing - true if library is being published, false if library is being unpublished, undefined otherwise.
   */
  setLibraryDetails(config = {}) {
    current = current || {};
    const {
      libraryName,
      libraryDescription,
      latestLibraryVersion,
      publishing
    } = config;

    if (libraryName !== current.libraryName) {
      current.libraryName = libraryName;
    }

    if (libraryDescription !== current.libraryDescription) {
      current.libraryDescription = libraryDescription;
    }

    if (latestLibraryVersion !== current.latestLibraryVersion) {
      current.latestLibraryVersion =
        latestLibraryVersion === -1 ? null : latestLibraryVersion;
    }

    if (publishing) {
      // Tells the server to set libraryPublishedAt timestamp.
      current.publishLibrary = true;
    } else if (publishing === false) {
      // Unpublishing, so nullify libraryPublishedAt timestamp.
      current.libraryPublishedAt = null;
      current.publishLibrary = false;
    }

    this.updateChannels_();
  },
  setTitle(newName) {
    if (newName && appOptions.gameDisplayName) {
      document.title = newName + ' - ' + appOptions.gameDisplayName;
    }
  },

  //////////////////////////////////////////////////////////////////////
  // End of properties and callbacks.
  //////////////////////////////////////////////////////////////////////

  /**
   *
   * @param {Object} sourceHandler Object containing callbacks provided by caller.
   * @param {function(string)} sourceHandler.setInitialLevelHtml
   * @param {function(): string} sourceHandler.getLevelHtml
   * @param {function(string)} sourceHandler.setInitialLevelSource
   * @param {function(): string} sourceHandler.getLevelSource
   * @param {function(SerializedAnimationList)} sourceHandler.setInitialAnimationList
   * @param {function(function(): SerializedAnimationList)} sourceHandler.getAnimationList
   * @param {function(Object)} sourceHandler.setInitialGeneratedProperties
   * @param {function(): Object} sourceHandler.getGeneratedProperties
   * @param {function(boolean)} sourceHandler.setMakerAPIsEnabled
   * @param {function(): boolean} sourceHandler.getMakerAPIsEnabled
   * @param {function(): boolean} sourceHandler.setSelectedSong
   */
  init(sourceHandler) {
    this.sourceHandler = sourceHandler;
    if (redirectFromHashUrl() || redirectEditView()) {
      return;
    }

    if (this.isProjectLevel() || current) {
      if (currentSources.html) {
        sourceHandler.setInitialLevelHtml(currentSources.html);
      }

      setMakerAPIsStatusFromLevel();
      setMakerAPIsStatusFromQueryParams();
      if (this.getMakerAPIs()) {
        sourceHandler.setMakerAPIsEnabled(currentSources.makerAPIsEnabled);
      }

      if (currentSources.selectedSong) {
        sourceHandler.setSelectedSong(currentSources.selectedSong);
      }

      if (currentSources.animations) {
        sourceHandler.setInitialAnimationList(currentSources.animations);
      }

      if (currentSources.libraries) {
        sourceHandler.setInitialLibrariesList(currentSources.libraries);
      }

      if (currentSources.generatedProperties) {
        sourceHandler.setInitialGeneratedProperties(
          currentSources.generatedProperties
        );
      }

      if (isEditing) {
        if (current) {
          if (currentSources.source) {
            sourceHandler.setInitialLevelSource(currentSources.source);
          }
        } else {
          this.setName('My Project');
        }

        if (!appOptions.level.skipRunSave) {
          $(window).on(
            events.appModeChanged,
            this.saveIfSourcesChanged.bind(this)
          );
        }

        $(window).on(
          events.appInitialized,
          function() {
            // Get the initial app code as a baseline
            this.sourceHandler
              .getLevelSource(currentSources.source)
              .then(response => {
                currentSources.source = response;
              });
          }.bind(this)
        );
        $(window).on(events.workspaceChange, function() {
          hasProjectChanged = true;
        });

        if (!appOptions.level.skipAutosave) {
          // Autosave every AUTOSAVE_INTERVAL milliseconds
          window.setInterval(this.autosave.bind(this), AUTOSAVE_INTERVAL);
        }

        if (current.hidden) {
          if (!this.isFrozen()) {
            this.showHeaderForProjectBacked();
          }
        } else {
          if (current.isOwner || !parsePath().channelId) {
            this.showProjectHeader();
          } else {
            // Viewing someone else's project - set share mode
            this.showMinimalProjectHeader();
          }
        }
      } else if (current) {
        this.sourceHandler.setInitialLevelSource(currentSources.source);
        this.showMinimalProjectHeader();
      }
    } else if (appOptions.legacyShareStyle && this.getStandaloneApp()) {
      this.setName('Untitled Project');
      this.showMinimalProjectHeader();
    }
    if (appOptions.noPadding) {
      $('.full_container').css({padding: '0px'});
    }

    // Updates the contents of the admin box for admins. We have no knowledge
    // here whether we're an admin, and depend on dashboard getting this right.
    showProjectAdmin(this);
  },
  projectChanged() {
    hasProjectChanged = true;
  },
  hasOwnerChangedProject() {
    return this.isOwner() && hasProjectChanged;
  },
  /**
   * @returns {string} A UI string containing the name of a new project, which
   *   varies based on the app type and skin.
   */
  getNewProjectName() {
    switch (appOptions.app) {
      case 'applab':
        return msg.defaultProjectNameAppLab();
      case 'gamelab':
        return msg.defaultProjectNameGameLab();
      case 'spritelab':
        return msg.defaultProjectNameSpriteLab();
      case 'weblab':
        return msg.defaultProjectNameWebLab();
      case 'turtle':
        switch (appOptions.skinId) {
          case 'artist':
          case 'artist_zombie':
            return msg.defaultProjectNameArtist();
          case 'anna':
          case 'elsa':
            return msg.defaultProjectNameFrozen();
        }
        break;
      case 'studio':
        if (appOptions.level.useContractEditor) {
          return msg.defaultProjectNameBigGame();
        }
        switch (appOptions.skinId) {
          case 'studio':
            return msg.defaultProjectNamePlayLab();
          case 'infinity':
            return msg.defaultProjectNameInfinity();
          case 'gumball':
            return msg.defaultProjectNameGumball();
          case 'iceage':
            return msg.defaultProjectNameIceAge();
          case 'hoc2015':
            return msg.defaultProjectNameStarWars();
        }
        break;
      case 'craft':
        return msg.defaultProjectNameMinecraft();
      case 'flappy':
        return msg.defaultProjectNameFlappy();
      case 'bounce':
        if (appOptions.skinId === 'sports') {
          return msg.defaultProjectNameSports();
        } else if (appOptions.skinId === 'basketball') {
          return msg.defaultProjectNameBasketball();
        }
        return msg.defaultProjectNameBounce();
      case 'dance':
        return msg.defaultProjectNameDance();
    }
    return msg.defaultProjectName();
  },
  /**
   * @returns {string} The name of the standalone app capable of running
   * this project as a standalone project, or null if none exists.
   */
  getStandaloneApp() {
    if (appOptions.level && appOptions.level.projectType) {
      return appOptions.level.projectType;
    }
    switch (appOptions.app) {
      case 'applab':
      case 'calc':
      case 'dance':
      case 'eval':
      case 'flappy':
      case 'weblab':
      case 'gamelab':
      case 'spritelab':
        return appOptions.app; // Pass through type exactly
      case 'turtle':
        if (appOptions.skinId === 'elsa' || appOptions.skinId === 'anna') {
          return 'frozen';
        } else if (appOptions.level.isK1) {
          return 'artist_k1';
        }
        return 'artist';
      case 'craft':
        if (appOptions.level.isAgentLevel) {
          return 'minecraft_hero';
        } else if (appOptions.level.isEventLevel) {
          return 'minecraft_designer';
        } else if (appOptions.level.isConnectionLevel) {
          return 'minecraft_codebuilder';
        } else if (appOptions.level.isAquaticLevel) {
          return 'minecraft_aquatic';
        }
        return 'minecraft_adventurer';
      case 'studio':
        if (appOptions.level.useContractEditor) {
          return 'algebra_game';
        } else if (appOptions.skinId === 'hoc2015') {
          if (appOptions.droplet) {
            return 'starwars';
          } else {
            return 'starwarsblocks_hour';
          }
        } else if (appOptions.skinId === 'iceage') {
          return 'iceage';
        } else if (appOptions.skinId === 'infinity') {
          return 'infinity';
        } else if (appOptions.skinId === 'gumball') {
          return 'gumball';
        } else if (appOptions.level.isK1) {
          return 'playlab_k1';
        }
        return 'playlab';
      case 'bounce':
        if (appOptions.skinId === 'sports') {
          return 'sports';
        } else if (appOptions.skinId === 'basketball') {
          return 'basketball';
        }
        return 'bounce';
      default:
        return null;
    }
  },

  isWebLab() {
    return this.getStandaloneApp() === 'weblab';
  },

  canServerSideRemix() {
    // The excluded app types need to make modifications to the project that
    // apply to the remixed project, but should not be saved on the original
    // project. See (Turtle|Studio).prepareForRemix().
    // If you're viewing somebody else's project, it will always be based on
    // the standard project level, so that's safe to server-side remix.
    return (
      !current.isOwner ||
      !['artist', 'playlab'].includes(projects.getStandaloneApp())
    );
  },

  /*
   * @returns {boolean} Whether a project can be created for this level type.
   */
  isSupportedLevelType() {
    return !!this.getStandaloneApp();
  },
  /*
   * @returns {boolean} Whether a project should use the sources api.
   */
  useSourcesApi() {
    return this.getStandaloneApp() !== 'weblab';
  },
  /**
   * @returns {string} The path to the app capable of running
   * this project as a standalone app.
   * @throws {Error} If no standalone app exists.
   */
  appToProjectUrl() {
    var app = projects.getStandaloneApp();
    if (!app) {
      throw new Error(
        'This type of project cannot be run as a standalone app.'
      );
    }
    return '/projects/' + app;
  },
  /**
   * Explicitly clear the HTML, circumventing safety measures which prevent it from
   * being accidentally deleted.
   */
  clearHtml() {
    currentSources.html = '';
  },
  /**
   * Saves the project only if the sources {source, html, animations,
   * makerAPIsEnabled, selectedSong} have changed.
   * @returns {Promise} A promise containing the project data if the project
   * was saved, otherwise returns a promise which resolves with no arguments.
   */
  saveIfSourcesChanged() {
    if (!isEditable()) {
      return Promise.resolve();
    }

    return new Promise(resolve => {
      this.getUpdatedSourceAndHtml_(newSources => {
        const sourcesChanged =
          JSON.stringify(currentSources) !== JSON.stringify(newSources);
        if (sourcesChanged || thumbnailChanged) {
          thumbnailChanged = false;
          this.saveSourceAndHtml_(newSources, resolve);
        } else {
          resolve();
        }
      });
    });
  },
  /**
   * Saves the project to the Channels API.
   * @param {boolean} forceNewVersion If true, explicitly create a new version.
   * @param {boolean} preparingRemix Indicates whether this save is part of a remix.
   * @returns {Promise} A promise containing the project data.
   */
  save(forceNewVersion, preparingRemix) {
    if (!isEditable()) {
      return Promise.resolve();
    }

    /**
     * Gets project source from code studio and writes it to the Channels API.
     * @returns {Promise} A Promise containing the new project data, which
     * resolves once the data has been written to the server.
     */
    const completeAsyncSave = () =>
      new Promise((resolve, reject) =>
        this.getUpdatedSourceAndHtml_(sourceAndHtml =>
          this.saveSourceAndHtml_(
            sourceAndHtml,
            (err, result) => (err ? reject(err) : resolve()),
            forceNewVersion,
            preparingRemix
          )
        )
      );

    if (preparingRemix) {
      return this.sourceHandler.prepareForRemix().then(completeAsyncSave);
    } else {
      return completeAsyncSave();
    }
  },

  /**
   * Saves the project to the Channels API and Sources API. Calls `callback` on
   * success if a callback function was provided.
   * @param {object} sourceAndHtml Project source code to save.
   * @param {function} callback Function to be called after saving.
   * @param {boolean} forceNewVersion If true, explicitly create a new version.
   * @param {boolean} [clientSideRemix] If true this is part of a client-side remix, the initial
   *   PUT to a new channel ID.
   * @private
   */
  saveSourceAndHtml_(
    sourceAndHtml,
    callback,
    forceNewVersion,
    clientSideRemix
  ) {
    if (!isEditable()) {
      return;
    }

    header.showProjectSaving();

    // Force a new version if we have not done so recently. This creates
    // periodic "checkpoint" saves if the user works for a long period of time
    // without refreshing the browser window.
    if (lastNewSourceVersionTime + newSourceVersionInterval < Date.now()) {
      forceNewVersion = true;
    }

    if (forceNewVersion) {
      lastNewSourceVersionTime = Date.now();
      replaceCurrentSourceVersion = false;
    }

    var channelId = current.id;
    // TODO(dave): Remove this check and remove clearHtml() once all projects
    // have versioning: https://www.pivotaltracker.com/story/show/103347498
    if (currentSources.html && !sourceAndHtml.html) {
      throw new Error('Attempting to blow away existing levelHtml');
    }

    if (this.getStandaloneApp()) {
      current.level = this.appToProjectUrl();
      current.projectType = this.getStandaloneApp();
    }

    if (thumbnailPngBlob) {
      const blob = thumbnailPngBlob;
      thumbnailPngBlob = null;
      this.saveThumbnail(blob);
    }

    unpackSources(sourceAndHtml);

    if (this.useSourcesApi()) {
      let params = '';
      if (currentSourceVersionId && !clientSideRemix) {
        params =
          `?currentVersion=${currentSourceVersionId}` +
          `&replace=${!!replaceCurrentSourceVersion}` +
          `&firstSaveTimestamp=${encodeURIComponent(firstSaveTimestamp)}` +
          `&tabId=${utils.getTabId()}`;
      }
      const filename = SOURCE_FILE + params;
      sources.put(
        channelId,
        packSources(),
        filename,
        function(err, response) {
          if (err) {
            if (err.message.includes('httpStatusCode: 401')) {
              this.showSaveError_(
                'unauthorized-save-sources-reload',
                saveSourcesErrorCount,
                err.message
              );
              utils.reload();
            } else if (err.message.includes('httpStatusCode: 409')) {
              this.showSaveError_(
                'conflict-save-sources-reload',
                saveSourcesErrorCount,
                err.message
              );
              utils.reload();
            } else {
              saveSourcesErrorCount++;
              this.showSaveError_(
                'save-sources-error',
                saveSourcesErrorCount,
                err.message
              );
              if (saveSourcesErrorCount >= NUM_ERRORS_BEFORE_WARNING) {
                header.showTryAgainDialog();
              }
              return;
            }
          } else if (saveSourcesErrorCount > 0) {
            // If the previous errors occurred due to network problems, we may not
            // have been able to report them. Try to report them once more, now that
            // the network appears to be working again.
            this.logError_(
              'sources-saved-after-errors',
              saveSourcesErrorCount,
              `sources saved after ${saveSourcesErrorCount} consecutive failures`
            );
          }
          saveSourcesErrorCount = 0;
          if (!firstSaveTimestamp) {
            firstSaveTimestamp = response.timestamp;
          }
          currentSourceVersionId = response.versionId;
          replaceCurrentSourceVersion = true;
          current.migratedToS3 = true;

          this.updateChannels_(callback);
        }.bind(this)
      );
    } else {
      this.updateChannels_(callback);
    }
  },

  saveSelectedSong(id) {
    this.sourceHandler.setSelectedSong(id);
    return this.save();
  },

  /**
   * Saves the project to the Channels API. Calls `callback` on success if a
   * callback function was provided.
   * @param {function} callback Function to be called after saving.
   * @private
   */
  updateChannels_(callback) {
    channels.update(
      current.id,
      current,
      function(err, data) {
        initialSaveComplete = true;
        this.updateCurrentData_(err, data, false);
        executeCallback(callback, err, data);
      }.bind(this)
    );
  },

  getSourceForChannel(channelId, callback) {
    channels.fetch(channelId, function(err, data) {
      if (err) {
        executeCallback(callback, null);
      } else {
        var url = channelId + '/' + SOURCE_FILE;
        sources.fetch(url, function(err, data) {
          if (err) {
            executeCallback(callback, null);
          } else {
            executeCallback(callback, data.source);
          }
        });
      }
    });
  },

  createNewChannelFromSource(source, callback) {
    channels.create(
      {
        name: 'New Project'
      },
      (err, channelData) => {
        sources.put(
          channelData.id,
          JSON.stringify({source}),
          SOURCE_FILE,
          (err, sourceData) => {
            channelData.migratedToS3 = true;
            channels.update(
              channelData.id,
              channelData,
              (err, finalChannelData) => {
                executeCallback(callback, finalChannelData);
              }
            );
          }
        );
      }
    );
  },

  /**
   * Ask the configured sourceHandler for the latest project save data and
   * pass it to the provided callback.
   * @param {function} callback
   * @private
   */
  getUpdatedSourceAndHtml_(callback) {
    this.sourceHandler.getAnimationList(animations =>
      this.sourceHandler.getLevelSource().then(source => {
        const html = this.sourceHandler.getLevelHtml();
        const makerAPIsEnabled = this.sourceHandler.getMakerAPIsEnabled();
        const selectedSong = this.sourceHandler.getSelectedSong();
        const generatedProperties = this.sourceHandler.getGeneratedProperties();
        const libraries = this.sourceHandler.getLibrariesList();
        callback({
          source,
          html,
          animations,
          makerAPIsEnabled,
          selectedSong,
          generatedProperties,
          libraries
        });
      })
    );
  },

  getSelectedSong() {
    return currentSources.selectedSong;
  },

  getGeneratedProperties() {
    return currentSources.generatedProperties;
  },

  /**
   * Save the project with the maker API state set, then reload the page
   * so that the toolbox gets re-initialized.
   * @returns {Promise} (mostly useful for tests)
   */
  setMakerEnabled(apisEnabled) {
    return new Promise(resolve => {
      this.getUpdatedSourceAndHtml_(sourceAndHtml => {
        this.saveSourceAndHtml_(
          {
            ...sourceAndHtml,
            makerAPIsEnabled: apisEnabled
          },
          () => {
            resolve();
            utils.reload();
          }
        );
      });
    });
  },
  setProjectLibraries(updatedLibrariesList) {
    if (appOptions.level.editBlocks) {
      // If we're in start_blocks on levelbuilder, reload is disabled, so we
      // need to set currentSources so it can be saved when the save button is
      // clicked.
      currentSources.libraries = updatedLibrariesList;
      updatedLibrariesList.forEach(library => {
        library.fromLevelbuilder = true;
      });
    }
    return new Promise(resolve => {
      this.getUpdatedSourceAndHtml_(sourceAndHtml => {
        this.saveSourceAndHtml_(
          {
            ...sourceAndHtml,
            libraries: updatedLibrariesList
          },
          () => {
            resolve();
            utils.reload();
          }
        );
      });
    });
  },
  getProjectLibraries() {
    let startLibraries = appOptions.level.startLibraries;
    return (
      currentSources.libraries || (startLibraries && JSON.parse(startLibraries))
    );
  },
  /**
   * @returns {string} searches through all data we have on a level to find its
   * name.
   */
  getLevelName() {
    let name = current && current.name;
    name = name || appOptions.level.name;
    return name;
  },
  showSaveError_(errorType, errorCount, errorText) {
    header.showProjectSaveError();
    this.logError_(errorType, errorCount, errorText);
  },
  logError_: function(errorType, errorCount, errorText) {
    // Share URLs only make sense for standalone app types.
    // This includes most app types, but excludes pixelation.
    const shareUrl = this.getStandaloneApp() ? this.getShareUrl() : '';

    firehoseClient.putRecord(
      {
        study: 'project-data-integrity',
        study_group: 'v4',
        event: errorType,
        data_int: errorCount,
        project_id: current && current.id + '',
        data_string: errorText,
        // Some fields in the data_json are repeated in separate fields above, so
        // that they can be easily searched on as separate fields, and also have
        // appropriately descriptive names in the data_json.
        data_json: JSON.stringify({
          errorCount: errorCount,
          errorText: errorText,
          isOwner: this.isOwner(),
          currentUrl: window.location.href,
          shareUrl: shareUrl,
          currentSourceVersionId: currentSourceVersionId
        })
      },
      {includeUserId: true}
    );
  },
  updateCurrentData_(err, data, options = {}) {
    const {shouldNavigate} = options;
    if (err) {
      saveChannelErrorCount++;
      this.showSaveError_(
        'save-channel-error',
        saveChannelErrorCount,
        err + ''
      );
      if (saveChannelErrorCount >= NUM_ERRORS_BEFORE_WARNING) {
        header.showTryAgainDialog();
      }
      return;
    } else if (saveChannelErrorCount) {
      // If the previous errors occurred due to network problems, we may not
      // have been able to report them. Try to report them once more, now that
      // the network appears to be working again.
      this.logError_(
        'channel-saved-after-errors',
        saveChannelErrorCount,
        `channel save succeeded after ${saveChannelErrorCount} consecutive failures`
      );
    }
    saveChannelErrorCount = 0;
    header.hideTryAgainDialog();

    // The following race condition can lead to thumbnail URLs not being stored
    // in the project metadata:
    //   1. Run button is pressed
    //   2. channel.update() is called during project.save()
    //   3. project.saveThumbnail() completes
    //   4. updateCurrentData_ is called in the callback from channel.update
    //
    // Work around this by merging in new data into the existing data rather
    // than overwriting it, preserving any newly-added thumbnail url. Revisit
    // this if we ever change the thumbnail url, since the same race condition
    // would clobber any changes to existing fields.

    current = current || {};
    Object.assign(current, data);

    if (shouldNavigate) {
      // If we are at a /projects/<appname> link, we can display the project
      // without navigating and we just need to update the url.
      if (isEditing && parsePath().appName) {
        if (window.history.pushState) {
          window.history.pushState(
            null,
            document.title,
            this.getPathName('edit')
          );
        }
      } else {
        // We're on a legacy share page or script level, so we must navigate
        // in order to display the project.
        location.href = this.getPathName('edit');
      }
    }
    header.updateTimestamp();
  },
  /**
   * Autosave the code if things have changed. Calls `callback` if autosave was
   * not needed or after autosave success if a callback function was provided.
   * @param {function} callback Function to be called after saving.
   */
  autosave(callback) {
    const callCallback = () => {
      if (callback) {
        callback();
      }
    };
    // Bail if baseline code doesn't exist (app not yet initialized)
    if (currentSources.source === null) {
      callCallback();
      return;
    }
    // `getLevelSource()` is expensive for Blockly so only call
    // after `workspaceChange` has fired
    if (!appOptions.droplet && !hasProjectChanged) {
      callCallback();
      return;
    }

    if ($('#designModeViz .ui-draggable-dragging').length !== 0) {
      callCallback();
      return;
    }

    this.getUpdatedSourceAndHtml_(newSources => {
      if (JSON.stringify(currentSources) === JSON.stringify(newSources)) {
        hasProjectChanged = false;
        callCallback();
        return;
      }

      this.saveSourceAndHtml_(newSources, () => {
        hasProjectChanged = false;
        callCallback();
      });
    });
  },
  /**
   * Renames and saves the project.
   * @param {string} newName
   * @return {Promise}
   */
  rename(newName) {
    this.setName(newName);
    return this.save().catch(error => {
      if (error.responseText) {
        const parsed = JSON.parse(error.responseText);
        throw new NameFailureError(parsed['nameFailure']);
      } else {
        throw new Error('Unknown error');
      }
    });
  },
  /**
   * Freezes the project. Also hides so that it's not available for
   * deleting/renaming in the user's project list.
   */
  freeze(callback) {
    if (!(current && current.isOwner)) {
      return;
    }
    current.frozen = true;
    current.hidden = true;
    this.updateChannels_(callback);
  },

  /**
   * Unfreezes the project. Also unhides so that it's available for
   * deleting/renaming in the user's project list.
   */
  unfreeze(callback) {
    if (!(current && current.isOwner)) {
      return;
    }
    current.frozen = false;
    current.hidden = false;
    this.updateChannels_(callback);
  },

  /**
   * Creates a copy of the project, gives it the provided name, and sets the
   * copy as the current project.
   * @param {string} newName
   * @param {Object} options Optional parameters.
   * @param {boolean} options.shouldNavigate Whether to navigate to the project URL.
   * @param {boolean} options.shouldPublish Whether to publish the new project.
   * @returns {Promise} Promise which resolves when the operation is complete.
   */
  copy(newName, options = {}) {
    const {shouldPublish} = options;
    current = current || {};
    const queryParams = current.id ? {parent: current.id} : null;
    delete current.id;
    delete current.hidden;
    delete current.libraryName;
    delete current.libraryDescription;
    current.projectType = this.getStandaloneApp();
    if (shouldPublish) {
      current.shouldPublish = true;
    }
    this.setName(newName);
    return new Promise((resolve, reject) => {
      channels.create(
        current,
        (err, data) => {
          this.updateCurrentData_(err, data, options);
          err ? reject(err) : resolve();
        },
        queryParams
      );
    }).then(() =>
      this.save(false /* forceNewVersion */, true /* preparingRemix */)
    );
  },
  copyAssets(srcChannel, callback) {
    if (!srcChannel) {
      executeCallback(callback);
      return;
    }
    var destChannel = current.id;
    assets.copyAll(srcChannel, destChannel, function(err) {
      if (err) {
        header.showProjectSaveError();
        return;
      }
      executeCallback(callback);
    });
  },
  copyAnimations(srcChannel, callback) {
    if (!srcChannel) {
      executeCallback(callback);
      return;
    }
    // TODO: Copy animation assets to new channel
    executeCallback(callback);
  },

  /** @returns {Promise} resolved after remix (for testing) */
  async serverSideRemix() {
    if (current && !current.name) {
      const url = projects.appToProjectUrl();
      this.setName(
        url === '/projects/algebra_game' ? 'Big Game Template' : 'My Project'
      );
    }
    function redirectToRemix() {
      utils.navigateToHref(`${projects.getPathName('remix')}`);
    }
    // If the user is the owner, save before remixing on the server.
    if (current.isOwner) {
      await projects.save(false, true).then(redirectToRemix);
    } else {
      redirectToRemix();
    }
  },
  createNew() {
    const url = `${projects.appToProjectUrl()}/new`;
    projects.save().then(() => {
      location.href = url;
    });
  },
  delete(callback) {
    var channelId = current.id;
    channels.delete(channelId, function(err, data) {
      executeCallback(callback, data);
    });
  },

  /**
   * @returns {Promise} A Promise which will resolve when the project loads.
   */
  load() {
    if (projects.isProjectLevel()) {
      if (redirectFromHashUrl() || redirectEditView()) {
        return Promise.resolve();
      }
      return this.loadStandaloneProject_();
    } else if (appOptions.channel) {
      return this.loadProjectBackedLevel_();
    } else {
      return Promise.resolve();
    }
  },

  /**
   * Loads the channel and source for a standalone project. The channel id
   * is determined by parsing the current url path.
   * @returns {Promise} A Promise which will resolve when the project loads.
   */
  loadStandaloneProject_: function() {
    var pathInfo = parsePath();

    if (pathInfo.channelId) {
      if (pathInfo.action === 'edit') {
        isEditing = true;
      } else {
        $('#betainfo').hide();
      }

      // Load the project ID, if one exists
      return this.fetchChannel(pathInfo.channelId)
        .catch(err => {
          if (err.message.includes('error: Not Found')) {
            // Project not found. Redirect to the most recent project of this
            // type, or a new project of this type if none exists.
            const newPath = utils
              .currentLocation()
              .pathname.split('/')
              .slice(PathPart.START, PathPart.APP + 1)
              .join('/');
            utils.navigateToHref(newPath);
          }
          // Reject even after navigation, to allow unit tests which stub
          // navigateToHref to confirm that navigation has happened.
          return Promise.reject(err);
        })
        .then(this.fetchSource.bind(this))
        .then(() => {
          if (current.isOwner && pathInfo.action === 'view') {
            isEditing = true;
          }
          return fetchAbuseScoreAndPrivacyViolations(this);
        });
    } else {
      isEditing = true;
      return Promise.resolve();
    }
  },

  /**
   * Loads the channel and source for a project-backed level. The channel id
   * is determined by appOptions.channel.
   * @returns {Promise} A Promise which will resolve when the project loads.
   */
  loadProjectBackedLevel_: function() {
    isEditing = true;
    return this.fetchChannel(appOptions.channel)
      .then(this.fetchSource.bind(this))
      .then(() => {
        projects.showHeaderForProjectBacked();
        return fetchAbuseScoreAndPrivacyViolations(this);
      });
  },

  /**
   * Generates the url to perform the specified action for this project.
   * @param {string} action Action to perform.
   * @param {string} projectId Optional Project ID (defaults to current ID).
   * @returns {string} Url to the specified action.
   * @throws {Error} If this type of project does not have a standalone app.
   */
  getPathName(action, projectId = this.getCurrentId()) {
    let pathName = this.appToProjectUrl() + '/' + projectId;
    if (action) {
      pathName += '/' + action;
    }
    return pathName;
  },

  /**
   * Returns the URL stored in current.thumbnailUrl.
   * @returns {string} The thumbnail URL.
   */
  getThumbnailUrl() {
    return current && current.thumbnailUrl;
  },

  setThumbnailUrl() {
    current.thumbnailUrl = `/v3/files/${current.id}/${THUMBNAIL_PATH}`;
    thumbnailChanged = true;
  },

  /**
   * Sets the thumbnailPngBlob variable. Caveat: This does not save the thumbnail to the server.
   * Use the saveThumbnail method to do that.
   * @param {Blob} pngBlob A Blob in PNG format containing the thumbnail image.
   */
  setThumbnailPngBlob(pngBlob) {
    if (pngBlob) {
      thumbnailPngBlob = pngBlob;
      projects.setThumbnailUrl();
    }
  },

  /**
   * Uploads a thumbnail image to the thumbnail path in the files API. If
   * successful, stores a URL to access the thumbnail in current.thumbnailUrl.
   * @param {Blob} pngBlob A Blob in PNG format containing the thumbnail image.
   * @returns {Promise} A promise indicating whether the upload was successful.
   */
  saveThumbnail(pngBlob) {
    if (!pngBlob) {
      return Promise.reject('PNG blob required.');
    }
    if (!current) {
      return Promise.reject('Project not initialized.');
    }
    if (!current.isOwner) {
      return Promise.reject('Project not owned by current user.');
    }

    return new Promise((resolve, reject) => {
      filesApi.putFile(
        THUMBNAIL_PATH,
        pngBlob,
        () => {
          projects.setThumbnailUrl();
          if (!initialCaptureComplete) {
            initialCaptureComplete = true;
          }
          resolve();
        },
        error => {
          reject(`error saving thumbnail image: ${error}`);
        }
      );
    });
  },

  /**
   * Set the publishedAt date in our copy of the project data.
   * @param {string|null} publishedAt
   */
  setPublishedAt(publishedAt) {
    current = current || {};
    current.publishedAt = publishedAt;
  },

  /**
   * Given a channel id, fetches the channel's data from the server.
   * @param {string} channelId to fetch.
   * @returns {Promise} A promise which resolves with the channel data.
   */
  fetchChannel(channelId) {
    return new Promise((resolve, reject) => {
      channels.fetch(channelId, (err, data) =>
        err ? reject(err) : resolve(data)
      );
    }).catch(err => {
      this.logError_(
        'load-channel-error',
        null,
        `unable to fetch project channel: ${err}`
      );
      return Promise.reject(err);
    });
  },

  /**
   * Given data from our channels api, updates current and gets sources from
   * sources api
   * @param {object} channelData Data we fetched from channels api
   * @param {string?} version Optional version to load
   * @returns {Promise} A promise that resolves when the source is loaded.
   */
  fetchSource(channelData) {
    // Explicitly remove levelSource/levelHtml from channels
    delete channelData.levelSource;
    delete channelData.levelHtml;
    // Also clear out html, which we never should have been setting.
    delete channelData.html;

    // Update current
    current = channelData;

    projects.setTitle(current.name);
    const sourcesApi = this.getSourcesApi_();
    if (sourcesApi && channelData.migratedToS3) {
      var url = current.id + '/' + SOURCE_FILE;
      const version = queryParams('version');
      if (version) {
        url += '?version=' + version;
      }
      return new Promise((resolve, reject) => {
        sourcesApi.fetch(url, (err, data, jqXHR) =>
          err ? reject(err) : resolve({data, jqXHR})
        );
      })
        .catch(err => {
          this.logError_(
            'load-sources-error',
            null,
            `unable to fetch project source file: ${err}`
          );
          return Promise.reject(err);
        })
        .then(({data, jqXHR}) => {
          currentSourceVersionId =
            jqXHR && jqXHR.getResponseHeader('S3-Version-Id');
          unpackSources(data);
        });
    } else {
      // It's possible that we created a channel, but failed to save anything to
      // S3. In this case, it's expected that html/levelSource are null.
      return Promise.resolve();
    }
  },

  getSourcesApi_() {
    // Use the sources-public API for dancelab shares. Responses from this API
    // can be publicly cached, which is helpful for HoC scalability in the
    // celebrity tweet scenario where a single share link gets many hits.
    const useSourcesPublic =
      appOptions.share &&
      appOptions.level &&
      appOptions.level.projectType === 'dance';
    let sourcesApi;
    if (this.useSourcesApi()) {
      sourcesApi = useSourcesPublic ? sourcesPublic : sources;
    }
    return sourcesApi;
  }
});

function fetchAbuseScore(resolve) {
  channels.fetch(current.id + '/abuse', function(err, data) {
    currentAbuseScore = (data && data.abuse_score) || currentAbuseScore;
    resolve();
    if (err) {
      // Throw an error so that things like New Relic see this. This shouldn't
      // affect anything else
      throw err;
    }
  });
}

function fetchSharingDisabled(resolve) {
  channels.fetch(current.id + '/sharing_disabled', function(err, data) {
    sharingDisabled = (data && data.sharing_disabled) || sharingDisabled;
    resolve();
    if (err) {
      // Throw an error so that things like New Relic see this. This shouldn't
      // affect anything else
      throw err;
    }
  });
}

function fetchShareFailure(resolve) {
  channels.fetch(current.id + '/share-failure', function(err, data) {
    currentShareFailureEnglish =
      data && data.share_failure && data.share_failure.content
        ? data.share_failure.content
        : currentShareFailureEnglish;
    currentShareFailureIntl =
      data && data.intl_share_failure && data.intl_share_failure.content
        ? data.intl_share_failure.content
        : currentShareFailureIntl;
    intlLanguage = data && data.language ? data.language : intlLanguage;
    resolve();
    if (err) {
      // Throw an error so that things like New Relic see this. This shouldn't
      // affect anything else
      throw err;
    }
  });
}

function fetchPrivacyProfanityViolations(resolve) {
  channels.fetch(current.id + '/privacy-profanity', (err, data) => {
    // data.has_violation is 0 or true, coerce to a boolean
    currentHasPrivacyProfanityViolation =
      (data && !!data.has_violation) || currentHasPrivacyProfanityViolation;
    resolve();
    if (err) {
      // Throw an error so that things like New Relic see this. This shouldn't
      // affect anything else
      throw err;
    }
  });
}

/**
 * @param project
 * @returns {Promise} A Promise which resolves when all network calls complete.
 */
function fetchAbuseScoreAndPrivacyViolations(project) {
  const promises = [
    new Promise(fetchAbuseScore),
    new Promise(fetchShareFailure)
  ];

  if (project.getStandaloneApp() === 'playlab') {
    promises.push(new Promise(fetchPrivacyProfanityViolations));
  } else if (
    project.getStandaloneApp() === 'applab' ||
    project.getStandaloneApp() === 'gamelab' ||
    project.isWebLab()
  ) {
    promises.push(new Promise(fetchSharingDisabled));
  }
  return Promise.all(promises);
}

/**
 * Allow setting Maker APIs enabled / disabled via URL parameters.
 */
function setMakerAPIsStatusFromQueryParams() {
  if (hasQueryParam('enableMaker')) {
    currentSources.makerAPIsEnabled = CP_API;
    updateQueryParam('enableMaker', undefined, true);
  }

  if (hasQueryParam('disableMaker')) {
    currentSources.makerAPIsEnabled = null;
    updateQueryParam('disableMaker', undefined, true);
  }
}

/**
 * If a level itself has makerlabEnabled, set that for this project's source.
 * This is the case with New Maker Lab Project.level, and projects created
 * based off of that template (/p/makerlab), done prior to maker API support
 * within applab.
 *
 * Note: for backwards compatibility, levels with makerLabEnabled default to circuitPlayground
 */
function setMakerAPIsStatusFromLevel() {
  if (appOptions.level.makerlabEnabled) {
    currentSources.makerAPIsEnabled = CP_API;
  }
}

/**
 * Only execute the given argument if it is a function.
 * @param callback
 */
function executeCallback(callback, ...args) {
  if (typeof callback === 'function') {
    callback(...args);
  }
}

/**
 * is the current project (if any) editable by the logged in user (if any)?
 */
function isEditable() {
  return (
    current && current.isOwner && !current.frozen && !queryParams('version')
  );
}

/**
 * If the current user is the owner, we want to redirect from the readonly
 * /view route to /edit. If they are not the owner, we want to redirect from
 * /edit to /view
 */
function redirectEditView() {
  var parseInfo = parsePath();
  if (!parseInfo.action) {
    return;
  }
  // don't do any redirecting if we havent loaded a channel yet
  if (!current) {
    return;
  }
  var newUrl;
  if (parseInfo.action === 'view' && isEditable()) {
    // Redirect to /edit without a readonly workspace
    newUrl = location.href.replace(
      /(\/projects\/[^/]+\/[^/]+)\/view/,
      '$1/edit'
    );
    appOptions.readonlyWorkspace = false;
    isEditing = true;
  } else if (parseInfo.action === 'edit' && !isEditable()) {
    // Redirect to /view with a readonly workspace
    newUrl = location.href.replace(
      /(\/projects\/[^/]+\/[^/]+)\/edit/,
      '$1/view'
    );
    appOptions.readonlyWorkspace = true;
    isEditing = false;
  }

  // PushState to the new Url if we can, otherwise do nothing.
  if (newUrl && newUrl !== location.href && window.history.pushState) {
    window.history.pushState({modified: true}, document.title, newUrl);
  }
  return false;
}

/**
 * Does a hard redirect if we end up with a hash based projects url. This can
 * happen on IE9, when we save a new project for hte first time.
 * @returns {boolean} True if we did an actual redirect
 */
function redirectFromHashUrl() {
  var newUrl = location.href.replace('#', '/');
  if (newUrl === location.href) {
    // Nothing changed
    return false;
  }

  location.href = newUrl;
  return true;
}

/**
 * Extracts the channelId/action from the pathname, accounting for the fact
 * that we may have hash based route or not
 */
function parsePath() {
  var pathname = utils.currentLocation().pathname;

  // We have a hash based route. Replace the hash with a slash, and append to
  // our existing path
  if (utils.currentLocation().hash) {
    pathname += utils.currentLocation().hash.replace('#', '/');
  }

  var tokens = pathname.split('/');

  if (
    tokens[PathPart.PROJECTS] !== 'p' &&
    tokens[PathPart.PROJECTS] !== 'projects'
  ) {
    return {
      appName: null,
      channelId: null,
      action: null
    };
  }

  // projects can optionally be embedded without making their source available.
  // to keep people from just twiddling the url to get to the regular project page,
  // we encode the channel id using a simple cipher. This is not meant to be secure
  // in any way, just meant to make it slightly less trivial than changing the url
  // to get to the project source. The channel id gets encoded when generating the
  // embed url. Since a lot of our javascript depends on having the decoded channel
  // id, we do that here when parsing the page's path.
  let channelId = tokens[PathPart.CHANNEL_ID];
  if (utils.currentLocation().search.indexOf('nosource') >= 0) {
    channelId = channelId
      .split('')
      .map(char => ALPHABET[CIPHER.indexOf(char)] || char)
      .join('');
  }

  return {
    appName: tokens[PathPart.APP],
    channelId,
    action: tokens[PathPart.ACTION]
  };
}
