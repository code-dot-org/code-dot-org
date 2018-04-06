/* global dashboard, appOptions */
import $ from 'jquery';
import msg from '@cdo/locale';
import * as utils from '../../utils';
import {CIPHER, ALPHABET} from '../../constants';
import {files as filesApi} from '../../clientApi';
import firehoseClient from '@cdo/apps/lib/util/firehose';

// Attempt to save projects every 30 seconds
var AUTOSAVE_INTERVAL = 30 * 1000;

var ABUSE_THRESHOLD = 10;

var hasProjectChanged = false;

var assets = require('./clientApi').create('/v3/assets');
var files = require('./clientApi').create('/v3/files');
var sources = require('./clientApi').create('/v3/sources');
var channels = require('./clientApi').create('/v3/channels');

var showProjectAdmin = require('../showProjectAdmin');
var header = require('../header');
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
var isEditing = false;
let initialSaveComplete = false;
let initialCaptureComplete = false;
let thumbnailChanged = false;

/**
 * Current state of our sources API data
 */
var currentSources = {
  source: null,
  html: null,
  makerAPIsEnabled: false,
  animations: null
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
    makerAPIsEnabled: data.makerAPIsEnabled
  };
}

/**
 * Used by getProjectUrl() to extract the project URL.
 */
const PROJECT_URL_PATTERN = /^(.*\/projects\/\w+\/[\w\d-]+)\/.*/;

var projects = module.exports = {
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
      return `${location.protocol}//${subdomain}codeprojects.org${port}/${this.getCurrentId()}`;
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
   * Whether this project's source has Maker APIs enabled.
   * @returns {boolean}
   */
  useMakerAPIs() {
    return currentSources.makerAPIsEnabled;
  },

  getCurrentSourceVersionId() {
    return currentSourceVersionId;
  },

  /**
   * Sets abuse score to zero, saves the project, and reloads the page
   */
  adminResetAbuseScore() {
    var id = this.getCurrentId();
    if (!id) {
      return;
    }
    channels.delete(id + '/abuse', function (err, result) {
      if (err) {
        throw err;
      }
      assets.patchAll(id, 'abuse_score=0', null, function (err, result) {
        if (err) {
          throw err;
        }
      });
      files.patchAll(id, 'abuse_score=0', null, function (err, result) {
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
    return (appOptions.level && appOptions.level.isProjectLevel);
  },

  shouldUpdateHeaders() {
    return !appOptions.isExternalProjectLevel;
  },

  showProjectHeader() {
    if (this.shouldUpdateHeaders()) {
      header.showProjectHeader();
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
    return (appOptions.level && appOptions.level.hideShareAndRemix) ||
      (appOptions.embed && (appOptions.app === 'applab' || appOptions.app === 'gamelab'));
  },

  showHeaderForProjectBacked() {
    if (this.shouldUpdateHeaders()) {
      header.showHeaderForProjectBacked({
        showShareAndRemix: !this.shouldHideShareAndRemix()
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
   * @param {function(boolean)} sourceHandler.setMakerAPIsEnabled
   * @param {function(): boolean} sourceHandler.getMakerAPIsEnabled
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
      if (currentSources.makerAPIsEnabled) {
        sourceHandler.setMakerAPIsEnabled(currentSources.makerAPIsEnabled);
      }

      if (currentSources.animations) {
        sourceHandler.setInitialAnimationList(currentSources.animations);
      }

      if (isEditing) {
        if (current) {
          if (currentSources.source) {
            sourceHandler.setInitialLevelSource(currentSources.source);
          }
        } else {
          this.setName('My Project');
        }

        $(window).on(events.appModeChanged, function (event, callback) {
          this.saveIfSourcesChanged().then(callback);
        }.bind(this));

        // Autosave every AUTOSAVE_INTERVAL milliseconds
        $(window).on(events.appInitialized, function () {
          // Get the initial app code as a baseline
          this.sourceHandler.getLevelSource(currentSources.source).then(response => {
            currentSources.source = response;
          });
        }.bind(this));
        $(window).on(events.workspaceChange, function () {
          hasProjectChanged = true;
        });
        window.setInterval(this.autosave.bind(this), AUTOSAVE_INTERVAL);

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
    } else if (appOptions.isLegacyShare && this.getStandaloneApp()) {
      this.setName('Untitled Project');
      this.showMinimalProjectHeader();
    }
    if (appOptions.noPadding) {
      $(".full_container").css({"padding":"0px"});
    }


    // Updates the contents of the admin box for admins. We have no knowledge
    // here whether we're an admin, and depend on dashboard getting this right.
    showProjectAdmin();
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
        return 'applab';
      case 'gamelab':
        return 'gamelab';
      case 'turtle':
        if (appOptions.skinId === 'elsa' || appOptions.skinId === 'anna') {
          return 'frozen';
        } else if (appOptions.level.isK1) {
          return 'artist_k1';
        }
        return 'artist';
      case 'calc':
        return 'calc';
      case 'craft':
        if (appOptions.level.isAgentLevel) {
          return 'minecraft_hero';
        } else if (appOptions.level.isEventLevel) {
          return 'minecraft_designer';
        } else if (appOptions.level.isConnectionLevel) {
          return 'minecraft_codebuilder';
        }
        return 'minecraft_adventurer';
      case 'eval':
        return 'eval';
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
      case 'weblab':
        return 'weblab';
      case 'flappy':
        return 'flappy';
      case 'scratch':
        return 'scratch';
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
    return !current.isOwner || !['artist', 'playlab'].includes(projects.getStandaloneApp());
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
      throw new Error('This type of project cannot be run as a standalone app.');
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
   * makerAPIsEnabled} have changed.
   * @returns {Promise} A promise containing the project data if the project
   * was saved, otherwise returns a promise which resolves with no arguments.
   */
  saveIfSourcesChanged() {
    if (!isEditable()) {
      return Promise.resolve();
    }

    return new Promise(resolve => {
      this.getUpdatedSourceAndHtml_(newSources => {
        const sourcesChanged = (JSON.stringify(currentSources) !== JSON.stringify(newSources));
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
    const completeAsyncSave = () => new Promise(resolve =>
      this.getUpdatedSourceAndHtml_(sourceAndHtml =>
        this.saveSourceAndHtml_(sourceAndHtml, resolve, forceNewVersion)));

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
   * @private
   */
  saveSourceAndHtml_(sourceAndHtml, callback, forceNewVersion) {
    if (!isEditable()) {
      return;
    }

    $('.project_updated_at').text(msg.saving());

    // Force a new version if we have not done so recently. This creates
    // periodic "checkpoint" saves if the user works for a long period of time
    // without refreshing the browser window.
    if (lastNewSourceVersionTime + newSourceVersionInterval < Date.now()) {
      forceNewVersion = true;
    }

    if (forceNewVersion) {
      lastNewSourceVersionTime = Date.now();
      currentSourceVersionId = null;
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

    unpackSources(sourceAndHtml);

    if (this.useSourcesApi()) {
      let params = '';
      if (currentSourceVersionId) {
        params = `?version=${currentSourceVersionId}` +
          `&firstSaveTimestamp=${encodeURIComponent(firstSaveTimestamp)}` +
          `&tabId=${utils.getTabId()}`;
      }
      const filename = SOURCE_FILE + params;
      sources.put(channelId, packSources(), filename, function (err, response) {
        if (err) {
          if (err.message.includes('httpStatusCode: 401')) {
            this.showSaveError_('unauthorized-save-sources-reload', saveSourcesErrorCount, err.message);
            window.location.reload();
          } else {
            saveSourcesErrorCount++;
            this.showSaveError_('save-sources-error', saveSourcesErrorCount, err.message);
            return;
          }
        }
        saveSourcesErrorCount = 0;
        if (!firstSaveTimestamp) {
          firstSaveTimestamp = response.timestamp;
        }
        currentSourceVersionId = response.versionId;
        current.migratedToS3 = true;

        this.updateChannels_(callback);
      }.bind(this));
    } else {
      this.updateChannels_(callback);
    }
  },

  /**
   * Saves the project to the Channels API. Calls `callback` on success if a
   * callback function was provided.
   * @param {function} callback Function to be called after saving.
   * @private
   */
  updateChannels_(callback) {
    channels.update(current.id, current, function (err, data) {
      initialSaveComplete = true;
      this.updateCurrentData_(err, data, false);
      executeCallback(callback, data);
    }.bind(this));
  },

  getSourceForChannel(channelId, callback) {
    channels.fetch(channelId, function (err, data) {
      if (err) {
        executeCallback(callback, null);
      } else {
        var url = channelId + '/' + SOURCE_FILE;
        sources.fetch(url, function (err, data) {
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
    channels.create({
      name: "New Project",
    }, (err, channelData) => {
      sources.put(channelData.id, JSON.stringify({ source }), SOURCE_FILE, (err, sourceData) => {
        channelData.migratedToS3 = true;
        channels.update(channelData.id, channelData, (err, finalChannelData) => {
          executeCallback(callback, finalChannelData);
        });
      });
    });
  },

  /**
   * Ask the configured sourceHandler for the latest project save data and
   * pass it to the provided callback.
   * @param {function} callback
   * @private
   */
  getUpdatedSourceAndHtml_(callback) {
    this.sourceHandler.getAnimationList(animations =>
      this.sourceHandler.getLevelSource().then(response => {
        const source = response;
        const html = this.sourceHandler.getLevelHtml();
        const makerAPIsEnabled = this.sourceHandler.getMakerAPIsEnabled();
        callback({source, html, animations, makerAPIsEnabled});
      }));
  },

  /**
   * Save the project with the maker API state toggled, then reload the page
   * so that the toolbox gets re-initialized.
   * @returns {Promise} (mostly useful for tests)
   */
  toggleMakerEnabled() {
    return new Promise(resolve => {
      this.getUpdatedSourceAndHtml_(sourceAndHtml => {
        this.saveSourceAndHtml_(
          {
            ...sourceAndHtml,
            makerAPIsEnabled: !sourceAndHtml.makerAPIsEnabled,
          },
          () => {
            resolve();
            utils.reload();
          }
        );
      });
    });
  },
  showSaveError_(errorType, errorCount, errorText) {
    header.showProjectSaveError();
    firehoseClient.putRecord(
      {
        study: 'project-data-integrity',
        study_group: 'v3',
        event: errorType,
        data_int: errorCount,
        project_id: current.id + '',
        data_string: errorText,
        // Some fields in the data_json are repeated in separate fields above, so
        // that they can be easily searched on as separate fields, and also have
        // appropriately descriptive names in the data_json.
        data_json: JSON.stringify({
          errorCount: errorCount,
          errorText: errorText,
          isOwner: this.isOwner(),
          currentUrl: window.location.href,
          shareUrl: this.getShareUrl(),
          currentSourceVersionId: currentSourceVersionId,
        }),
      },
      {includeUserId: true}
    );
  },
  updateCurrentData_(err, data, options = {}) {
    const { shouldNavigate } = options;
    if (err) {
      saveChannelErrorCount++;
      this.showSaveError_('save-channel-error', saveChannelErrorCount, err + '');
      return;
    }
    saveChannelErrorCount = 0;

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
          window.history.pushState(null, document.title, this.getPathName('edit'));
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
   */
  rename(newName, callback) {
    this.setName(newName);
    this.save().then(callback);
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
   * Creates a copy of the project, gives it the provided name, and sets the
   * copy as the current project.
   * @param {string} newName
   * @param {Object} options Optional parameters.
   * @param {boolean} options.shouldNavigate Whether to navigate to the project URL.
   * @param {boolean} options.shouldPublish Whether to publish the new project.
   * @returns {Promise} Promise which resolves when the operation is complete.
   */
  copy(newName, options = {}) {
    const { shouldPublish } = options;
    current = current || {};
    const queryParams = current.id ? {parent: current.id} : null;
    delete current.id;
    delete current.hidden;
    if (shouldPublish) {
      current.shouldPublish = true;
      current.projectType = this.getStandaloneApp();
    }
    this.setName(newName);
    return new Promise((resolve, reject) => {
      channels.create(current, (err, data) => {
        this.updateCurrentData_(err, data, options);
        err ? reject(err) : resolve();
      }, queryParams);
    }).then(() => this.save(
      false /* forceNewVersion */,
      true /* preparingRemix */
    ));
  },
  copyAssets(srcChannel, callback) {
    if (!srcChannel) {
      executeCallback(callback);
      return;
    }
    var destChannel = current.id;
    assets.copyAll(srcChannel, destChannel, function (err) {
      if (err) {
        $('.project_updated_at').text('Error copying files');  // TODO i18n
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
  serverSideRemix() {
    if (current && !current.name) {
      var url = projects.appToProjectUrl();
      if (url === '/projects/algebra_game') {
        this.setName('Big Game Template');
      } else if (url === '/projects/applab' ||
          url === '/projects/makerlab' ||
          url === '/projects/gamelab' ||
          url === '/projects/weblab') {
        this.setName('My Project');
      }
    }
    function redirectToRemix() {
      const url = `${projects.getPathName('remix')}`;
      location.href = url;
    }
    // If the user is the owner, save before remixing on the server.
    if (current.isOwner) {
      projects.save(false, true).then(redirectToRemix);
    } else if (current.isOwner) {
      this.sourceHandler.prepareForRemix().then(redirectToRemix);
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
    channels.delete(channelId, function (err, data) {
      executeCallback(callback, data);
    });
  },
  /**
   * @returns {jQuery.Deferred} A deferred which will resolve when the project loads.
   */
  load() {
    var deferred = new $.Deferred();
    if (projects.isProjectLevel()) {
      if (redirectFromHashUrl() || redirectEditView()) {
        deferred.resolve();
        return deferred;
      }
      var pathInfo = parsePath();

      if (pathInfo.channelId) {
        if (pathInfo.action === 'edit') {
          isEditing = true;
        } else {
          $('#betainfo').hide();
        }

        // Load the project ID, if one exists
        channels.fetch(pathInfo.channelId, (err, data) => {
          if (err) {
            // Project not found, redirect to the new project experience.
            location.href = location.pathname.split('/')
              .slice(PathPart.START, PathPart.APP + 1).join('/');
          } else {
            fetchSource(data, () => {
              if (current.isOwner && pathInfo.action === 'view') {
                isEditing = true;
              }
              fetchAbuseScoreAndPrivacyViolations(function () {
                deferred.resolve();
              });
            }, queryParams('version'), this.useSourcesApi());
          }
        });
      } else {
        isEditing = true;
        deferred.resolve();
      }
    } else if (appOptions.isChannelBacked) {
      isEditing = true;
      channels.fetch(appOptions.channel, (err, data) => {
        if (err) {
          deferred.reject();
        } else {
          fetchSource(data, () => {
            projects.showHeaderForProjectBacked();
            fetchAbuseScoreAndPrivacyViolations(function () {
              deferred.resolve();
            });
          }, queryParams('version'), this.useSourcesApi());
        }
      });
    } else {
      deferred.resolve();
    }
    return deferred;
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

  /**
   * Uploads a thumbnail image to the thumbnail path in the files API. If
   * successful, stores a URL to access the thumbnail in current.thumbnailUrl.
   * @param {Blob} pngBlob A Blob in PNG format containing the thumbnail image.
   * @returns {Promise} A promise indicating whether the upload was successful.
   */
  saveThumbnail(pngBlob) {
    if (!current) {
      return Promise.reject('Project not initialized.');
    }
    if (!current.isOwner) {
      return Promise.reject('Project not owned by current user.');
    }

    return new Promise((resolve, reject) => {
      const thumbnailPath = '.metadata/thumbnail.png';
      filesApi.putFile(thumbnailPath, pngBlob, () => {
        current.thumbnailUrl = `/v3/files/${current.id}/${thumbnailPath}`;
        if (!initialCaptureComplete) {
          initialCaptureComplete = true;
          thumbnailChanged = true;
        }
        resolve();
      }, error => {
        reject(`error saving thumbnail image: ${error}`);
      });
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
};

/**
 * Given data from our channels api, updates current and gets sources from
 * sources api
 * @param {object} channelData Data we fetched from channels api
 * @param {function} callback
 * @param {string?} version Optional version to load
 * @param {boolean} useSourcesApi use sources api when true
 */
function fetchSource(channelData, callback, version, useSourcesApi) {
  // Explicitly remove levelSource/levelHtml from channels
  delete channelData.levelSource;
  delete channelData.levelHtml;
  // Also clear out html, which we never should have been setting.
  delete channelData.html;

  // Update current
  current = channelData;

  projects.setTitle(current.name);
  if (useSourcesApi && channelData.migratedToS3) {
    var url = current.id + '/' + SOURCE_FILE;
    if (version) {
      url += '?version=' + version;
    }
    sources.fetch(url, function (err, data) {
      if (err) {
        console.warn('unable to fetch project source file', err);
        data = {
          source: '',
          html: '',
          animations: ''
        };
      }
      unpackSources(data);
      callback();
    });
  } else {
    // It's possible that we created a channel, but failed to save anything to
    // S3. In this case, it's expected that html/levelSource are null.
    callback();
  }
}

function fetchAbuseScore(resolve) {
  channels.fetch(current.id + '/abuse', function (err, data) {
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
  channels.fetch(current.id + '/sharing_disabled', function (err, data) {
    sharingDisabled = (data && data.sharing_disabled) || sharingDisabled;
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
    currentHasPrivacyProfanityViolation = (data && !!data.has_violation) || currentHasPrivacyProfanityViolation;
    resolve();
    if (err) {
      // Throw an error so that things like New Relic see this. This shouldn't
      // affect anything else
      throw err;
    }
  });
}

function fetchAbuseScoreAndPrivacyViolations(callback) {
  const deferredCallsToMake = [new Promise(fetchAbuseScore)];

  if (dashboard.project.getStandaloneApp() === 'playlab') {
    deferredCallsToMake.push(new Promise(fetchPrivacyProfanityViolations));
  } else if ((dashboard.project.getStandaloneApp() === 'applab') ||
    (dashboard.project.getStandaloneApp() === 'gamelab') ||
    (dashboard.project.isWebLab())) {
    deferredCallsToMake.push(new Promise(fetchSharingDisabled));
  }
  Promise.all(deferredCallsToMake).then(function () {
    callback();
  });
}

/**
 * Allow setting Maker APIs enabled / disabled via URL parameters.
 */
function setMakerAPIsStatusFromQueryParams() {
  if (hasQueryParam('enableMaker')) {
    currentSources.makerAPIsEnabled = true;
    updateQueryParam('enableMaker', undefined, true);
  }

  if (hasQueryParam('disableMaker')) {
    currentSources.makerAPIsEnabled = false;
    updateQueryParam('disableMaker', undefined, true);
  }
}

/**
 * If a level itself has makerlabEnabled, set that for this project's source.
 * This is the case with New Maker Lab Project.level, and projects created
 * based off of that template (/p/makerlab), done prior to maker API support
 * within applab.
 */
function setMakerAPIsStatusFromLevel() {
  if (appOptions.level.makerlabEnabled) {
    currentSources.makerAPIsEnabled = appOptions.level.makerlabEnabled;
  }
}

/**
 * Only execute the given argument if it is a function.
 * @param callback
 */
function executeCallback(callback, data) {
  if (typeof callback === 'function') {
    callback(data);
  }
}

/**
 * is the current project (if any) editable by the logged in user (if any)?
 */
function isEditable() {
  return current && current.isOwner && !current.frozen && !queryParams('version');
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
    newUrl = location.href.replace(/(\/projects\/[^/]+\/[^/]+)\/view/, '$1/edit');
    appOptions.readonlyWorkspace = false;
    isEditing = true;
  } else if (parseInfo.action === 'edit' && !isEditable()) {
    // Redirect to /view with a readonly workspace
    newUrl = location.href.replace(/(\/projects\/[^/]+\/[^/]+)\/edit/, '$1/view');
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
  var pathname = location.pathname;

  // We have a hash based route. Replace the hash with a slash, and append to
  // our existing path
  if (location.hash) {
    pathname += location.hash.replace('#', '/');
  }

  var tokens = pathname.split('/');

  if (tokens[PathPart.PROJECTS] !== 'p' &&
    tokens[PathPart.PROJECTS] !== 'projects') {
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
  if (location.search.indexOf('nosource') >= 0) {
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
