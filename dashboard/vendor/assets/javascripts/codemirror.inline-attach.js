/*! inline-attach - v1.3.2 - 2015-01-03 */
/*jslint newcap: true */
/*global XMLHttpRequest: false, inlineAttach: false, FormData: false */
/*
 * Inline Text Attachment
 *
 * Author: Roy van Kaathoven
 * Contact: ik@royvankaathoven.nl
 */
(function(document, window) {
    "use strict";

    /**
     * Simple function to merge the given objects
     *
     * @param {Object[]} object Multiple object parameters
     * @returns {Object}
     */
    function merge() {
        var result = {};
        for (var i = arguments.length - 1; i >= 0; i--) {
            var obj = arguments[i];
            for (var k in obj) {
                result[k] = obj[k];
            }
        }
        return result;
    }

    /**
     * @param {Object} options
     */
    window.inlineAttach = function(options, instance) {

        var settings = merge(options, inlineAttach.defaults),
            editor = instance,
            filenameTag = '{filename}',
            lastValue,
            me = this;

        /**
         * Upload a given file blob
         *
         * @param {Blob} file
         */
        this.uploadFile = function(file) {
            var formData = new FormData(),
                xhr = new XMLHttpRequest(),
                extension = 'png';

            // Attach the file. If coming from clipboard, add a default filename (only works in Chrome for now)
            // http://stackoverflow.com/questions/6664967/how-to-give-a-blob-uploaded-as-formdata-a-file-name
            if (file.name) {
                var fileNameMatches = file.name.match(/\.(.+)$/);
                if (fileNameMatches) {
                    extension = fileNameMatches[1];
                }
            }
            if (settings.addFileBeforeExtraParameters) {
                formData.append(settings.uploadFieldName, file, "image-" + Date.now() + "." + extension);
            }


            // Add any available extra parameters
            if (typeof settings.extraParams === "object") {
                for (var key in settings.extraParams) {
                    if (settings.extraParams.hasOwnProperty(key)) {
                        formData.append(key, settings.extraParams[key]);
                    }
                }
            }

            // Add the file after the extra parameters
            if (!settings.addFileBeforeExtraParameters) {
                formData.append(settings.uploadFieldName, file, "image-" + Date.now() + "." + extension);
            }

            xhr.open(settings.uploadMethod, settings.uploadUrl);

            // Add any available extra headers
            if (typeof settings.extraHeaders === "object") {
                for (var header in settings.extraHeaders) {
                    if (settings.extraHeaders.hasOwnProperty(header)) {
                        xhr.setRequestHeader(header, settings.extraHeaders[header]);
                    }
                }
            }

            xhr.onload = function() {
                // If HTTP status is OK or Created
                if (xhr.status === 200 || xhr.status === 201) {
                    var data = me.parseResponse(xhr);
                    me.onUploadedFile(data);
                } else {
                    me.onErrorUploading();
                }
            };
            xhr.send(formData);
        };

        this.parseResponse = function(xhr) {
            return settings.customResponseParser.call(this, xhr) || JSON.parse(xhr.responseText);
        };

        /**
         * Check if the given file is allowed
         *
         * @param {File} file
         */
        this.isAllowedFile = function(file) {
            return settings.allowedTypes.indexOf(file.type) >= 0;
        };

        /**
         * When a file has finished uploading
         *
         * @param {Object} data
         */
        this.onUploadedFile = function(data) {
            var result = settings.onUploadedFile.call(this, data),
                filename;

            if (settings.dataProcessor) {
                data = settings.dataProcessor.call(this, data);
            }

            filename = data[settings.downloadFieldName];

            if (result !== false && filename) {
                var text = editor.getValue().replace(lastValue, settings.urlText.replace(filenameTag, filename));
                editor.setValue(text);
            }
        };

        /**
         * Custom upload handler
         *
         * @param {Blob} file
         * @return {Boolean} when false is returned it will prevent default upload behavior
         */
        this.customUploadHandler = function(file) {
            return settings.customUploadHandler.call(this, file);
        };

        /**
         * When a file didn't upload properly.
         * Override by passing your own onErrorUploading function with settings.
         *
         * @param {Object} data
         */
        this.onErrorUploading = function() {
            var text = editor.getValue().replace(lastValue, "");
            editor.setValue(text);
            if (settings.customErrorHandler.call(this)) {
                window.alert(settings.errorText);
            }
        };

        /**
         * Append a line of text at the bottom, ensuring there aren't unnecessary newlines
         *
         * @param {String} appended Current content
         * @param {String} previous Value which should be appended after the current content
         */
        function appendInItsOwnLine(previous, appended) {
            return (previous + "\n\n[[D]]" + appended)
                .replace(/(\n{2,})\[\[D\]\]/, "\n\n")
                .replace(/^(\n*)/, "");
        }

        /**
         * When a file has been received by a drop or paste event
         * @param {Blob} file
         */
        this.onReceivedFile = function(file) {
            var result = settings.onReceivedFile.call(this, file);
            if (result !== false) {
                lastValue = settings.progressText;
                editor.setValue(appendInItsOwnLine(editor.getValue(), lastValue));
            }
        };

        /**
         * Catches the paste event
         *
         * @param {Event} e
         * @returns {Boolean} If a file is handled
         */
        this.onPaste = function(e) {
            var result = false,
                clipboardData = e.clipboardData,
                items;

            if (typeof clipboardData === "object") {

                items = clipboardData.items || clipboardData.files || [];

                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    if (me.isAllowedFile(item)) {
                        result = true;
                        this.onReceivedFile(item.getAsFile());
                        if (this.customUploadHandler(item.getAsFile())) {
                            this.uploadFile(item.getAsFile());
                        }
                    }
                }
            }


            return result;
        };

        /**
         * Catches onDrop event
         *
         * @param {Event} e
         * @returns {Boolean} If a file is handled
         */
        this.onDrop = function(e) {
            var result = false;
            for (var i = 0; i < e.dataTransfer.files.length; i++) {
                var file = e.dataTransfer.files[i];
                if (me.isAllowedFile(file)) {
                    result = true;
                    this.onReceivedFile(file);
                    if (this.customUploadHandler(file)) {
                        this.uploadFile(file);
                    }
                }
            }

            return result;
        };
    };

    /**
     * Editor
     */
    window.inlineAttach.Editor = function(instance) {

        var input = instance;

        return {
            getValue: function() {
                return input.value;
            },
            setValue: function(val) {
                input.value = val;
            }
        };
    };

    /**
     * Default configuration
     */
    window.inlineAttach.defaults = {
        /**
         * URL to upload the attachment
         */
        uploadUrl: 'upload_attachment.php',

        /**
         * Upload HTTP method used
         */
        uploadMethod: 'POST',

        /**
         * Request field name where the attachment will be placed in the form data
         */
        uploadFieldName: 'file',

        /**
         * Add the file to the form data before adding the extra parameters
         * (alternative being to add the file after the extra parameters)
         */
        addFileBeforeExtraParameters: true,

        /**
         * Where is the filename placed in the response
         */
        downloadFieldName: 'filename',

        /**
         * Allowed types
         */
        allowedTypes: [
            'image/jpeg',
            'image/png',
            'image/jpg',
            'image/gif'
        ],

        /**
         * Will be inserted on a drop or paste event
         */
        progressText: '![Uploading file...]()',

        /**
         * When a file has successfully been uploaded the last inserted text
         * will be replaced by the urlText, the {filename} tag will be replaced
         * by the filename that has been returned by the server
         */
        urlText: "![file]({filename})",

        /**
         * Text for default error when uploading
         */
        errorText: "Error uploading file",

        /**
         * Extra parameters which will be send when uploading a file
         */
        extraParams: {},

        /**
         * Extra headers which will be send when uploading a file
         */
        extraHeaders: {},

        /**
         * When a file is received by drag-drop or paste
         */
        onReceivedFile: function() {},

        /**
         * Custom upload handler
         *
         * @return {Boolean} when false is returned it will prevent default upload behavior
         */
        customUploadHandler: function() {
            return true;
        },

        /**
         * Custom error handler. Runs after removing the placeholder text and before the alert().
         * Return false from this function to prevent the alert dialog.
         *
         * @return {Boolean} when false is returned it will prevent default error behavior
         */
        customErrorHandler: function() {
            return true;
        },

        /**
         * Custom response parser
         *
         * @return {Object} containing a parsed version of the response
         *                  or a falsey value will default back to parsing the response as JSON
         */
        customResponseParser: function(xhr) { // jshint unused:false
            return null;
        },

        /**
         * When a file has succesfully been uploaded
         */
        onUploadedFile: function() {}
    };

    /**
     * Attach to a standard input field
     *
     * @param {Input} input
     * @param {Object} options
     */
    window.inlineAttach.attachToInput = function(input, options) {

        options = options || {};

        var editor = new inlineAttach.Editor(input),
            inlineattach = new inlineAttach(options, editor);

        input.addEventListener('paste', function(e) {
            inlineattach.onPaste(e);
        }, false);
        input.addEventListener('drop', function(e) {
            e.stopPropagation();
            e.preventDefault();
            inlineattach.onDrop(e);
        }, false);
        input.addEventListener('dragenter', function(e) {
            e.stopPropagation();
            e.preventDefault();
        }, false);
        input.addEventListener('dragover', function(e) {
            e.stopPropagation();
            e.preventDefault();
        }, false);
    };

})(document, window);

/*jslint newcap: true */
/*global inlineAttach: false */
/**
 * CodeMirror version for inlineAttach
 *
 * Call inlineAttach.attachToCodeMirror(editor) to attach to a codemirror instance
 *
 * @param {document} document
 * @param {window} window
 */
(function(document, window) {
    "use strict";

    function CodeMirrorEditor(instance) {

        if (!instance.getWrapperElement) {
            throw "Invalid CodeMirror object given";
        }

        var codeMirror = instance;

        return {
            getValue: function() {
                return codeMirror.getValue();
            },
            setValue: function(val) {
                var cursor = codeMirror.getCursor();
                codeMirror.setValue(val);
                codeMirror.setCursor(cursor);
            }
        };
    }

    CodeMirrorEditor.prototype = new inlineAttach.Editor();

    /**
     * @param {CodeMirror} codeMirror
     */
    window.inlineAttach.attachToCodeMirror = function(codeMirror, options) {

        options = options || {};

        var editor          = new CodeMirrorEditor(codeMirror),
            inlineattach    = new inlineAttach(options, editor),
            el              = codeMirror.getWrapperElement();

        el.addEventListener('paste', function(e) {
            inlineattach.onPaste(e);
        }, false);

        codeMirror.on('drop', function(data, e) {
          if (inlineattach.onDrop(e)) {
            e.stopPropagation();
            e.preventDefault();
            return true;
          } else {
            return false;
          }
        });
    };

})(document, window);
