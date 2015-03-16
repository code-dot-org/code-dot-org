console.log('define codeorg');

// define ourselves for ace, s that it knows where to get us
ace.define("ace/mode/javascript_codeorg",["require","exports","module","ace/lib/oop","ace/mode/javascript","ace/mode/javascript_highlight_rules","ace/worker/worker_client","ace/mode/matching_brace_outdent","ace/mode/behaviour/cstyle","ace/mode/folding/cstyle","ace/config","ace/lib/net"], function(acerequire, exports, module) {

var oop = acerequire("ace/lib/oop");
var JavaScriptMode = acerequire("ace/mode/javascript").Mode;
var JavaScriptHighlightRules = acerequire("ace/mode/javascript_highlight_rules").JavaScriptHighlightRules;
var WorkerClient = acerequire("../worker/worker_client").WorkerClient;
var MatchingBraceOutdent = acerequire("./matching_brace_outdent").MatchingBraceOutdent;
var CstyleBehaviour = acerequire("./behaviour/cstyle").CstyleBehaviour;
var CStyleFoldMode = acerequire("./folding/cstyle").FoldMode;

console.log('mode-javascript_codeorg');

var Mode = function() {
    this.HighlightRules = JavaScriptHighlightRules;
    this.$outdent = new MatchingBraceOutdent();
    this.$behaviour = new CstyleBehaviour();
    this.foldingRules = new CStyleFoldMode();
};
oop.inherits(Mode, JavaScriptMode);

(function() {
  console.log('anon');

  this.createWorker = function(session) {
    console.log('createWorker');

    var worker = new WorkerClient(["ace"], "ace/mode/javascript_worker", "JavaScriptWorker");
    worker.attachToDocument(session.getDocument());

    worker.on("jslint", function(results) {
      console.log('jslint');
      session.setAnnotations(results.data);
    });

    worker.on("terminate", function() {
      session.clearAnnotations();
    });

    return worker;
  };
}).call(Mode.prototype);

exports.Mode = Mode;
});
