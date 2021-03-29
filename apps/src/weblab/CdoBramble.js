// This is needed to support jQuery binary downloads
import '../assetManagement/download';
import {removeDisallowedHtmlContent} from './brambleUtils';

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
    this.shell().ls(this.projectPath, (err, entries) => {
      if (err) {
        console.error(
          `CdoBramble failed to receive file entries from Bramble. ${err}`
        );
        callback(err);
      }

      const uploadEntry = index => {
        const next = (err, newVersionId) => {
          if (err) {
            callback(err);
            return;
          }

          this.lastSyncedVersionId = newVersionId;
          if (index >= entries.length - 1) {
            callback(null, true /* preWriteHook was successful */);
          } else {
            uploadEntry(index + 1);
          }
        };

        const filename = entries[index].path; // 'path' is relative, so it will be the filename.
        this.getFileData(this.prependProjectPath(filename), (err, fileData) => {
          if (err) {
            callback(err);
          } else {
            this.api.changeProjectFile(
              filename,
              fileData,
              next,
              true /* skipPreWriteHook because we are calling from the preWriteHook */
            );
          }
        });
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
    this.fileSystem().mkdir(this.projectPath, err => {
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
    this.fileSystem().readFile(path, {encoding: null}, callback);
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
}
