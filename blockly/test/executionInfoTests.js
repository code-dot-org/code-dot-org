var testUtils = require('./util/testUtils');
var assert = testUtils.assert;

var ExecutionInfo = testUtils.requireWithGlobalsCheckSrcFolder('maze/executionInfo');

describe("ExecutionInfo tests", function () {
  it("single action queue/dequeue", function () {
    var executionInfo = new ExecutionInfo();
    executionInfo.queueAction("command1", 1);
    executionInfo.queueAction("command2", 2);

    assert.equal(executionInfo.steps_.length, 2);

    var actions = executionInfo.getActions(true);
    assert.equal(actions.length, 1);
    var action = actions[0];
    assert.equal(action.command, "command1");
    assert.equal(action.blockId, 1);

    assert.equal(executionInfo.steps_.length, 1);

    actions = executionInfo.getActions();
    assert.equal(actions.length, 1);
    action = actions[0];
    assert.equal(action.command, "command2");
    assert.equal(action.blockId, 2);
  });

  it("multiple action steps: pull off one at a time", function () {
    var executionInfo = new ExecutionInfo();

    executionInfo.collectActions();
    assert.equal(executionInfo.collection_.length, 0);
    executionInfo.queueAction("step1Command1", 1);
    executionInfo.queueAction("step1Command2", 2);
    executionInfo.stopCollecting();
    assert.equal(executionInfo.collection_, null);

    executionInfo.collectActions();
    assert.equal(executionInfo.collection_.length, 0);
    executionInfo.queueAction("step2Command1", 1);
    executionInfo.queueAction("step2Command2", 2);
    executionInfo.stopCollecting();
    assert.equal(executionInfo.collection_, null);

    assert.equal(executionInfo.steps_.length, 2);

    var actions = executionInfo.getActions(true);
    assert(actions.length, 2);
    assert.equal(actions[0].command, "step1Command1");
    assert.equal(actions[1].command, "step1Command2");

    actions = executionInfo.getActions(true);
    assert(actions.length, 2);
    assert.equal(actions[0].command, "step2Command1");
    assert.equal(actions[1].command, "step2Command2");
  });

  it("multiple action steps: pull off all at once", function () {
    var executionInfo = new ExecutionInfo();

    executionInfo.collectActions();
    assert.equal(executionInfo.collection_.length, 0);
    executionInfo.queueAction("step1Command1", 1);
    executionInfo.queueAction("step1Command2", 2);
    executionInfo.stopCollecting();
    assert.equal(executionInfo.collection_, null);

    executionInfo.collectActions();
    assert.equal(executionInfo.collection_.length, 0);
    executionInfo.queueAction("step2Command1", 1);
    executionInfo.queueAction("step2Command2", 2);
    executionInfo.stopCollecting();
    assert.equal(executionInfo.collection_, null);

    assert.equal(executionInfo.steps_.length, 2);

    var actions = executionInfo.getActions(false);
    assert(actions.length, 4);
    assert.equal(actions[0].command, "step1Command1");
    assert.equal(actions[1].command, "step1Command2");
    assert.equal(actions[2].command, "step2Command1");
    assert.equal(actions[3].command, "step2Command2");
  });

  it("termination", function () {
    var executionInfo = new ExecutionInfo();

    executionInfo.queueAction("command1", 1);
    executionInfo.queueAction("command2", 2);
    executionInfo.terminateWithValue(Infinity);
    assert(executionInfo.isTerminated());
    assert.equal(executionInfo.terminationValue(), Infinity);
  });

  it("last step with finish action", function () {
    var executionInfo = new ExecutionInfo();

    executionInfo.queueAction("command1", 1);
    executionInfo.queueAction("command2", 2);
    executionInfo.queueAction("finish", 3);

    var actions = executionInfo.getActions(true);
    assert.equal(actions.length, 1);
    actions = executionInfo.getActions(true);
    assert.equal(actions.length, 2);
    assert.equal(actions[1].command, "finish");

  });

  it("last step without finish action", function () {
    var executionInfo = new ExecutionInfo();

    executionInfo.queueAction("command1", 1);
    executionInfo.queueAction("command2", 2);

    var actions = executionInfo.getActions(true);
    assert.equal(actions.length, 1);
    actions = executionInfo.getActions(true);
    assert.equal(actions.length, 1);
  });

});
