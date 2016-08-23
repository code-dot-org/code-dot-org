/**
 * JS to communicate between Bramble and Code Studio
 */

(function () {
    "use strict";

    require.config({
        baseUrl: '/blockly/js/bramble/'
    });

    // Allow the user to override what we do with default files using `?forceFiles=1`
    var forceFiles = window.location.search.indexOf("forceFiles=1") > -1;

    var theBramble = null;
    var webLab = null;

    // Default filesystem content
    var projectRoot = "/codedotorg/weblab";

    if (parent.getWebLab) {
        webLab = parent.getWebLab();
    } else {
        console.error("ERROR: getWebLab() method not found on parent");
    }

    var startSources = webLab.getStartSources();

    var brambleHost = {
        getBrambleCode: function (callback) {
            var fs = theBramble.getFileSystem();
            var sh = new fs.Shell();
            var Path = theBramble.Filer.Path;

            sh.ls(projectRoot, function (err, entries) {
                if (err) {
                    throw err;
                }
                var fileList = [];

                function getFileData(i, callback) {
                    if (i < entries.length) {
                        var entry = entries[i];
                        var path = Path.join(projectRoot, entry.path);
                        fs.readFile(path, 'utf8', function (err, fileData) {
                            if (err) {
                                throw err;
                            }
                            var file = { name: entry.path, data: fileData};
                            fileList.push(file);
                            getFileData(i+1, callback);
                        });
                    } else {
                        var code = { files: fileList };
                        callback(code);
                    }
                }

                getFileData(0,callback);
            });
        }
    };

    webLab.setBrambleHost(brambleHost);

    function installDefaultFiles(Bramble, callback) {
        var fs = Bramble.getFileSystem();
        var sh = new fs.Shell();
        var Path = Bramble.Filer.Path;

        // Simulate a more complex root, like Thimble does
        sh.rm(projectRoot, {recursive: true}, function (err) {
            sh.mkdirp(projectRoot, function (err) {
                // If we run this multiple times, the dir will exist
                if (err && err.code !== "EEXIST") {
                    throw err;
                }

                // Stick things in the project root
                function writeProjectFile(path, data, callback) {
                    path = Path.join(projectRoot, path);
                    fs.writeFile(path, data, function (err) {
                        if (err) {
                            throw err;
                        }
                        callback();
                    });
                }

                function writeStartSource(i, callback) {
                    if (i < startSources.files.length) {
                        var file = startSources.files[i];
                        writeProjectFile(file.name, file.data, function () {
                            writeStartSource(i + 1, callback);
                        });
                    } else {
                        callback();
                    }
                }

                writeStartSource(0, callback);
            });
        });
    }

    function ensureFiles(Bramble, callback) {
        var fs = Bramble.getFileSystem();

        return installDefaultFiles(Bramble, callback);
    }

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

        // Setup the filesystem while Bramble is loading
        ensureFiles(Bramble, function () {
            // Now that fs is setup, tell Bramble which root dir to mount
            // and which file within that root to open on startup.
            Bramble.mount(projectRoot);
        });
    }

    // Load bramble.js
    require(["bramble"], function (Bramble) {
        load(Bramble);
    });
}());
