/**
 * JS to communicate between Bramble and Code Studio
 */

(function () {
    "use strict";

    require.config({
        baseUrl: '/blockly/js/bramble/'
    });

    var theBramble = null;
    var webLab = null;

    // Project root in file system
    var projectRoot = "/codedotorg/weblab";

    function putFilesInBramble(Bramble, sources, callback) {
        var fs = Bramble.getFileSystem();
        var sh = new fs.Shell();
        var Path = Bramble.Filer.Path;

        sh.rm(projectRoot, {recursive: true}, function (err) {
            // create project root directory
            sh.mkdirp(projectRoot, function (err) {
                if (err && err.code !== "EEXIST") {
                    throw err;
                }

                function writeFileData(path, data, callback) {
                    path = Path.join(projectRoot, path);
                    fs.writeFile(path, data, function (err) {
                        if (err) {
                            throw err;
                        }
                        callback();
                    });
                }

                // async-chained enumeration: write the i-th file into Bramble file system
                function writeSourceFile(sources, i, callback) {
                    if (i < sources.files.length) {
                        var file = sources.files[i];
                        writeFileData(file.name, file.data, function () {
                            writeSourceFile(sources, i + 1, callback);
                        });
                    } else {
                        // end of list, call completion callback
                        callback();
                    }
                }

                writeSourceFile(sources, 0, callback);
            });
        });
    }

    function getFilesFromBramble(callback) {

        var fs = theBramble.getFileSystem();
        var sh = new fs.Shell();
        var Path = theBramble.Filer.Path;

        // enumerate files in the file system off the project root
        sh.ls(projectRoot, function (err, entries) {
            if (err) {
                throw err;
            }
            var fileList = [];

            // async-chained enumeration: get the file data for i-th file
            function getFileData(i, callback) {
                if (i < entries.length) {
                    var entry = entries[i];
                    var path = Path.join(projectRoot, entry.path);
                    // read file data
                    fs.readFile(path, 'utf8', function (err, fileData) {
                        if (err) {
                            throw err;
                        }
                        // add file data to list that gets returned
                        var file = { name: entry.path, data: fileData};
                        fileList.push(file);
                        // continue on to next item in list
                        getFileData(i+1, callback);
                    });
                } else {
                    var code = { files: fileList };
                    // end of list, call completion callback
                    callback(code);
                }
            }

            // start an async-chained walk through the file list
            getFileData(0,callback);
        });
    }


    // Get the WebLab object from our parent window
    if (parent.getWebLab) {
        webLab = parent.getWebLab();
    } else {
        console.error("ERROR: getWebLab() method not found on parent");
    }

    // expose object for parent window to talk to us through
    var brambleHost = {
        // return file data from the Bramble editor
        getBrambleCode: getFilesFromBramble
    };

    // Give our interface to our parent
    webLab.setBrambleHost(brambleHost);

    var inspectorEnabled = false;

    function load(Bramble) {
        theBramble = Bramble;

        Bramble.load("#bramble",{
            url: "../blockly/js/bramble/index.html",
            useLocationSearch: true
        });

        // Event listeners
        Bramble.on("ready", function (bramble) {
            // For debugging, attach to window.
            window.bramble = bramble;

            bramble.showTutorial();

            var parentDocument = parent.document;

            parentDocument.getElementById("undo-link").onclick = function () {
                window.bramble.undo();
                webLab.onProjectChanged();
            };

            parentDocument.getElementById("redo-link").onclick = function () {
                window.bramble.redo();
                webLab.onProjectChanged();
            };

            parentDocument.getElementById("preview-link").onclick = function () {
                window.bramble.hideTutorial();
                webLab.onProjectChanged();
            };

            parentDocument.getElementById("tutorial-link").onclick = function () {
                window.bramble.showTutorial();
                webLab.onProjectChanged();
            };

            parentDocument.getElementById("inspector-link").onclick = function () {
                inspectorEnabled = !inspectorEnabled;
                if (inspectorEnabled) {
                    window.bramble.enableInspector();
                } else {
                    window.bramble.disableInspector();
                }
            };
        });

        Bramble.once("error", function (err) {
            console.error("Bramble error", err);
            alert("Fatal Error: " + err.message + ". If you're in Private Browsing mode, data can't be written.");
        });

        Bramble.on("readyStateChange", function (previous, current) {

        });

        // Get initial sources to put in file system
        var startSources = webLab.getStartSources();

        // put the source files into the Bramble file system
        putFilesInBramble(Bramble, startSources, function () {
            // tell Bramble which root dir to mount
            Bramble.mount(projectRoot);
        });
    }

    // Load bramble.js
    require(["bramble"], function (Bramble) {
        load(Bramble);
    });
}());
