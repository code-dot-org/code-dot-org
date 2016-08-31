/* global dashboard, appOptions, trackEvent */
import $ from 'jquery';

// Attempt to save projects every 30 seconds
var AUTOSAVE_INTERVAL = 30 * 1000;

var ABUSE_THRESHOLD = 10;

var NON_REMIXABLE_SKINS = ['hoc2015', 'infinity', 'gumball', 'iceage'];

var hasProjectChanged = false;

var assets = require('./clientApi').create('/v3/assets');
var sources = require('./clientApi').create('/v3/sources');
var channels = require('./clientApi').create('/v3/channels');

import experiments from '../../experiments';
var showProjectAdmin = require('../showProjectAdmin');
var header = require('../header');
var queryParams = require('../utils').queryParams;

// Name of the packed source file
var SOURCE_FILE = 'main.json';

var events = {
  // Fired when run state changes or we enter/exit design mode
  appModeChanged: 'appModeChanged',
  appInitialized: 'appInitialized',
  workspaceChange: 'workspaceChange'
};

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
var currentAbuseScore = 0;
var currentHasPrivacyProfanityViolation = false;
var isEditing = false;

/**
 * Current state of our sources API data
 */
var currentSources = {
  source: null,
  html: null,
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
 */
function unpackSources(data) {
  currentSources = {
    source: data.source,
    html: data.html,
    animations: data.animations
  };
}

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

  /**
   * Whether this project uses Firebase for data storage.
   */
  useFirebase() {
    if (!current) {
      return;
    }
    return current.useFirebase;
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
    return current && current.isOwner;
  },

  /**
   * @returns {boolean} true if project has been reported enough times to
   *   exceed our threshold
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

    // NOTE: appOptions.isAdmin is not a security setting as it can be manipulated
    // by the user. In this case that's okay, since all that does is allow them to
    // view a project that was marked as abusive.
    const hasEditPermissions = this.isOwner() || appOptions.isAdmin;
    const isEditOrViewPage = pageAction === 'edit' || pageAction === 'view';

    return hasEditPermissions && isEditOrViewPage;
  },

  useFirebaseForNewProject() {
    return experiments.isEnabled('useFirebaseForNewProject') &&
      current.level === '/projects/applab';
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

  showHeaderForProjectBacked() {
    if (this.shouldUpdateHeaders()) {
      header.showHeaderForProjectBacked();
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
          this.save(callback);
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
        window.setInterval(this.autosave_.bind(this), AUTOSAVE_INTERVAL);

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
  /**
   * @returns {string} The name of the standalone app capable of running
   * this project as a standalone project, or null if none exists.
   */
  getStandaloneApp() {
    switch (appOptions.app) {
      case 'applab':
        return appOptions.level.makerlabEnabled ? 'makerlab' : 'applab';
      case 'gamelab':
        return 'gamelab';
      case 'turtle':
        return 'artist';
      case 'calc':
        return 'calc';
      case 'eval':
        return 'eval';
      case 'studio':
        if (appOptions.level.useContractEditor) {
          return 'algebra_game';
        } else if (NON_REMIXABLE_SKINS.indexOf(appOptions.skinId) !== -1) {
          return null;
        }
        return 'playlab';
      case 'weblab':
        return 'weblab';
      default:
        return null;
    }
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
   * Saves the project to the Channels API. Calls `callback` on success if a
   * callback function was provided.
   * @param {object?} sourceAndHtml Optional source to be provided, saving us another
   *   call to `sourceHandler.getLevelSource`.
   * @param {function} callback Function to be called after saving.
   * @param {boolean} forceNewVersion If true, explicitly create a new version.
   */
  save(sourceAndHtml, callback, forceNewVersion) {
    // Can't save a project if we're not the owner.
    if (current && current.isOwner === false) {
      return;
    }

    $('.project_updated_at').text('Saving...');  // TODO (Josh) i18n

    if (typeof arguments[0] === 'function' || !sourceAndHtml) {
      // If no source is provided, shift the arguments and ask for the source
      // ourselves.
      var args = Array.prototype.slice.apply(arguments);
      callback = args[0];
      forceNewVersion = args[1];
      this.sourceHandler.getAnimationList(animations => {
        this.sourceHandler.getLevelSource().then(response => {
          const source = response;
          const html = this.sourceHandler.getLevelHtml();
          this.save({source, html, animations}, callback, forceNewVersion);
        });
      });
      return;
    }

    if (forceNewVersion) {
      currentSourceVersionId = null;
    }

    var channelId = current.id;
    // TODO(dave): Remove this check and remove clearHtml() once all projects
    // have versioning: https://www.pivotaltracker.com/story/show/103347498
    if (currentSources.html && !sourceAndHtml.html) {
      throw new Error('Attempting to blow away existing levelHtml');
    }

    unpackSources(sourceAndHtml);
    if (this.getStandaloneApp()) {
      current.level = this.appToProjectUrl();
    }

    var filename = SOURCE_FILE + (currentSourceVersionId ? "?version=" + currentSourceVersionId : '');
    sources.put(channelId, packSources(), filename, function (err, response) {
      currentSourceVersionId = response.versionId;
      current.migratedToS3 = true;

      channels.update(channelId, current, function (err, data) {
        this.updateCurrentData_(err, data, false);
        executeCallback(callback, data);
      }.bind(this));
    }.bind(this));
  },
  updateCurrentData_(err, data, isNewChannel) {
    if (err) {
      $('.project_updated_at').text('Error saving project');  // TODO i18n
      return;
    }

    current = data;
    if (isNewChannel) {
      // We have a new channel, meaning either we had no channel before, or
      // we've changed channels. If we aren't at a /projects/<appname> link,
      // always do a redirect (i.e. we're remix from inside a script)
      if (isEditing && parsePath().appName) {
        if (window.history.pushState) {
          window.history.pushState(null, document.title, this.getPathName('edit'));
        }
      } else {
        // We're on a share page, and got a new channel id. Always do a redirect
        location.href = this.getPathName('edit');
      }
    }
    header.updateTimestamp();
  },
  /**
   * Autosave the code if things have changed
   */
  autosave_() {
    // Bail if baseline code doesn't exist (app not yet initialized)
    if (currentSources.source === null) {
      return;
    }
    // `getLevelSource()` is expensive for Blockly so only call
    // after `workspaceChange` has fired
    if (!appOptions.droplet && !hasProjectChanged) {
      return;
    }

    if ($('#designModeViz .ui-draggable-dragging').length !== 0) {
      return;
    }

    this.sourceHandler.getAnimationList(animations => {
      this.sourceHandler.getLevelSource().then(response => {
        const source = response;
        const html = this.sourceHandler.getLevelHtml();
        const newSources = {source, html, animations};
        if (JSON.stringify(currentSources) === JSON.stringify(newSources)) {
          hasProjectChanged = false;
          return;
        }

        this.save(newSources, () => {
          hasProjectChanged = false;
        });
      });
    });
  },
  /**
   * Renames and saves the project.
   */
  rename(newName, callback) {
    this.setName(newName);
    this.save(callback);
  },
  /**
   * Freezes and saves the project. Also hides so that it's not available for deleting/renaming in the user's project list.
   */
  freeze(callback) {
    current.frozen = true;
    current.hidden = true;
    this.save(function (data) {
      executeCallback(callback, data);
      redirectEditView();
    });
  },
  /**
   * Creates a copy of the project, gives it the provided name, and sets the
   * copy as the current project.
   */
  copy(newName, callback) {
    var srcChannel = current.id;
    var wrappedCallback = this.copyAssets.bind(this, srcChannel,
        this.copyAnimations.bind(this, srcChannel, callback));
    delete current.id;
    delete current.hidden;
    this.setName(newName);
    channels.create(current, function (err, data) {
      this.updateCurrentData_(err, data, true);
      this.save(wrappedCallback);
    }.bind(this));
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
    var destChannel = current.id;
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
      const suffix = projects.useFirebaseForNewProject() ? '?useFirebase=1' : '';
      const url = `${projects.getPathName('remix')}${suffix}`;
      location.href = url;
    }
    // If the user is the owner, save before remixing on the server.
    if (current.isOwner) {
      projects.save(redirectToRemix);
    } else {
      redirectToRemix();
    }
  },
  createNew() {
    const suffix = projects.useFirebaseForNewProject() ? '?useFirebase=1' : '';
    const url = `${projects.appToProjectUrl()}/new${suffix}`;
    projects.save(function () {
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
        channels.fetch(pathInfo.channelId, function (err, data) {
          if (err) {
            // Project not found, redirect to the new project experience.
            location.href = location.pathname.split('/')
              .slice(PathPart.START, PathPart.APP + 1).join('/');
          } else {
            fetchSource(data, function () {
              if (current.isOwner && pathInfo.action === 'view') {
                isEditing = true;
              }
              fetchAbuseScoreAndPrivacyViolations(function () {
                deferred.resolve();
              });
            }, queryParams('version'));
          }
        });
      } else {
        isEditing = true;
        deferred.resolve();
      }
    } else if (appOptions.isChannelBacked) {
      isEditing = true;
      channels.fetch(appOptions.channel, function (err, data) {
        if (err) {
          deferred.reject();
        } else {
          fetchSource(data, function () {
            projects.showHeaderForProjectBacked();
            fetchAbuseScoreAndPrivacyViolations(function () {
              deferred.resolve();
            });
          }, queryParams('version'));
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
   * @returns {string} Url to the specified action.
   * @throws {Error} If this type of project does not have a standalone app.
   */
  getPathName(action) {
    var pathName = this.appToProjectUrl() + '/' + this.getCurrentId();
    if (action) {
      pathName += '/' + action;
    }
    return pathName;
  }
};

/**
 * Given data from our channels api, updates current and gets sources from
 * sources api
 * @param {object} channelData Data we fetched from channels api
 * @param {function} callback
 * @param {string?} version Optional version to load
 */
function fetchSource(channelData, callback, version) {
  // Explicitly remove levelSource/levelHtml from channels
  delete channelData.levelSource;
  delete channelData.levelHtml;
  // Also clear out html, which we never should have been setting.
  delete channelData.html;

  // Update current
  current = channelData;

  projects.setTitle(current.name);
  if (channelData.migratedToS3) {
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
  }
  Promise.all(deferredCallsToMake).then(function () {
    callback();
  });
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

  return {
    appName: tokens[PathPart.APP],
    channelId: tokens[PathPart.CHANNEL_ID],
    action: tokens[PathPart.ACTION]
  };
}
