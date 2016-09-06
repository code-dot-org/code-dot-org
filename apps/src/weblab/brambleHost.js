/* global requirejs */

/**
 * JS to communicate between Bramble and Code Studio
 */

(function () {
    window.requirejs.config({
        baseUrl: '/blockly/js/bramble/'
    });

    // the main Bramble object -- used to access file system
    var bramble_ = null;
    // the Bramble proxy object -- used to access methods on the Bramble UI frame
    var brambleProxy_ = null;
    // interface to Web Lab host in Code Studio
    var webLab_ = null;

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
                    // write the data
                    fs.writeFile(path, data, function (err) {
                        if (err) {
                            throw err;
                        }
                        // call completion callback
                        callback();
                    });
                }

                // async-chained enumeration: write the i-th file into Bramble file system
                function writeSourceFile(sources, i, callback) {
                    if (i < sources.files.length) {
                        var file = sources.files[i];
                        // write file data into Bramble
                        writeFileData(file.name, file.data, function () {
                            // continue on to the next item on the list
                            writeSourceFile(sources, i + 1, callback);
                        });
                    } else {
                        // end of list, call completion callback
                        callback();
                    }
                }

                // start an async-chained enumeration through the file list
                writeSourceFile(sources, 0, callback);
            });
        });
    }

    function getFilesFromBramble(callback) {

        var fs = bramble_.getFileSystem();
        var sh = new fs.Shell();
        var Path = bramble_.Filer.Path;

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

            // start an async-chained enumeration through the file list
            getFileData(0,callback);
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


    // Get the WebLab object from our parent window
    if (parent.getWebLab) {
        webLab_ = parent.getWebLab();
    } else {
        console.error("ERROR: getWebLab() method not found on parent");
    }

    // expose object for parent window to talk to us through
    var brambleHost = {
        // return file data from the Bramble editor
        getBrambleCode: getFilesFromBramble,
        undo: undo,
        redo: redo,
        hideTutorial: hideTutorial,
        showTutorial: showTutorial,
        enableInspector: enableInspector,
        disableInspector: disableInspector
    };

    // Give our interface to our parent
    webLab_.setBrambleHost(brambleHost);

    var inspectorEnabled = false;

    function load(Bramble) {
        bramble_ = Bramble;

        Bramble.load("#bramble",{
            url: "../blockly/js/bramble/index.html",
            useLocationSearch: true
        });

        // Event listeners
        Bramble.on("ready", function (bramble) {

            brambleProxy_ = bramble;
            brambleProxy_.showTutorial();
        });

        Bramble.once("error", function (err) {
            console.error("Bramble error", err);
            alert("Fatal Error: " + err.message + ". If you're in Private Browsing mode, data can't be written.");
        });

        Bramble.on("readyStateChange", function (previous, current) {

        });

        // Get initial sources to put in file system
        var startSources = webLab_.getStartSources();

        // put the source files into the Bramble file system
        putFilesInBramble(Bramble, startSources, function () {
            // tell Bramble which root dir to mount
            Bramble.mount(projectRoot);
        });
    }

    // Load bramble.js
    requirejs(["bramble"], function (Bramble) {
        load(Bramble);
    });
}());
