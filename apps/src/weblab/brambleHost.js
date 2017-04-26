/* global requirejs */

/**
 * JS to communicate between Bramble and Code Studio
 */

window.requirejs.config({
  baseUrl: '/blockly/js/bramble/'
  // DEVMODE: baseUrl: 'http://127.0.0.1:8000/src/'
});

// This is needed to support jQuery binary downloads
import '../assetManagement/download';

// the main Bramble object -- used to access file system
let bramble_ = null;
// the Bramble proxy object -- used to access methods on the Bramble UI frame
let brambleProxy_ = null;
// interface to Web Lab host in Code Studio
let webLab_ = null;
// the registered onProjectChanged callback function
let onProjectChangedCallback_ = null;
// the registered onBrambleReady callback function
let onBrambleReadyCallback_ = null;
// the set of recent changes since the last syncFilesWithBramble() called
let _recentBrambleChanges;
// the version id of the project at the time of the last bramble file sync
let _lastSyncedVersionId;

// Project root in file system
const weblabRoot = "/codedotorg/weblab";

function ensureProjectRootDirExists(callback) {
  const fs = bramble_.getFileSystem();
  const sh = new fs.Shell();

  // create project root directory
  sh.mkdirp(`${weblabRoot}/${currentProjectId}`, err => {
    if (err && err.code === "EEXIST") {
      // If it already exists, treat that as a success case
      err = null;
    }
    callback(err);
  });
}

function putFilesInBramble(sources, callback) {
  const fs = bramble_.getFileSystem();
  const sh = new fs.Shell();
  const Path = bramble_.Filer.Path;

  sh.rm(`${weblabRoot}/${currentProjectId}`, {recursive: true}, err => {
    // create project root directory
    sh.mkdirp(`${weblabRoot}/${currentProjectId}`, err => {

      function writeFileDataAndContinue(filename, data, currentIndex) {
        var path = Path.join(`${weblabRoot}/${currentProjectId}`, filename);
        // write the data
        function onWriteComplete(err) {
          if (err) {
            // call completion callback
            callback(err);
          } else {
            // force these writes into the fileChange log since the events take
            // too long to appear (the later events will not be harmful):
            _recentBrambleChanges.fileChange[filename] = true;

            // continue on to the next item on the list
            writeSourceFile(currentIndex + 1);
          }
        }
        if (typeof data === 'string') {
          fs.writeFile(path, data, onWriteComplete);
        } else {
          fs.writeFile(path, data, { encoding: null }, onWriteComplete);
        }
      }

      // async-chained enumeration: write the i-th file into Bramble file system
      function writeSourceFile(currentIndex) {
        if (currentIndex < sources.files.length) {
          const file = sources.files[currentIndex];
          if (!file.name) {
            console.warn(`startSources file entry has no name property!`);
            writeSourceFile(currentIndex + 1);
            return;
          }
          if (file.url) {
            if (file.data) {
              console.warn(`startSources ${file.name} has both url and data!`);
            }
            // read the data from the URL
            $.ajax(file.url, {
              dataType: 'binary',
              responseType: 'arraybuffer'
            }).done(data => {
              writeFileDataAndContinue(file.name, new Buffer(data), currentIndex);
            }).fail((jqXHR, textStatus, errorThrown) => {
              callback(errorThrown);
            });
          } else if (file.data) {
            // write file data into Bramble
            writeFileDataAndContinue(file.name, file.data, currentIndex);
          } else {
            console.warn(`startSources ${file.name} has neither url or data!`);
            writeSourceFile(currentIndex + 1);
          }
        } else {
          // end of list, call completion callback
          callback(null);
        }
      }

      if (err && err.code !== "EEXIST") {
        callback(err);
      } else {
        // start an async-chained enumeration through the file list
        writeSourceFile(0);
      }
    });
  });
}

function removeAllFilesInBramble(callback) {
  const fs = bramble_.getFileSystem();
  const sh = new fs.Shell();

  sh.rm(`${weblabRoot}/${currentProjectId}`, {recursive: true}, err => {
    // create project root directory
    sh.mkdirp(`${weblabRoot}/${currentProjectId}`, err => {
      if (err && err.code === "EEXIST") {
        err = null;
      }
      callback(err);
    });
  });
}

/*
 * Get the file data for filename
 * @param {string} filename
 * @param {function} callback Function to call with error code and fileData
 */
function getFileData(filename, callback) {
  const fs = bramble_.getFileSystem();
  const Path = bramble_.Filer.Path;
  const path = Path.join(`${weblabRoot}/${currentProjectId}`, filename);
  fs.readFile(path, { encoding: null }, callback);
}

function resetBrambleChangesAndProjectVersion(projectVersion) {
  _recentBrambleChanges = {
    fileDelete: {},
    fileRename: {},
    fileChange: {},
  };
  _lastSyncedVersionId = projectVersion;
}

function syncFilesWithBramble(fileEntries, currentProjectVersion, callback) {
  const fs = bramble_.getFileSystem();
  const Path = bramble_.Filer.Path;
  const Buffer = bramble_.Filer.Buffer;
  fileEntries = fileEntries || [];
  let localChangeList = [];

  function requestFileEntryAndWrite(fileEntry, callback) {
    // read the data
    $.ajax(fileEntry.url, {
      dataType: 'binary',
      responseType: 'arraybuffer'
    }).done(data => {
      var path = Path.join(`${weblabRoot}/${currentProjectId}`, fileEntry.name);
      // write the data
      fs.writeFile(path, new Buffer(data), { encoding: null }, callback);
    }).fail((jqXHR, textStatus, errorThrown) => {
      callback(errorThrown);
    });
  }

  // async-chained enumeration: write the i-th file into Bramble file system
  function writeFileEntry(i, callback) {
    if (i < fileEntries.length) {
      // request and write fileEntry data into Bramble
      requestFileEntryAndWrite(fileEntries[i], err => {
        if (err) {
          // error, call completion callback
          callback();
        } else {
          // continue on to the next item on the list
          writeFileEntry(i + 1, callback);
        }
      });
    } else {
      // end of list, call completion callback
      callback();
    }
  }

  // async-chained enumeration: handle local file system changes and send them
  // to the service
  function handleLocalChange(i, callback) {
    if (i < localChangeList.length) {
      let change = localChangeList[i];
      switch (change.operation) {
        case 'delete':
          webLab_.deleteProjectFile(change.file, (err, versionId) => {
            if (err) {
              callback();
            } else {
              _lastSyncedVersionId = versionId;
              handleLocalChange(i + 1, callback);
            }
          });
          break;

        case 'rename':
          webLab_.renameProjectFile(change.file, change.newFile, (err, versionId) => {
            if (err) {
              callback();
            } else {
              _lastSyncedVersionId = versionId;
              handleLocalChange(i + 1, callback);
            }
          });
          break;

        case 'change':
          getFileData(change.file, (err, fileData) => {
            if (err) {
              callback();
            } else {
              webLab_.changeProjectFile(change.file, fileData, (err, versionId) => {
                if (err) {
                  callback();
                } else {
                  _lastSyncedVersionId = versionId;
                  handleLocalChange(i + 1, callback);
                }
              });
            }
          });
          break;

        default:
          console.error("Bramble host: unknown local change");
          callback();
      }
    } else {
      callback();
    }
  }

  if (_lastSyncedVersionId !== currentProjectVersion) {
    if (!jQuery.isEmptyObject(_recentBrambleChanges.fileDelete) ||
        !jQuery.isEmptyObject(_recentBrambleChanges.fileRename) ||
        !jQuery.isEmptyObject(_recentBrambleChanges.fileChange)) {
      console.warn('Bramble host: recent changes ignored and replaced by service changes!');
    }
    resetBrambleChangesAndProjectVersion(currentProjectVersion);
    // Cancel any beforewrite hook that we may have registered, because we are
    // now treating the service as the source of truth:
    webLab_.registerBeforeFirstWriteHook(null);
    // Changes on the server, rebuild from the fileEntries supplied:
    removeAllFilesInBramble(err => {
      if (err) {
        callback();
      } else {
        // start an async-chained enumeration through the fileEntries list
        writeFileEntry(0, callback);
      }
    });
  } else {
    for (let name in _recentBrambleChanges.fileDelete) {
      localChangeList.push({
        operation: 'delete',
        file: name
      });
    }
    for (let name in _recentBrambleChanges.fileRename) {
      localChangeList.push({
        operation: 'rename',
        file: name,
        newFile: _recentBrambleChanges.fileRename[name]
      });
    }
    for (let name in _recentBrambleChanges.fileChange) {
      localChangeList.push({
        operation: 'change',
        file: name
      });
    }
    resetBrambleChangesAndProjectVersion(currentProjectVersion);
    // If a changeList was populated, start handling it here:
    handleLocalChange(0, callback);
  }
}

function uploadAllFilesFromBramble(callback) {
  const fs = bramble_.getFileSystem();
  const sh = new fs.Shell();

  // enumerate files in the file system off the project root
  sh.ls(`${weblabRoot}/${currentProjectId}`, function (err, entries) {
    // async-chained enumeration: get the file data for i-th file
    function getEntryFileData(i, callback) {
      if (i < entries.length) {
        const entry = entries[i];
        getFileData(entry.path, (err, fileData) => {
          if (err) {
            callback();
          } else {
            webLab_.changeProjectFile(entry.path, fileData, (err, versionId) => {
              if (err) {
                callback();
              } else {
                _lastSyncedVersionId = versionId;
                getEntryFileData(i + 1, callback);
              }
            });
          }
        });
      } else {
        // end of list, call completion callback
        callback(null);
      }
    }

    if (err) {
      callback(err);
    } else {
      // start an async-chained enumeration through the file list
      getEntryFileData(0, callback);
    }
  });
}

function addFileHTML() {
  brambleProxy_.addNewFile({
    basenamePrefix: 'new',
    ext: 'html',
    contents: '<!DOCTYPE html>\n<html>\n<body>\n\n</body>\n</html>',
  }, err => {
    if (err) {
      throw err;
    }
  });
}

function addFileCSS() {
  brambleProxy_.addNewFile({
    basenamePrefix: 'new',
    ext: 'css',
    contents: 'body {\n  \n}',
  }, err => {
    if (err) {
      throw err;
    }
  });
}

function undo() {
  brambleProxy_.undo();
}

function redo() {
  brambleProxy_.redo();
}

function hideTutorial() {
  brambleProxy_.hideTutorial();
}

function showTutorial() {
  brambleProxy_.showTutorial();
}

function enableInspector() {
  brambleProxy_.enableInspector();
}

function disableInspector() {
  brambleProxy_.disableInspector();
}

function refreshPreview() {
  brambleProxy_.refreshPreview();
}

function enableFullscreenPreview() {
  brambleProxy_.enableFullscreenPreview();
}

function onProjectChanged(callback) {
  onProjectChangedCallback_ = callback;
}

function onBrambleReady(callback) {
  onBrambleReadyCallback_ = callback;
}

function startInitialFileSync(callback, forceResetToStartSources) {
  const currentProjectVersion = webLab_.getCurrentFilesVersionId();

  if (!currentProjectVersion || forceResetToStartSources) {
    // Get initial sources to put in file system
    const startSources = webLab_.getStartSources();

    // Sync what's on the service locally (should be nothing, but this ensures
    // our _lastSyncedVersionId matches before we make changes)
    syncFiles(err => {
      if (err) {
        console.warn(`Bramble host: Initial syncFiles failed with error: ${err}`);
      }
      // put the source files into the Bramble file system
      putFilesInBramble(startSources, err => {
        if (err) {
          callback();
        } else {
          if (forceResetToStartSources) {
            console.log('startInitialFileSync: forceResetToStartSources - calling syncFiles()');
            // Start the initial files sync
            syncFiles(callback);
          } else {
            // First-time level load - no project versionId

            // Ignore all of the change events that just occured as we wrote the
            // startSources into bramble - there is no need to save these during
            // sync until a user-initiated change occurs
            resetBrambleChangesAndProjectVersion(currentProjectVersion);
            webLab_.registerBeforeFirstWriteHook(uploadAllFilesFromBramble);

            // Start the initial files sync
            syncFiles(callback);
          }
        }
      });
    });
  } else {
    ensureProjectRootDirExists(err => {
      // Start the initial files sync
      syncFiles(callback);
    });
  }
}

function syncFiles(callback) {
  // Get current fileEntries to put in file system
  const currentFileEntries = webLab_.getCurrentFileEntries();
  const currentProjectVersion = webLab_.getCurrentFilesVersionId();

  syncFilesWithBramble(currentFileEntries, currentProjectVersion, callback);
}

// Init change list and version structures
resetBrambleChangesAndProjectVersion();

// Get the WebLab object from our parent window
if (parent.getWebLab) {
  webLab_ = parent.getWebLab();
} else {
  console.error("ERROR: getWebLab() method not found on parent");
}

// expose object for parent window to talk to us through
const brambleHost = {
  // return file data from the Bramble editor
  addFileHTML: addFileHTML,
  addFileCSS: addFileCSS,
  undo: undo,
  redo: redo,
  hideTutorial: hideTutorial,
  showTutorial: showTutorial,
  enableInspector: enableInspector,
  disableInspector: disableInspector,
  refreshPreview: refreshPreview,
  enableFullscreenPreview: enableFullscreenPreview,
  onProjectChanged: onProjectChanged,
  onBrambleReady: onBrambleReady,
  startInitialFileSync: startInitialFileSync,
  syncFiles: syncFiles,
};

// Give our interface to our parent
var currentProjectId = webLab_.setBrambleHost(brambleHost);
var removeProjectRootRegex = new RegExp(`^\\/codedotorg\/weblab\/${currentProjectId}\/`, 'g');

function load(Bramble) {
  bramble_ = Bramble;

  Bramble.load("#bramble", {
    url: "//downloads.computinginthecore.org/bramble_0.1.14/index.html?disableExtensions=bramble-move-file",
    // DEVMODE: INSECURE (local) url: "../blockly/js/bramble/index.html?disableExtensions=bramble-move-file",
    // DEVMODE: INSECURE url: "http://127.0.0.1:8000/src/index.html?disableExtensions=bramble-move-file",
    useLocationSearch: true,
    disableUIState: true,
    initialUIState: {
      readOnly: webLab_.getPageConstants().isReadOnlyWorkspace
    }
  });

  // Event listeners
  Bramble.once("ready", function (bramble) {

    function handleFileChange(path) {
      // Remove leading project root path
      var cleanedPath = path.replace(removeProjectRootRegex, '');
      _recentBrambleChanges.fileChange[cleanedPath] = true;
      if (onProjectChangedCallback_) {
        onProjectChangedCallback_();
      }
    }

    function handleFileDelete(path) {
      // Remove leading project root path
      var cleanedPath = path.replace(removeProjectRootRegex, '');
      _recentBrambleChanges.fileDelete[cleanedPath] = true;
      if (onProjectChangedCallback_) {
        onProjectChangedCallback_();
      }
    }

    function handleFileRename(oldFilename, newFilename) {
      // Remove leading project root paths
      var cleanedOldFilename = oldFilename.replace(removeProjectRootRegex, '');
      var cleanedNewFilename = newFilename.replace(removeProjectRootRegex, '');
      _recentBrambleChanges.fileRename[cleanedOldFilename] = cleanedNewFilename;
      if (onProjectChangedCallback_) {
        onProjectChangedCallback_();
      }
    }

    function handleFolderRename(paths) {
      if (onProjectChangedCallback_) {
        onProjectChangedCallback_();
      }
    }

    bramble.on("fileChange", handleFileChange);
    bramble.on("fileDelete", handleFileDelete);
    bramble.on("fileRename", handleFileRename);
    bramble.on("folderRename", handleFolderRename);

    brambleProxy_ = bramble;

    if (onBrambleReadyCallback_) {
      onBrambleReadyCallback_();
    }
  });

  Bramble.once("error", function (err) {
    console.error("Bramble error", err);
    alert("Fatal Error: " + err.message + ". If you're in Private Browsing mode, data can't be written.");
  });

  Bramble.on("readyStateChange", function (previous, current) {

  });

  startInitialFileSync(function () {
    // tell Bramble which root dir to mount
    Bramble.mount(`${weblabRoot}/${currentProjectId}`);
  });
}

// Load bramble.js
requirejs(["bramble"], function (Bramble) {
// DEVMODE: requirejs(["bramble/client/main"], function (Bramble) {
  load(Bramble);
});
