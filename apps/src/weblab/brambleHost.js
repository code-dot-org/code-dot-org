/* global requirejs */

/**
 * JS to communicate between Bramble and Code Studio
 */

window.requirejs.config({
  baseUrl: '/blockly/js/bramble/'
  // DEVMODE: baseUrl: 'http://127.0.0.1:8000/src/'
});

// This is needed to support jQuery binary downloads
var download = require('../assetManagement/download');

// the main Bramble object -- used to access file system
let bramble_ = null;
// the Bramble proxy object -- used to access methods on the Bramble UI frame
let brambleProxy_ = null;
// interface to Web Lab host in Code Studio
let webLab_ = null;
// the registered onProjectChanged callback function
let onProjectChangedCallback_ = null;
// the set of recent changes since the last syncAssetsWithBramble() called
let _recentBrambleChanges;
// the version id of the project at the time of the last bramble asset sync
let _lastSyncedVersionId;

// Project root in file system
const projectRoot = "/codedotorg/weblab";
const removeProjectRootRegex = /^\/codedotorg\/weblab\//g;

function putFilesInBramble(sources, callback) {
  const fs = bramble_.getFileSystem();
  const sh = new fs.Shell();
  const Path = bramble_.Filer.Path;

  sh.rm(projectRoot, {recursive: true}, err => {
    // create project root directory
    sh.mkdirp(projectRoot, err => {

      function writeFileData(path, data, callback) {
        path = Path.join(projectRoot, path);
        // write the data
        fs.writeFile(path, data, err => {
          // call completion callback
          callback(err);
        });
      }

      // async-chained enumeration: write the i-th file into Bramble file system
      function writeSourceFile(sources, i, callback) {
        if (i < sources.files.length) {
          const file = sources.files[i];
          // write file data into Bramble
          writeFileData(file.name, file.data, () => {
            // continue on to the next item on the list
            writeSourceFile(sources, i + 1, callback);
          });
        } else {
          // end of list, call completion callback
          callback(null);
        }
      }

      if (err && err.code !== "EEXIST") {
        callback(err);
      } else {
        // start an async-chained enumeration through the file list
        writeSourceFile(sources, 0, callback);
      }
    });
  });
}

function removeAllAssetsInBramble(callback) {
  const fs = bramble_.getFileSystem();
  const sh = new fs.Shell();
  const Path = bramble_.Filer.Path;

  // enumerate files in the file system off the project root
  sh.ls(projectRoot, function (err, entries) {
    // async-chained enumeration: remove the file if the attributes indicate
    // that it is an asset
    function removeEntryIfAsset(i, callback) {
      if (i < entries.length) {
        const entry = entries[i];
        const path = Path.join(projectRoot, entry.path);
        fs.getxattr(path, 'asset', (err, assetAttrValue) => {
          if (err && err.name !== 'ENOATTR') {
            callback(err);
            return;
          }
          if (assetAttrValue) {
            sh.rm(path, err => {
              if (err) {
                callback(err);
              } else {
                // File removed, move to next file entry:
                removeEntryIfAsset(i + 1, callback);
              }
            });
          } else {
            // Not an asset file, move to next file entry:
            removeEntryIfAsset(i + 1, callback);
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
      removeEntryIfAsset(0, callback);
    }
  });
}

/*
 * Async-chained enumeration: get the file data for all assets listed in entries
 * @param {string} filename
 * @param {function} callback Function to call with error code and fileData
 */
function getAssetFileData(filename, callback) {
  const fs = bramble_.getFileSystem();
  const Path = bramble_.Filer.Path;
  const path = Path.join(projectRoot, filename);
  fs.getxattr(path, 'asset', (err, assetAttrValue) => {
    if (err && err.name !== 'ENOATTR') {
      callback(err);
      return;
    }
    if (!assetAttrValue) {
      // ignore non-assets, callback with no error or fileData
      callback(null);
    } else {
      // read file data
      fs.readFile(path, { encoding: null }, callback);
    }
  });
}

function resetBrambleChangesAndProjectVersion(projectVersion) {
  _recentBrambleChanges = {
    fileDelete: {},
    fileRename: {},
    fileChange: {},
  };
  _lastSyncedVersionId = projectVersion;
}

function syncAssetsWithBramble(assets, currentProjectVersion, callback) {
  const fs = bramble_.getFileSystem();
  const sh = new fs.Shell();
  const Path = bramble_.Filer.Path;
  const Buffer = bramble_.Filer.Buffer;
  assets = assets || [];
  let localChangeList = [];

  function requestAssetAndWrite(asset, callback) {
    // read the data
    $.ajax(asset.url, {
      dataType: 'binary',
      responseType: 'arraybuffer'
    }).done(data => {
      var path = Path.join(projectRoot, asset.name);
      // write the data
      fs.writeFile(path, new Buffer(data), { encoding: null }, err => {
        if (err) {
          callback(err);
        } else {
          // mark the extended attribute 'asset' as true
          fs.setxattr(path, 'asset', true, err => {
            // call completion callback
            callback(err);
          });
        }
      });
    }).fail((jqXHR, textStatus, errorThrown) => {
      callback(errorThrown);
    });
  }

  // async-chained enumeration: write the i-th file into Bramble file system
  function writeAssetFile(i, callback) {
    if (i < assets.length) {
      // request and write asset data into Bramble
      requestAssetAndWrite(assets[i], err => {
        if (err) {
          // error, call completion callback
          callback();
        } else {
          // continue on to the next item on the list
          writeAssetFile(i + 1, callback);
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
          getAssetFileData(change.file, (err, fileData) => {
            if (err) {
              callback();
            } else if (!fileData) {
              // Non-asset, ignoring...
              handleLocalChange(i + 1, callback);
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

  var versionChanged = _lastSyncedVersionId !== currentProjectVersion;
  _lastSyncedVersionId = currentProjectVersion;
  if (versionChanged) {
    console.log(`syncAssetsWithBramble: version changed: currentProjectVersion ${currentProjectVersion}`);
    if (!jQuery.isEmptyObject(_recentBrambleChanges.fileDelete) ||
        !jQuery.isEmptyObject(_recentBrambleChanges.fileRename) ||
        !jQuery.isEmptyObject(_recentBrambleChanges.fileChange)) {
      console.warn('Bramble host: recent changes ignored and replaced by service changes!');
    }
    // Changes on the server, rebuild from the assets supplied:
    removeAllAssetsInBramble(err => {
      if (err) {
        callback();
      } else {
        // start an async-chained enumeration through the file list
        writeAssetFile(0, callback);
      }
    });
  } else {
    console.log(`syncAssetsWithBramble: version is the same: currentProjectVersion ${currentProjectVersion}`);
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

    // If a changeList was populated, start handling it here:
    handleLocalChange(0, callback);
  }
}

function getFilesFromBramble(callback) {
  const fs = bramble_.getFileSystem();
  const sh = new fs.Shell();
  const Path = bramble_.Filer.Path;

  // enumerate files in the file system off the project root
  sh.ls(projectRoot, function (err, entries) {
    let fileList = [];

    // async-chained enumeration: get the file data for i-th file
    function getFileData(i, callback) {
      if (i < entries.length) {
        const entry = entries[i];
        const path = Path.join(projectRoot, entry.path);
        fs.getxattr(path, 'asset', (err, assetAttrValue) => {
          if (err && err.name !== 'ENOATTR') {
            callback(err);
            return;
          }
          if (assetAttrValue) {
            // ignore assets, move to the next file...
            getFileData(i + 1, callback);
          } else {
            // read file data
            fs.readFile(path, 'utf8', (err, fileData) => {
              if (err) {
                callback(err);
              } else {
                // add file data to list that gets returned
                const file = {name: entry.path, data: fileData};
                fileList.push(file);
                // continue on to next item in list
                getFileData(i + 1, callback);
              }
            });
          }
        });
      } else {
        const code = {files: fileList};
        // end of list, call completion callback
        callback(null, code);
      }
    }

    if (err) {
      callback(err);
    } else {
      // start an async-chained enumeration through the file list
      getFileData(0, callback);
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

function onProjectChanged(callback) {
  onProjectChangedCallback_ = callback;
}

function loadStartSources(callback) {
  // Get initial sources to put in file system
  const startSources = webLab_.getStartSources();

  // put the source files into the Bramble file system
  putFilesInBramble(startSources, err => {
    if (err) {
      callback();
    } else {
      // Start the initial assets sync
      syncAssets(callback);
    }
  });
}

function syncAssets(callback) {
  // Get current assets to put in file system
  const currentAssets = webLab_.getCurrentAssets();
  const currentProjectVersion = webLab_.getCurrentFilesVersionId();

  syncAssetsWithBramble(currentAssets, currentProjectVersion, callback);
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
  getBrambleCode: getFilesFromBramble,
  addFileHTML: addFileHTML,
  addFileCSS: addFileCSS,
  undo: undo,
  redo: redo,
  hideTutorial: hideTutorial,
  showTutorial: showTutorial,
  enableInspector: enableInspector,
  disableInspector: disableInspector,
  onProjectChanged: onProjectChanged,
  loadStartSources: loadStartSources,
  syncAssets: syncAssets,
};

// Give our interface to our parent
webLab_.setBrambleHost(brambleHost);

function load(Bramble) {
  bramble_ = Bramble;

  Bramble.load("#bramble", {
    url: "../blockly/js/bramble/index.html?disableExtensions=bramble-move-file",
    // DEVMODE: url: "http://127.0.0.1:8000/src/index.html?disableExtensions=bramble-move-file",
    useLocationSearch: true
  });

  // Event listeners
  Bramble.once("ready", function (bramble) {

    function handleFileChange(path) {
      // Remove leading slash
      var cleanedPath = path.replace(removeProjectRootRegex, '');
      _recentBrambleChanges.fileChange[cleanedPath] = true;
      if (onProjectChangedCallback_) {
        onProjectChangedCallback_();
      }
    }

    function handleFileDelete(path) {
      // Remove leading slash
      var cleanedPath = path.replace(removeProjectRootRegex, '');
      _recentBrambleChanges.fileDelete[cleanedPath] = true;
      if (onProjectChangedCallback_) {
        onProjectChangedCallback_();
      }
    }

    function handleFileRename(oldFilename, newFilename) {
      // Remove leading slashes
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
  });

  Bramble.once("error", function (err) {
    console.error("Bramble error", err);
    alert("Fatal Error: " + err.message + ". If you're in Private Browsing mode, data can't be written.");
  });

  Bramble.on("readyStateChange", function (previous, current) {

  });

  loadStartSources(function () {
    // tell Bramble which root dir to mount
    Bramble.mount(projectRoot);
  });
}

// Load bramble.js
requirejs(["bramble"], function (Bramble) {
// DEVMODE: requirejs(["bramble/client/main"], function (Bramble) {
  load(Bramble);
});
