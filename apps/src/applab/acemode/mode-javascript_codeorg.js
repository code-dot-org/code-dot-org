/* global ace */

var dropletConfig = require('../dropletConfig');
var dropletUtils = require('../../dropletUtils');
var annotationList = require('./annotationList');

// define ourselves for ace, so that it knows where to get us
ace.define("ace/mode/javascript_codeorg",["require","exports","module","ace/lib/oop","ace/mode/javascript","ace/mode/javascript_highlight_rules","ace/worker/worker_client","ace/mode/matching_brace_outdent","ace/mode/behaviour/cstyle","ace/mode/folding/cstyle","ace/config","ace/lib/net"], function(acerequire, exports, module) {

var oop = acerequire("ace/lib/oop");
var JavaScriptMode = acerequire("ace/mode/javascript").Mode;
var JavaScriptHighlightRules = acerequire("ace/mode/javascript_highlight_rules").JavaScriptHighlightRules;
var WorkerClient = acerequire("../worker/worker_client").WorkerClient;
var MatchingBraceOutdent = acerequire("./matching_brace_outdent").MatchingBraceOutdent;
var CstyleBehaviour = acerequire("./behaviour/cstyle").CstyleBehaviour;
var CStyleFoldMode = acerequire("./folding/cstyle").FoldMode;

var Mode = function() {
    this.HighlightRules = JavaScriptHighlightRules;
    this.$outdent = new MatchingBraceOutdent();
    this.$behaviour = new CstyleBehaviour();
    this.foldingRules = new CStyleFoldMode();
};
oop.inherits(Mode, JavaScriptMode);

(function() {

  // A set of keywords we don't want to autocomplete
  var excludedKeywords = [
    'ArrayBuffer',
    'Collator',
    'EvalError',
    'Float32Array',
    'Float64Array',
    'Intl',
    'Int16Array',
    'Int32Array',
    'Int8Array',
    'Iterator',
    'NumberFormat',
    'Object',
    'QName',
    'RangeError',
    'ReferenceError',
    'StopIteration',
    'SyntaxError',
    'TypeError',
    'Uint16Array',
    'Uint32Array',
    'Uint8Array',
    'Uint8ClampedArra',
    'URIError'
  ];

  // Manually create our highlight rules so that we can modify it
  this.$highlightRules = new JavaScriptHighlightRules();

  excludedKeywords.forEach(function (keywordToRemove) {
    var keywordIndex = this.$highlightRules.$keywordList.indexOf(keywordToRemove);
    if (keywordIndex > 0) {
      this.$highlightRules.$keywordList.splice(keywordIndex);
    }
  }, this);

  this.createWorker = function(session) {
    var worker = new WorkerClient(["ace"], "ace/mode/javascript_worker", "JavaScriptWorker");
    worker.attachToDocument(session.getDocument());
    var newOptions = {
      unused: true,
      undef: true,
      predef: {
      }
    };
    // Mark all of our blocks as predefined so that linter doesnt complain about
    // using undefined variables
    dropletUtils.getAllAvailableDropletBlocks(dropletConfig).forEach(function (block) {
      newOptions.predef[block.func] = false;
    });

    annotationList.attachToSession(session);

    worker.send("changeOptions", [newOptions]);

    worker.on("jslint", annotationList.setJSLintAnnotations);

    worker.on("terminate", function() {
      session.clearAnnotations();
    });

    return worker;
  };
}).call(Mode.prototype);

exports.Mode = Mode;
});
