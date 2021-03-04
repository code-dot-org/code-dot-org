import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore, registerReducers} from '../redux';
import JavalabView from './JavalabView';
import javalab, {setFileEntries} from './javalabRedux';
import {TestResults} from '@cdo/apps/constants';
import project from '@cdo/apps/code-studio/initApp/project';
import {queryParams} from '@cdo/apps/code-studio/utils';
var filesApi = require('@cdo/apps/clientApi').files;
var assetListStore = require('../code-studio/assets/assetListStore');

/**
 * On small mobile devices, when in portrait orientation, we show an overlay
 * image telling the user to rotate their device to landscape mode.
 */
const MOBILE_PORTRAIT_WIDTH = 600;

/**
 * An instantiable Javalab class
 */

const Javalab = function() {
  this.skin = null;
  this.level = null;

  /** @type {StudioApp} */
  this.studioApp_ = null;
};

/**
 * Inject the studioApp singleton.
 */
Javalab.prototype.injectStudioApp = function(studioApp) {
  this.studioApp_ = studioApp;
};

/**
 * Initialize this Javalab instance.  Called on page load.
 */
Javalab.prototype.init = function(config) {
  if (!this.studioApp_) {
    throw new Error('Javalab requires a StudioApp');
  }

  this.skin = config.skin;
  this.level = config.level;
  this.suppliedFilesVersionId = queryParams('version');
  this.initialFilesVersionId = this.suppliedFilesVersionId;

  config.makeYourOwn = false;
  config.wireframeShare = true;
  config.noHowItWorks = true;

  // We don't want icons in instructions
  config.skin.staticAvatar = null;
  config.skin.smallStaticAvatar = null;
  config.skin.failureAvatar = null;
  config.skin.winAvatar = null;

  // Provide a way for us to have top pane instructions disabled by default, but
  // able to turn them on.
  config.noInstructionsWhenCollapsed = true;

  config.pinWorkspaceToBottom = true;

  config.useFilesApi = true;

  config.getCode = this.getCode.bind(this);

  this.loadFileEntries();

  const onMount = () => {
    // NOTE: Most other apps call studioApp.init().  Like WebLab, Ailab, and Fish, we don't.
    this.studioApp_.setConfigValues_(config);

    // NOTE: if we called studioApp_.init(), the code here would be executed
    // automatically since pinWorkspaceToBottom is true...
    const container = document.getElementById(config.containerId);
    const bodyElement = document.body;
    bodyElement.style.overflow = 'hidden';
    bodyElement.className = bodyElement.className + ' pin_bottom';
    container.className = container.className + ' pin_bottom';

    // Fixes viewport for small screens.  Also usually done by studioApp_.init().
    var viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      this.studioApp_.fixViewportForSpecificWidthForSmallScreens_(
        viewport,
        MOBILE_PORTRAIT_WIDTH
      );
    }
  };

  // Push initial level properties into the Redux store
  this.studioApp_.setPageConstants(config, {
    channelId: config.channel,
    noVisualization: true,
    visualizationInWorkspace: true,
    isProjectLevel: !!config.level.isProjectLevel
  });

  registerReducers({javalab});

  ReactDOM.render(
    <Provider store={getStore()}>
      <JavalabView onMount={onMount} />
    </Provider>,
    document.getElementById(config.containerId)
  );
};

// Called by the Javalab app when it wants to go to the next level.
Javalab.prototype.onContinue = function() {
  const onReportComplete = result => {
    this.studioApp_.onContinue();
  };

  this.studioApp_.report({
    app: 'javalab',
    level: this.level.id,
    result: true,
    testResult: TestResults.ALL_PASS,
    program: '',
    onComplete: result => {
      onReportComplete(result);
    }
  });
};

Javalab.prototype.getCode = function() {
  return getStore().getState().javalab.editorText;
};

Javalab.prototype.getCurrentFilesVersionId = function() {
  return project.filesVersionId || this.initialFilesVersionId;
};

// Called by Javalab when a file has been renamed
Javalab.prototype.renameProjectFile = function(
  filename,
  newFilename,
  callback
) {
  filesApi.renameFile(
    filename,
    newFilename,
    xhr => {
      callback(null, project.filesVersionId);
    },
    xhr => {
      console.warn(`Javalab: error file ${filename} not renamed`);
      callback(new Error(xhr.status));
    }
  );
};

// Called by Javalab when a file has been changed or created
Javalab.prototype.changeProjectFile = function(
  filename,
  fileData
  //callback,
  // skipPreWriteHook
) {
  filesApi.putFile(
    filename,
    fileData
    // xhr => {
    //   callback(null, project.filesVersionId);
    // },
    // xhr => {
    //   console.warn(`Javalab: error file ${filename} not changed`);
    //   callback(new Error(xhr.status));
    // },
    // skipPreWriteHook
  );
};

Javalab.prototype.saveFiles = function() {
  const files = getStore().getState().javalab.filesData;
  for (const filename in files) {
    this.changeProjectFile(filename, files[filename]);
  }
};

/**
 * Load the file entry list and store it as this.fileEntries
 */
Javalab.prototype.loadFileEntries = function() {
  const onFilesReady = (files, filesVersionId) => {
    assetListStore.reset(files);
    const fileEntries = assetListStore.list().map(fileEntry => ({
      name: fileEntry.filename,
      url: filesApi.basePath(fileEntry.filename),
      versionId: fileEntry.versionId
    }));
    getStore().dispatch(setFileEntries(fileEntries));
    this.initialFilesVersionId = this.initialFilesVersionId || filesVersionId;

    if (filesVersionId !== this.initialFilesVersionId) {
      // After we've detected the first change to the version, we store this
      // version id so that subsequent writes will continue to replace the
      // current version (until the browser page reloads)
      project.filesVersionId = filesVersionId;
    }
  };

  filesApi.getFiles(
    result => onFilesReady(result.files, result.filesVersionId),
    xhr => {
      if (xhr.status === 404) {
        // No files in this project yet, proceed with an empty file
        // list and no start version id
        onFilesReady([], null);
      } else {
        console.error('files API failed, status: ' + xhr.status);
        getStore().dispatch(setFileEntries(null));
      }
    },
    this.getCurrentFilesVersionId()
  );
};

export default Javalab;
