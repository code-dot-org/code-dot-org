/* global ace */
var dropletUtils = require('../dropletUtils');
var annotationList = require('./annotationList');

exports.defineForAce = function (dropletConfig, unusedConfig, dropletEditor) {
  // define ourselves for ace, so that it knows where to get us
  ace.define("ace/mode/javascript_codeorg", ["require", "exports", "module", "ace/lib/oop", "ace/mode/javascript", "ace/mode/javascript_highlight_rules", "ace/worker/worker_client", "ace/mode/matching_brace_outdent", "ace/mode/behaviour/cstyle", "ace/mode/folding/cstyle", "ace/config", "ace/lib/net", "ace/ext/searchbox"], function(acerequire, exports, module) {

    var oop = acerequire("ace/lib/oop");
    var JavaScriptMode = acerequire("ace/mode/javascript").Mode;
    var JavaScriptHighlightRules = acerequire("ace/mode/javascript_highlight_rules").JavaScriptHighlightRules;
    var WorkerModule = acerequire("ace/worker/worker_client");
    var WorkerClient = WorkerModule.WorkerClient;
    if (!window.Worker) {
      // If we don't support web workers, do everything on the UI thread
      WorkerClient = WorkerModule.UIWorkerClient;
      window.Worker = WorkerClient;
    }

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
      // Manually create our highlight rules so that we can modify it
      this.$highlightRules = new JavaScriptHighlightRules();

      // We never want to show any of the builtin keywords in autocomplete
      this.$highlightRules.$keywordList = [];

      this.createWorker = function(session) {
        var worker = new WorkerClient(["ace"], "ace/mode/javascript_worker", "JavaScriptWorker");
        worker.attachToDocument(session.getDocument());
        var newOptions = {
          unused: true,
          undef: true,
          maxerr: 1000,
          predef: {
          },
          exported: {
          },
        };
        // Mark all of our blocks as predefined so that linter doesnt complain about
        // using undefined variables
        dropletUtils.getAllAvailableDropletBlocks(dropletConfig).forEach(function (block) {
          newOptions.predef[block.func] = false;
        });

        if (dropletConfig.additionalPredefValues) {
          dropletConfig.additionalPredefValues.forEach(function (val) {
            newOptions.predef[val] = false;
          });
        }

        // Do the same with unusedConfig if available
        if (unusedConfig) {
          unusedConfig.forEach(function (unusedVar) {
            newOptions.exported[unusedVar] = false;
          });
        }

        annotationList.attachToSession(session, dropletEditor);

        worker.send("changeOptions", [newOptions]);

        worker.on("jslint", annotationList.setJSLintAnnotations);

        worker.on("terminate", function() {
          session.clearAnnotations();
        });

        return worker;
      };

      this.cleanup = function () {
        annotationList.detachFromSession();
      };
    }).call(Mode.prototype);

  exports.Mode = Mode;
  });
};
