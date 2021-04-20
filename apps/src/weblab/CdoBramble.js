// This is needed to support jQuery binary downloads
import '../assetManagement/download';
import {makeEnum} from '../utils';
import logToCloud from '../logToCloud';
import {createHtmlDocument, removeDisallowedHtmlContent} from './brambleUtils';

const PageAction = makeEnum(
  logToCloud.PageAction.BrambleError,
  logToCloud.PageAction.BrambleFilesystemResetSuccess,
  logToCloud.PageAction.BrambleFilesystemResetFailed
);

const SUPPORT_ARTICLE_URL =
  'https://support.code.org/hc/en-us/articles/360016804871';
const SUPPORT_ARTICLE_HTML = `Please see our support article <a href="${SUPPORT_ARTICLE_URL}">"Troubleshooting Web Lab problems"</a> for more information.`;
const EFILESYSTEMERROR_MESSAGE = `We're sorry, Web Lab failed to load for some reason. ${SUPPORT_ARTICLE_HTML}`;
const defaultBrambleErrorMessage = message =>
  `Fatal Error: ${message}. If you're in Private Browsing mode, data can't be written. ${SUPPORT_ARTICLE_HTML}`;
const RESET_SUCCESS_MESSAGE = `Web Lab reset complete.  Reloading...`;
const resetFailedMessage = message =>
  `Failed to reset Web Lab. ${message}. ${SUPPORT_ARTICLE_HTML}`;

export default class CdoBramble {
  constructor(Bramble, api, store, url, projectPath, disallowedHtmlTags) {
    this.Bramble = Bramble;
    this.api = api;
    this.store = store;
    this.url = url;
    this.projectPath = projectPath;
    this.disallowedHtmlTags = disallowedHtmlTags;
    this.brambleProxy = null;
    this.onMountableCallbacks = [];
    this.onReadyCallbacks = [];
    this.onProjectChangedCallbacks = [];
    this.recentChanges = [];
    this.lastSyncedVersionId = null;
  }

  getInterface() {
    return {
      addFileCSS: this.addFileCSS.bind(this),
      addFileHTML: this.addFileHTML.bind(this),
      disableFullscreenPreview: this.disableFullscreenPreview.bind(this),
      disableInspector: this.disableInspector.bind(this),
      enableFullscreenPreview: this.enableFullscreenPreview.bind(this),
      enableInspector: this.enableInspector.bind(this),
      fileRefresh: this.fileRefresh.bind(this),
      redo: this.redo.bind(this),
      refreshPreview: this.refreshPreview.bind(this),
      syncFiles: this.syncFiles.bind(this),
      undo: this.undo.bind(this),
      validateProjectChanged: this.validateProjectChanged.bind(this)
    };
  }

  init() {
    this.Bramble.load('#bramble', this.config());

    this.Bramble.on('readyStateChange', (_, newState) => {
      if (this.Bramble.MOUNTABLE === newState) {
        this.initProject(() => {
          this.mount();
          this.invokeAll(this.onMountableCallbacks);
        });
      }
    });

    this.Bramble.on('error', this.onError.bind(this));

    this.Bramble.once('ready', brambleProxy => {
      this.brambleProxy = brambleProxy;
      this.configureProxy();
      this.invokeAll(this.onReadyCallbacks);
    });
  }

  initProject(callback) {
    this.createProjectRootDir(err => {
      if (err) {
        return;
      }

      const currentFiles = this.api.getCurrentFileEntries();
      const currentVersionId = this.api.getCurrentFilesVersionId();
      if (currentFiles?.length <= 0 || !currentVersionId) {
        this.setupNewProject(this.api.getStartSources()?.files, callback);
      } else {
        this.syncFiles(currentFiles, currentVersionId, callback);
      }
    });
  }

  setupNewProject(sourceFiles, callback) {
    this.recursivelyWriteSourceFiles(sourceFiles, 0, () => {
      // Wait until user-initiated change before saving any files to the server.
      this.api.registerBeforeFirstWriteHook(
        this.uploadAllFilesToServer.bind(this)
      );
      // Sync files in case there are new files + version.
      this.syncFiles(
        this.api.getCurrentFileEntries(),
        this.api.getCurrentFilesVersionId(),
        callback
      );
    });
  }

  mount() {
    this.Bramble.mount(this.projectPath);
  }

  on(event, callback) {
    switch (event) {
      case 'mountable':
        this.onMountableCallbacks.push(callback);
        break;
      case 'ready':
        this.onReadyCallbacks.push(callback);
        break;
      case 'projectChange':
        this.onProjectChangedCallbacks.push(callback);
        break;
      default:
        console.error(`CdoBramble unknown event type '${event}'`);
    }

    return this;
  }

  config() {
    const {
      maxProjectCapacity,
      pageConstants
    } = this.store.getStore().getState();

    return {
      url: this.url,
      useLocationSearch: true,
      disableUIState: true,
      capacity: maxProjectCapacity,
      initialUIState: {
        theme: 'light-theme',
        readOnly: pageConstants.isReadOnlyWorkspace
      },
      extensions: {
        disable: ['bramble-move-file']
      }
    };
  }

  configureProxy() {
    const proxy = this.brambleProxy;

    proxy.disableJavaScript(); // Prevents JS from executing.
    proxy.on('inspectorChange', this.onInspectorChanged.bind(this));
    proxy.on('fileChange', this.onFileChanged.bind(this));
    proxy.on('fileDelete', this.onFileDeleted.bind(this));
    proxy.on('fileRename', this.onFileRenamed.bind(this));
    proxy.on('projectSizeChange', this.onProjectSizeChanged.bind(this));
  }

  syncFiles(files, projectVersion, callback) {
    const hasSyncedVersion = this.lastSyncedVersionId === projectVersion;

    // Send any new changes to the server.
    if (hasSyncedVersion) {
      const recentChanges = [...this.recentChanges];
      this.resetVersionAndChanges(projectVersion);
      this.recursivelySaveChangesToServer(recentChanges, 0, callback);
    }

    // Treat the server as the source of truth.
    if (!hasSyncedVersion) {
      if (this.recentChanges.length > 0) {
        console.warn(
          'CdoBramble recent changes will be overwritten by server changes!'
        );
      }

      this.resetVersionAndChanges(projectVersion);
      // We are now treating the server as the source of truth, so cancel
      // any beforeFirstWrite hook that may have been registered.
      this.api.registerBeforeFirstWriteHook(null);
      this.overwriteProject(files, callback);
    }
  }

  onInspectorChanged({enabled}) {
    const {getStore, actions} = this.store;
    getStore().dispatch(actions.changeInspectorOn(enabled));
  }

  handleFileChange(path) {
    var cleanedPath = this.cleanPath(path);
    const hasExistingChangeForPath = this.recentChanges.some(
      change => change.operation === 'change' && change.file === cleanedPath
    );

    // Only add 'change' operation if one isn't already queued for that file.
    if (!hasExistingChangeForPath) {
      this.recentChanges.push({
        operation: 'change',
        file: cleanedPath,
        fileDataPath: path
      });
    }

    this.invokeAll(this.onProjectChangedCallbacks);
  }

  onFileChanged(path) {
    removeDisallowedHtmlContent(
      this.Bramble.getFileSystem(),
      this.brambleProxy,
      path,
      this.disallowedHtmlTags,
      this.handleFileChange.bind(this)
    );
  }

  onFileDeleted(path) {
    this.recentChanges.push({
      operation: 'delete',
      file: this.cleanPath(path)
    });

    this.invokeAll(this.onProjectChangedCallbacks);
  }

  onFileRenamed(oldPath, newPath) {
    const cleanedOldPath = this.cleanPath(oldPath);
    const cleanedNewPath = this.cleanPath(newPath);

    // Update the fileDataPath for any pending 'change' operations (new or modified files).
    this.recentChanges = this.recentChanges.map(change => {
      if (change.operation === 'change' && change.fileDataPath === oldPath) {
        change = {...change, fileDataPath: newPath};
      }

      return change;
    });
    this.recentChanges.push({
      operation: 'rename',
      file: cleanedOldPath,
      newFile: cleanedNewPath
    });

    this.invokeAll(this.onProjectChangedCallbacks);
  }

  onProjectSizeChanged(bytes, _) {
    const {getStore, actions} = this.store;
    getStore().dispatch(actions.changeProjectSize(bytes));
  }

  uploadAllFilesToServer(callback) {
    this.getAllFileData((err, files) => {
      if (err) {
        callback(err);
        return;
      }

      const uploadEntry = index => {
        const next = (err, newVersionId) => {
          if (err) {
            callback(err);
            return;
          }

          this.lastSyncedVersionId = newVersionId;
          if (index >= files.length - 1) {
            callback(null, true /* preWriteHook was successful */);
          } else {
            uploadEntry(index + 1);
          }
        };

        const {name, data} = files[index];
        this.api.changeProjectFile(
          name,
          data,
          next,
          true /* skipPreWriteHook because we are calling from the preWriteHook */
        );
      };

      uploadEntry(0);
    });
  }

  recursivelySaveChangesToServer(changes, currentIndex, finalCallback) {
    if (changes?.length <= 0 || !changes[currentIndex]) {
      finalCallback();
      return;
    }

    const next = (err, newVersionId) => {
      if (err) {
        console.error(`CdoBramble could not save change. ${err}`);
      } else if (newVersionId) {
        this.lastSyncedVersionId = newVersionId;
      }

      if (currentIndex >= changes.length - 1) {
        finalCallback();
      } else {
        this.recursivelySaveChangesToServer(
          changes,
          currentIndex + 1,
          finalCallback
        );
      }
    };

    const {operation, file, newFile, fileDataPath} = changes[currentIndex];
    switch (operation) {
      case 'delete':
        this.api.deleteProjectFile(file, next);
        break;
      case 'rename':
        this.api.renameProjectFile(file, newFile, next);
        break;
      case 'change':
        this.getFileData(fileDataPath, (err, fileData) => {
          if (err) {
            next();
          } else {
            this.api.changeProjectFile(file, fileData, next);
          }
        });
        break;
      default:
        console.error(`CdoBramble unknown operation type '${operation}'`);
        next();
    }
  }

  overwriteProject(files, callback) {
    this.deleteProject(() => {
      this.createProjectRootDir(err => {
        if (err) {
          callback(err);
          return;
        }

        this.recursivelyWriteFiles(files, 0, callback);
      });
    });
  }

  createProjectRootDir(callback) {
    this.shell().mkdirp(this.projectPath, err => {
      // If directory already exists, treat that as a success case.
      if (err?.code === 'EEXIST') {
        err = null;
      } else if (err) {
        console.error(`CdoBramble could not create project directory. ${err}`);
      }

      callback(err);
    });
  }

  getFileData(path, callback) {
    this.fileSystem().readFile(path, {encoding: null}, (err, fileData) => {
      err &&
        console.error(`CdoBramble unable to read ${path} from Bramble. ${err}`);

      callback(err, fileData);
    });
  }

  getAllFileData(callback) {
    this.shell().ls(this.projectPath, (err, entries) => {
      if (err) {
        console.error(
          `CdoBramble failed to receive file entries from Bramble. ${err}`
        );
        callback(err);
      }

      const filenames = entries?.map(entry => entry.path); // 'path' is relative, so it will be the filename.
      this.recursivelyReadFiles(filenames, 0, [], callback);
    });
  }

  writeFileData(path, data, callback) {
    this.fileSystem().writeFile(
      path,
      Buffer.from(data),
      {encoding: null},
      err => {
        err &&
          console.error(
            `CdoBramble unable to write ${path} to Bramble. ${err}`
          );

        callback(err);
      }
    );
  }

  downloadFile(url, callback) {
    $.ajax(url, {
      dataType: 'binary',
      responseType: 'arraybuffer'
    })
      .done(data => {
        callback(data, null);
      })
      .fail((_xhr, _textStatus, err) => {
        console.error(`CdoBramble unable to download file at ${url}. ${err}`);
        callback(null, err);
      });
  }

  deleteProject(callback) {
    this.shell().rm(this.projectPath, {recursive: true}, callback);
  }

  recursivelyReadFiles(
    filenames,
    currentIndex,
    currentFileData,
    finalCallback
  ) {
    if (filenames?.length <= 0 || !filenames[currentIndex]) {
      finalCallback(null, currentFileData);
      return;
    }

    const filename = filenames[currentIndex];
    const next = err => {
      err &&
        console.error(
          `CdoBramble could not read file ${filename} - skipping. ${err}`
        );

      if (currentIndex >= filenames.length - 1) {
        finalCallback(null, currentFileData);
      } else {
        this.recursivelyReadFiles(
          filenames,
          currentIndex + 1,
          currentFileData,
          finalCallback
        );
      }
    };

    this.getFileData(this.prependProjectPath(filename), (err, fileData) => {
      !err && currentFileData.push({name: filename, data: fileData});
      next(err);
    });
  }

  recursivelyWriteFiles(files, currentIndex, finalCallback) {
    if (files?.length <= 0 || !files[currentIndex]) {
      finalCallback();
      return;
    }

    const next = err => {
      if (currentIndex >= files.length - 1) {
        finalCallback();
      } else {
        this.recursivelyWriteFiles(files, currentIndex + 1, finalCallback);
      }
    };

    const {name, url, versionId} = files[currentIndex];
    const fullUrl = versionId ? url + `?version=${versionId}` : url;

    this.downloadFile(fullUrl, (fileData, err) => {
      if (err) {
        next();
        return;
      }

      this.writeFileData(this.prependProjectPath(name), fileData, next);
    });
  }

  recursivelyWriteSourceFiles(sourceFiles, currentIndex, finalCallback) {
    if (sourceFiles?.length <= 0 || !sourceFiles[currentIndex]) {
      finalCallback();
      return;
    }

    const {name, url, data} = sourceFiles[currentIndex];
    const path = this.prependProjectPath(name);
    const next = err => {
      if (currentIndex >= sourceFiles.length - 1) {
        finalCallback();
      } else {
        this.recursivelyWriteSourceFiles(
          sourceFiles,
          currentIndex + 1,
          finalCallback
        );
      }
    };

    const invalidSourceError = this.validateSourceFile(name, url, data);
    if (invalidSourceError) {
      console.error(
        `CdoBramble skipping invalid source file. ${invalidSourceError}`
      );
      next();
      return;
    }

    if (url) {
      data &&
        console.warn(
          `CdoBramble source file ${name} has both url and data. Defaulting to url.`
        );

      this.downloadFile(url, (fileData, err) => {
        if (err) {
          next();
          return;
        }

        this.writeFileData(path, fileData, next);
      });
    } else if (data) {
      this.writeFileData(path, data, next);
    }
  }

  validateSourceFile(name, url, data) {
    if (!name) {
      return new Error('Name property is required.');
    }

    if (!url && !data) {
      return new Error(`${name} has neither url nor data.`);
    }
  }

  validateProjectChanged(callback) {
    const startSourceFiles = this.api.getStartSources()?.files;
    this.getAllFileData((err, userFiles) => {
      // Don't block user if Bramble errors.
      if (err || userFiles?.length !== startSourceFiles.length) {
        callback(true /* projectChanged */);
        return;
      }

      // Map array of files to an object with structure {filename: fileData}
      const reduceToObj = filesArray =>
        filesArray.reduce((acc, val) => {
          acc[val.name] = val.data?.toString();
          return acc;
        }, {});
      const startObj = reduceToObj(startSourceFiles);
      const userObj = reduceToObj(userFiles);

      // If startFile doesn't have `data` (and instead has something different like `url`),
      // it is an image and is stored differently in startSources than in Bramble.
      // In that case, check for a matching file name, but don't compare data.
      // Regex: Compare without whitespace.
      const projectChanged = Object.keys(startObj).reduce(
        (hasChanged, currentFilename) => {
          if (!userObj.hasOwnProperty(currentFilename)) {
            hasChanged = true;
          } else {
            const dataChanged =
              startObj[currentFilename]?.replace(/\s+/g, '') !==
              userObj[currentFilename]?.replace(/\s+/g, '');
            if (startObj[currentFilename] && dataChanged) {
              hasChanged = true;
            }
          }

          return hasChanged;
        },
        false
      );
      callback(projectChanged);
    });
  }

  fileSystem() {
    return this.Bramble.getFileSystem();
  }

  shell() {
    const fs = this.fileSystem();
    return new fs.Shell();
  }

  resetVersionAndChanges(newVersionId) {
    this.lastSyncedVersionId = newVersionId;
    this.recentChanges = [];
  }

  cleanPath(path) {
    return path.replace(this.projectPath, '');
  }

  prependProjectPath(filename) {
    return this.projectPath + filename;
  }

  invokeAll(callbacks) {
    callbacks.forEach(callback => callback());
  }

  resetFilesystem(callback) {
    this.Bramble.formatFileSystem(err => {
      if (err) {
        // Unable to create filesystem, fatal (and highly unlikely) error.
        this.logAction(PageAction.BrambleFilesystemResetFailed, {
          error: err.message
        });
      } else {
        this.logAction(PageAction.BrambleFilesystemResetSuccess);
      }

      callback(err);
    });
  }

  onError(error) {
    if (!error) {
      return;
    }

    console.error(`Bramble error. ${error}`);
    const {message, code} = error;
    this.logAction(PageAction.BrambleError, {error: message});

    const modalMessage =
      code === 'EFILESYSTEMERROR'
        ? EFILESYSTEMERROR_MESSAGE
        : defaultBrambleErrorMessage(message);
    this.renderErrorModal(modalMessage);
  }

  // TODO: Refactor this modal to use React/Redux. https://codedotorg.atlassian.net/browse/STAR-1508
  renderErrorModal(message, showButtons = true) {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.right = 0;
    overlay.style.bottom = 0;
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';

    const messageBox = document.createElement('div');
    messageBox.style.backgroundColor = 'white';
    messageBox.style.border = 'solid black medium';
    messageBox.style.padding = '1em';
    messageBox.style.maxWidth = '50%';
    messageBox.style.borderRadius = '1em';
    overlay.appendChild(messageBox);

    const messageDiv = document.createElement('div');
    messageDiv.innerHTML = message;
    messageBox.appendChild(messageDiv);

    if (showButtons) {
      const reloadPage = () => parent.location.reload();
      const hideModal = () => document.body.removeChild(overlay);
      const resetProject = () => {
        hideModal();
        this.resetFilesystem(err => {
          if (err) {
            this.renderErrorModal(resetFailedMessage(err.message));
          } else {
            this.renderErrorModal(RESET_SUCCESS_MESSAGE, false);
            reloadPage();
          }
        });
      };
      const createButton = (text, onClick) => {
        const button = document.createElement('button');
        button.innerHTML = text;
        button.onclick = onClick;
        button.style.margin = '0.5em';
        return button;
      };

      const buttons = document.createElement('div');
      buttons.style.textAlign = 'center';
      buttons.style.marginTop = '1em';
      buttons.appendChild(createButton('Try again', reloadPage));
      buttons.appendChild(createButton('Reset Web Lab', resetProject));
      buttons.appendChild(createButton('Dismiss', hideModal));
      messageBox.appendChild(buttons);
    }

    document.body.appendChild(overlay);
  }

  logAction(actionName, value = {}) {
    logToCloud.addPageAction(actionName, value);
  }

  addFileHTML() {
    this.brambleProxy?.addNewFile(
      {
        basenamePrefix: 'new',
        ext: 'html',
        contents: createHtmlDocument()
      },
      err => {
        if (err) {
          throw err;
        }
      }
    );
  }

  addFileCSS() {
    this.brambleProxy?.addNewFile(
      {
        basenamePrefix: 'new',
        ext: 'css',
        contents:
          'body {\n  background: white;\n}\np {\n  color: black;\n}\nh1 {\n  font-weight: bold;\n}'
      },
      err => {
        if (err) {
          throw err;
        }
      }
    );
  }

  undo() {
    this.brambleProxy?.undo();
  }

  redo() {
    this.brambleProxy?.redo();
  }

  hideTutorial() {
    this.brambleProxy?.hideTutorial();
  }

  showTutorial() {
    this.brambleProxy?.showTutorial();
  }

  enableInspector() {
    this.brambleProxy?.enableInspector();
  }

  disableInspector() {
    this.brambleProxy?.disableInspector();
  }

  refreshPreview() {
    this.brambleProxy?.refreshPreview();
  }

  fileRefresh(callback = () => {}) {
    this.brambleProxy?.fileRefresh(callback);
  }

  enableFullscreenPreview(callback) {
    this.brambleProxy?.enableFullscreenPreview(callback);
  }

  disableFullscreenPreview(callback) {
    this.brambleProxy?.disableFullscreenPreview(callback);
  }
}
